import React from 'react';
import { dispatchAlert } from '../features/alerts/alertsSlice';
import useDuckiesContract from './useDuckiesContract';
import useWallet from './useWallet';

import * as ga from '../lib/ga';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import useAffiliates from './useAffiliates';
import { isBrowser } from '../helpers/isBrowser';
import useMetaMask from './useMetaMask';
import { useEagerConnect } from './useEagerConnect';
import { supabase } from '../lib/SupabaseConnector';
import { setIsRewardsClaimProcessing } from '../features/globals/globalsSlice';

export default function useBounties(bounties: any) {
    const [isSingleBountyProcessing, setIsSingleBountyProcessing] = React.useState<boolean>(false);
    const [bountyItems, setBountyItems] = React.useState<any[]>([]);
    const [isRewardsClaimed, setIsRewardsClaimed] = React.useState<boolean>(false);
    const [isReferralClaimed, setIsReferralClaimed] = React.useState<boolean>(false);
    const [questUpdateTrigger, setQuestUpdateTrigger] = React.useState<boolean>(false);

    const dispatch = useAppDispatch();
    const duckiesContract = useDuckiesContract();
    const { active, account, signer } = useWallet();
    const { affiliates, getAffiliatesRuleCompleted } = useAffiliates();
    const { supportedChain } = useMetaMask();
    const triedToEagerConnect = useEagerConnect();

    const isRewardsClaimProcessing = useAppSelector(state => state.globals.isRewardsClaimProcessing);

    const isReady = React.useMemo(() => {
        return supportedChain && triedToEagerConnect && active && account;
    }, [supportedChain, triedToEagerConnect, active, account]);

    const referral_token = React.useMemo(() => isBrowser() && localStorage.getItem('referral_token'), []);

    React.useEffect(() => {
        if (!isReady) {
            return;
        }

        (async () => {
            const referralLimit = +await duckiesContract?.getAccountBountyLimit('referral');

            setIsReferralClaimed(!referral_token || referralLimit === 1 || affiliates[0] > 0);

            if (referralLimit === 1 || affiliates[0] > 0) {
                localStorage.removeItem('referral_token');
            }
        })();
    }, [isReady, duckiesContract, isRewardsClaimed, affiliates, referral_token]);

    React.useEffect(() => {
        if (isRewardsClaimed) {
            const newItems = bounties.map((item: any) => {
                return {
                    ...item,
                    status: '',
                }
            });

            setBountyItems(newItems);
        }
    }, [isRewardsClaimed, bounties]);

    React.useEffect(() => {
        if (bounties) {
            const newItems = bounties.map((item: any) => {
                return {
                    ...item,
                    status: '',
                }
            });

            setBountyItems(newItems);
        }
    }, [bounties, account]);

    React.useEffect(() => {
        const questUpdater = () => {
            setQuestUpdateTrigger(!questUpdateTrigger);
        };
        window.addEventListener('reloadQuest', questUpdater);

        return () => {
            window.removeEventListener('reloadQuest', questUpdater);
        };
    }, [questUpdateTrigger]);

    const getClaimedBountyInfo = React.useCallback(async (bounty: any) => {
        if (signer) {
            const bountyId = bounty.fid.split('-')[0];
            const claimedTimes = await duckiesContract?.connect(signer).getAccountBountyLimit(bounty.fid);
            let status = '';

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
                    const { data } = await supabase
                        .from('users')
                        .select('phone_verified')
                        .eq('address', account)
                        .single();

                    if (claimedTimes === bounty.limit) {
                        status = 'claimed';
                    } else if (data?.phone_verified) {
                        status = 'claim';
                    }
                    break;
                default:
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
        }
        return 0;
    }, [duckiesContract, signer, bountyItems, getAffiliatesRuleCompleted, questUpdateTrigger, account]);

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
            dispatch(setIsRewardsClaimProcessing(true));
            const { transaction } = await (await fetch(
                `/api/bountyTx?bountyID=${bountyToClaim.fid}&&account=${account}`
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
            } catch (error) {
                dispatch(dispatchAlert({
                    type: 'error',
                    title: 'Error',
                    message: 'Something went wrong! Please, try again!',
                }));
            }
            dispatch(setIsRewardsClaimProcessing(false));
        }
    }, [
        signer,
        bountyItems,
        account,
        dispatch,
        setIsRewardsClaimProcessing,
        setIsRewardsClaimed,
    ]);

    const handleClaimRewards = React.useCallback(async (amountToClaim: number, isCaptchaNotResolved: boolean, setIsCaptchaNotResolved: any, captcha: any) => {
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
                const response = await fetch(`/api/tx?token=${referral_token}&account=${account}`);

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
                    ga.event({
                        action: "duckies_claim_success",
                        params: {
                            duckies_amount_claim: 10000,
                        }
                    });
                } else {
                    localStorage.removeItem('referral_token');
                    dispatch(dispatchAlert({
                        type: 'error',
                        title: 'Error',
                        message: 'Something went wrong! Please, try again!',
                    }));
                }
            } catch (error) {
                dispatch(dispatchAlert({
                    type: 'error',
                    title: 'Error',
                    message: 'Something went wrong! Please, try again!',
                }));
            }
        } else {
            if (bountiesToClaim.length) {
                const { transaction } = await (await fetch(
                    `/api/allBountiesTx?bountyIDs=${bountiesToClaim}&account=${account}`
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
                    ga.event({
                        action: "duckies_claim_success",
                        params: {
                            duckies_amount_claim: amountToClaim,
                        }
                    });
                } catch (error) {
                    dispatch(dispatchAlert({
                        type: 'error',
                        title: 'Error',
                        message: 'Something went wrong! Please, try again!',
                    }));
                }
            }
        }

        captcha?.current?.reset();
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
        let bountyTitles: string[] = !isReferralClaimed ? ['Referral reward'] : [];

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
