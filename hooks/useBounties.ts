import React from 'react';
import { dispatchAlert } from '../features/alerts/alertsSlice';
import useDuckiesContract from './useDuckiesContract';
import useWallet from './useWallet';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import useAffiliates from './useAffiliates';
import { isBrowser } from '../helpers/isBrowser';
import useMetaMask from './useMetaMask';
import { useEagerConnect } from './useEagerConnect';
import { setIsPhoneOtpCompleted, setIsRewardsClaimProcessing } from '../features/globals/globalsSlice';
import jwt from 'jsonwebtoken';
import { analytics } from '../lib/analitics';

export default function useBounties(bounties: any) {
    const [isSingleBountyProcessing, setIsSingleBountyProcessing] = React.useState<boolean>(false);
    const [bountyItems, setBountyItems] = React.useState<any[]>([]);
    const [isRewardsClaimed, setIsRewardsClaimed] = React.useState<boolean>(false);
    const [isReferralClaimed, setIsReferralClaimed] = React.useState<boolean>(false);
    const [phoneVerified, setIsPhoneVerified] = React.useState<boolean>(false);

    const dispatch = useAppDispatch();
    const duckiesContract = useDuckiesContract();
    const { active, account, signer } = useWallet();
    const { affiliates, getAffiliatesRuleCompleted } = useAffiliates();
    const { supportedChain } = useMetaMask();
    const triedToEagerConnect = useEagerConnect();

    const isRewardsClaimProcessing = useAppSelector(state => state.globals.isRewardsClaimProcessing);
    const isPhoneOtpCompleted = useAppSelector(state => state.globals.isPhoneOtpCompleted);

    const isReady = React.useMemo(() => {
        return supportedChain && triedToEagerConnect && active && account;
    }, [supportedChain, triedToEagerConnect, active, account]);

    const referral_token = React.useMemo(() => isBrowser() && localStorage.getItem('referral_token'), []);

    React.useEffect(() => {
        if (!isReady || !signer) {
            return;
        }

        (async () => {
            const referralLimit = +await duckiesContract?.connect(signer).getAccountBountyLimit('referral');
            setIsReferralClaimed(!referral_token || referralLimit === 1 || affiliates[0] > 0);
        })();
    }, [isReady, duckiesContract, isRewardsClaimed, affiliates, referral_token, signer]);

    const getIsPhoneVerified = React.useCallback(async () => {
        if (account) {
            const { isPhoneVerified } = await (await fetch('/api/private/users/me', {
                method: 'POST',
                body: jwt.sign({
                    account,
                }, process.env.NEXT_PUBLIC_JWT_PRIVATE_KEY || ''),
            })).json();

            setIsPhoneVerified(isPhoneVerified);
        }
    }, [account]);

    React.useEffect(() => {
        if (signer) {
            getIsPhoneVerified();
        }
    }, [signer, phoneVerified, account]);

    React.useEffect(() => {
        if (isRewardsClaimed || isPhoneOtpCompleted) {
            const newItems = bounties.map((item: any) => {
                return {
                    ...item,
                    status: '',
                }
            });

            if (isPhoneOtpCompleted) {
                dispatch(setIsPhoneOtpCompleted(false));
            }

            setBountyItems(newItems);
            getIsPhoneVerified();
        }
    }, [
        isRewardsClaimed,
        bounties,
        account,
        isPhoneOtpCompleted,
        getIsPhoneVerified,
        dispatch,
    ]);

    React.useEffect(() => {
        if (bounties && account && !bountyItems.length) {
            const newItems = bounties.map((item: any) => {
                return {
                    ...item,
                    status: '',
                }
            });

            setBountyItems(newItems);
        }
    }, [bounties, account]);

    const getClaimedBountyInfo = React.useCallback(async (bounty: any) => {
        let status = '';

        if (signer && !isRewardsClaimProcessing) {
            const bountyId = bounty.fid.split('-')[0];
            const claimedTimes = await duckiesContract?.connect(signer).getAccountBountyLimit(bounty.fid);

            switch (bountyId) {
                case 'affiliates':
                    const [level, key, value] = bounty.triggerPhrase.split(' ');
                    const result = getAffiliatesRuleCompleted(level, key, value);

                    if (claimedTimes === bounty.limit) {
                        status = 'claimed';
                    } else {
                        if (result) {
                            status = 'claim';
                        }
                    }
                    break;
                case 'phone':
                    if (claimedTimes === bounty.limit) {
                        status = 'claimed';
                    } else if (phoneVerified) {
                        status = 'claim';
                    }
                    break;
                default:
            }
        }

        const bountyIndex = bountyItems.findIndex((item => item.fid === bounty.fid));

        if (bountyIndex !== -1 && bountyItems[bountyIndex].status !== status) {
            const newBountyItems = [...bountyItems];

            newBountyItems[bountyIndex] = {
                ...bounty,
                status,
            }
            setBountyItems(newBountyItems);
        }
        return 0;
    }, [
        duckiesContract,
        signer,
        bountyItems,
        getAffiliatesRuleCompleted,
        phoneVerified,
        isRewardsClaimProcessing,
    ]);

    React.useEffect(() => {
        if (bountyItems.length) {
            bountyItems.forEach((bounty: any) => {
                getClaimedBountyInfo(bounty);
            });
        }
    }, [bountyItems, getClaimedBountyInfo, account]);

    const bountiesToClaim = React.useMemo(() => {
        return bountyItems
            .filter(bounty => bounty.status === 'claim')
            .map(item => item.fid);
    }, [bountyItems]);

    const handleClaimReward = React.useCallback(async (id: string, isCaptchaNotResolved: boolean) => {
        const bountyToClaim = bountyItems.find((item: any) => item.fid === id);

        if (bountyToClaim && signer && !isCaptchaNotResolved) {
            analytics({
                type: 'otherEvent',
                name: 'duckies_modal_claim_rewards',
                params: {
                    duckies_amount_claim: bountyToClaim.value,
                },
            });
            dispatch(setIsRewardsClaimProcessing(true));
            const { transaction } = await (await fetch(
                `/api/private/tx/bounty?bountyID=${bountyToClaim.fid}&&account=${account}`
            )).json();

            try {
                const tx = await signer.sendTransaction(transaction);
                await tx.wait();
                dispatch(dispatchAlert({
                    type: 'success',
                    title: 'Success',
                    message: 'You have successfully claimed the reward!',
                }));
                setIsRewardsClaimed(true);
                analytics({
                    type: 'otherEvent',
                    name: 'duckies_claim_rewards_success',
                    params: {
                        duckies_amount_claim: bountyToClaim.value,
                    },
                });
            } catch (error) {
                dispatch(dispatchAlert({
                    type: 'error',
                    title: 'Error',
                    message: 'Something went wrong! Please, try again!',
                }));
                analytics({
                    type: 'otherEvent',
                    name: 'duckies_error',
                    params: {
                        errorMessage: 'Something went wrong during reward claim',
                    },
                });
            }
            dispatch(setIsRewardsClaimProcessing(false));
        }
    }, [
        signer,
        bountyItems,
        account,
        dispatch,
        setIsRewardsClaimed,
    ]);

    const handleClaimRewards = React.useCallback(async (amountToClaim: number, isCaptchaNotResolved: boolean, setIsCaptchaNotResolved: any, setShouldResetCaptcha: (value: boolean) => void) => {
        if (!signer
            || !account
            || isRewardsClaimProcessing
            || isSingleBountyProcessing
            || (isReferralClaimed && !bountiesToClaim.length)
            || isCaptchaNotResolved
        ) {
            return;
        }
        dispatch(setIsRewardsClaimProcessing(true));

        if (!isReferralClaimed && referral_token) {
            try {
                analytics({
                    type: 'otherEvent',
                    name: 'duckies_modal_claim_rewards',
                    params: {
                        duckies_amount_claim: 10000,
                    },
                });
                const response = await fetch(`/api/private/tx/referral?token=${referral_token}&account=${account}`);

                if (response.status !== 400 && response.status !== 500) {
                    const { transaction } = await response.json();

                    const tx = await signer.sendTransaction(transaction);
                    await tx.wait();
                    localStorage.removeItem('referral_token');
                    dispatch(dispatchAlert({
                        type: 'success',
                        title: 'Success',
                        message: 'You have successfully claimed the reward!',
                    }));
                    setIsRewardsClaimed(true);
                    analytics({
                        type: 'otherEvent',
                        name: 'duckies_claim_rewards_success',
                        params: {
                            duckies_amount_claim: 10000,
                        },
                    });
                } else {
                    localStorage.removeItem('referral_token');
                    dispatch(dispatchAlert({
                        type: 'error',
                        title: 'Error',
                        message: 'Something went wrong! Please, try again!',
                    }));
                    analytics({
                        type: 'otherEvent',
                        name: 'duckies_error',
                        params: {
                            errorMessage: 'Something went wrong during rewards claim',
                        },
                    });
                }
            } catch (error) {
                dispatch(dispatchAlert({
                    type: 'error',
                    title: 'Error',
                    message: 'Something went wrong! Please, try again!',
                }));
                analytics({
                    type: 'otherEvent',
                    name: 'duckies_error',
                    params: {
                        errorMessage: 'Something went wrong during rewards claim',
                    },
                });
            }
        } else {
            if (bountiesToClaim.length) {
                analytics({
                    type: 'otherEvent',
                    name: 'duckies_modal_claim_rewards',
                    params: {
                        duckies_amount_claim: amountToClaim,
                    },
                });
                const { transaction } = await (await fetch(
                    `/api/private/tx/bountyAll?bountyIDs=${bountiesToClaim}&account=${account}`
                )).json();

                try {
                    const tx = await signer.sendTransaction(transaction);
                    await tx.wait();
                    dispatch(dispatchAlert({
                        type: 'success',
                        title: 'Success',
                        message: 'You have successfully claimed the reward!',
                    }));
                    setIsRewardsClaimed(true);
                    analytics({
                        type: 'otherEvent',
                        name: 'duckies_claim_rewards_success',
                        params: {
                            duckies_amount_claim: amountToClaim,
                        },
                    });
                } catch (error) {
                    dispatch(dispatchAlert({
                        type: 'error',
                        title: 'Error',
                        message: 'Something went wrong! Please, try again!',
                    }));
                    analytics({
                        type: 'otherEvent',
                        name: 'duckies_error',
                        params: {
                            errorMessage: 'Something went wrong during rewards claim',
                        },
                    });
                }
            }
        }

        setShouldResetCaptcha(true);
        setIsCaptchaNotResolved(true);
        dispatch(setIsRewardsClaimProcessing(false));
    }, [
        account,
        signer,
        isRewardsClaimProcessing,
        isSingleBountyProcessing,
        isReferralClaimed,
        bountiesToClaim,
        dispatch,
        referral_token,
    ]);

    const getBountiesClaimableAmount = React.useCallback(() => {
        let amountToClaim = !isReferralClaimed ? 10000 : 0;
        let bountyTitles: string[] = !isReferralClaimed ? ['Newcomer reward'] : [];

        bountiesToClaim.forEach((bountyItem: string) => {
            const bounty = bountyItems.find(item => item.fid === bountyItem);

            if (bounty) {
                amountToClaim += bounty.value;
                bountyTitles.push(bounty.title);
            }
        });

        return [amountToClaim as number, bountyTitles as string[]];
    }, [bountyItems, bountiesToClaim, isReferralClaimed]);

    return {
        bountyItems,
        bountiesToClaim,
        handleClaimReward,
        isRewardsClaimProcessing,
        isRewardsClaimed,
        setIsRewardsClaimed,
        isSingleBountyProcessing,
        setIsSingleBountyProcessing,
        isReferralClaimed,
        setIsReferralClaimed,
        handleClaimRewards,
        referral_token,
        getBountiesClaimableAmount,
    };
}
