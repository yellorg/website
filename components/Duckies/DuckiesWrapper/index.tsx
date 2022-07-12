import React, { FC } from 'react';
import { DuckiesHero} from '../DuckiesHero';
import { DuckiesAffiliates} from '../DuckiesAffiliates';
import { DuckiesEarnMore} from '../DuckiesEarnMore';
import { DuckiesRedeem} from '../DuckiesRedeem';
import { DuckiesPrizes } from '../DuckiesPrizes'
import { DuckiesPrizesList } from '../DuckiesPrizes/defaults';
import useDuckiesContract from '../../../hooks/useDuckiesContract';
import useWallet from '../../../hooks/useWallet';
import { dispatchAlert } from '../../../features/alerts/alertsSlice';
import { useAppDispatch } from '../../../app/hooks';
import * as ga from '../../../lib/ga';
import { DuckiesFAQ } from '../DuckiesFAQ';
import { supabase } from '../../../lib/SupabaseConnector';
import { useRouter } from 'next/router';

interface DuckiesLayoutProps {
    bounties: any;
    faqList: any;
}

export const DuckiesLayout: FC<DuckiesLayoutProps> = ({ bounties, faqList }: DuckiesLayoutProps): JSX.Element => {
    const [affiliates, setAffiliates] = React.useState<number[]>([0, 0, 0, 0, 0]);
    const { items } = bounties?.data.slices[0];
    const [bountyItems, setBountyItems] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [isRewardsClaimed, setIsRewardsClaimed] = React.useState<boolean>(false);
    const [isSingleBountyProcessing, setIsSingleBountyProcessing] = React.useState<boolean>(false);
    const [isReferralClaimed, setIsReferralClaimed] = React.useState<boolean>(false);
    const [user, setUser] = React.useState<any>(null);
    const [questUpdateTrigger, setQuestUpdateTrigger] = React.useState<boolean>(false);

    const dispatch = useAppDispatch();
    const duckiesContract = useDuckiesContract();
    const router = useRouter();
    const query = router.query;
    const { active, account, signer } = useWallet();
    const supabaseUser = supabase.auth.user();

    const getAffiliates = React.useCallback(async() => {
        if (account && signer) {
            const affiliatesCount = await duckiesContract?.connect(signer).getAffiliatesCount();

            setAffiliates(affiliatesCount);
        }
    }, [account, duckiesContract, signer]);

    React.useEffect(() => {
        if (query.error) {
            dispatch(dispatchAlert({
                type: 'error',
                title: 'Server error',
                message: query.error_description?.toString() || '',
            }));
        }
        router.replace('/duckies');
    }, []);

    React.useEffect(() => {
        if (supabaseUser && !user) {
            setUser(supabaseUser);
        }
    }, [supabaseUser, user]);

    React.useEffect(() => {
        const questUpdater = () => {
            setQuestUpdateTrigger(!questUpdateTrigger);
        };
        window.addEventListener('reloadQuest', questUpdater);

        return () => {
            window.removeEventListener('reloadQuest', questUpdater);
        };
    }, [questUpdateTrigger]);

    React.useEffect(() => {
        if (items && isRewardsClaimed) {
            const newItems = items.map((item: any) => {
                return {
                    ...item,
                    status: '',
                }
            });

            setBountyItems(newItems);
        }
    }, [isRewardsClaimed, items]);

    React.useEffect(() => {
        if (active && account) {
            getAffiliates();
        }
    }, [active, account, getAffiliates]);

    const getAffiliatesCountOnLevel = React.useCallback((level: string, value: string): boolean => {
        return affiliates[+level - 1] < +value ? false : true;
    }, [affiliates]);

    const getAffiliatesRuleCompleted = React.useCallback((level: string, key: string, value: string): boolean => {
        switch (key) {
            case 'count':
                const [_, levelNumber] = level.split('-');

                return getAffiliatesCountOnLevel(levelNumber, value);
            default:
                return false;
        }
    }, [getAffiliatesCountOnLevel]);

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
    }, [duckiesContract, signer, bountyItems, getAffiliatesRuleCompleted, questUpdateTrigger]);

    React.useEffect(() => {
        if (items) {
            const newItems = items.map((item: any) => {
                return {
                    ...item,
                    status: '',
                }
            });

            setBountyItems(newItems);
        }
    }, [items, account]);

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

    const handleClaimAllBounties = React.useCallback(async (amountToClaim: number) => {
        if (bountiesToClaim.length && signer) {
            const { transaction } = await (await fetch(
                `/api/allBountiesTx?bountyIDs=${bountiesToClaim}&account=${account}`
            )).json();

            try {
                const tx = await signer.sendTransaction(transaction);
                await tx.wait();
                dispatch((dispatchAlert({
                    type: 'success',
                    title: 'Success',
                    message: 'You have successfully claimed the reward!',
                })));
                setIsRewardsClaimed(true);
                ga.event({
                    action: "duckies_claim_success",
                    params: {
                        duckies_amount_claim: amountToClaim,
                    }
                });
            } catch (error) {
                dispatch((dispatchAlert({
                    type: 'error',
                    title: 'Error',
                    message: 'Something went wrong! Please, try again!',
                })));
            }
        }
    }, [signer, account, bountiesToClaim]);

    return (
        <main className="bg-primary-cta-color-60 pb-[5rem] md:pb-[7.5rem]">
            <DuckiesHero
                bountiesToClaim={bountiesToClaim}
                handleClaimAllBounties={handleClaimAllBounties}
                bountyItems={bountyItems}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                isRewardsClaimed={isRewardsClaimed}
                setIsRewardsClaimed={setIsRewardsClaimed}
                affiliates={affiliates}
                isSingleBountyProcessing={isSingleBountyProcessing}
                isReferralClaimed={isReferralClaimed}
                setIsReferralClaimed={setIsReferralClaimed}
                supabaseUser={user}
            />
            <DuckiesAffiliates
                bountyItems={bountyItems}
                bountiesToClaim={bountiesToClaim}
                bountyTitle={bounties.data.title}
                affiliates={affiliates}
                handleClaimAllBounties={handleClaimAllBounties}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setIsRewardsClaimed={setIsRewardsClaimed}
                isSingleBountyProcessing={isSingleBountyProcessing}
                setIsSingleBountyProcessing={setIsSingleBountyProcessing}
                isReferralClaimed={isReferralClaimed}
                supabaseUser={user}
            />
            <DuckiesEarnMore />
            <DuckiesPrizes prizes={DuckiesPrizesList} />
            <DuckiesRedeem />
            <DuckiesFAQ
                faqList={faqList}
            />
        </main>
    );
};
