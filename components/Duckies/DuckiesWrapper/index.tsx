import React, { FC } from 'react';
import { DuckiesHero} from '../DuckiesHero';
import { DuckiesAffiliates} from '../DuckiesAffiliates';
import { DuckiesEarnMore} from '../DuckiesEarnMore';
import { DuckiesRedeem} from '../DuckiesRedeem';
import useDuckiesContract from '../../../hooks/useDuckiesContract';
import useWallet from '../../../hooks/useWallet';
import { dispatchAlert } from '../../../features/alerts/alertsSlice';
import { useAppDispatch } from '../../../app/hooks';

interface DuckiesLayoutProps {
    bounties: any;
}

export const DuckiesLayout: FC<DuckiesLayoutProps> = ({ bounties }: DuckiesLayoutProps): JSX.Element => {
    const [affiliates, setAffiliates] = React.useState<number[]>([0, 0, 0, 0, 0]);
    const { items } = bounties?.data.slices[0];
    const [bountyItems, setBountyItems] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [isRewardsClaimed, setIsRewardsClaimed] = React.useState<boolean>(false);

    const dispatch = useAppDispatch();
    const duckiesContract = useDuckiesContract();
    const { active, account, signer } = useWallet();

    const getAffiliates = React.useCallback(async() => {
        if (account && signer) {
            const affiliatesCount = await duckiesContract?.connect(signer).getAffiliatesCount();

            setAffiliates(affiliatesCount);
        }
    }, [account, duckiesContract, signer]);

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
    }, [duckiesContract, signer, bountyItems, getAffiliatesRuleCompleted]);

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

    const handleClaimAllBounties = React.useCallback(async () => {
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
                    message: 'You were successfully claimed the reward!',
                })));
                setIsRewardsClaimed(true);
            } catch (error) {
                dispatch((dispatchAlert({
                    type: 'error',
                    title: 'Error',
                    message: 'Something were wrong! Please, try again!',
                })));
            }
        }
    }, [signer, account, bountiesToClaim]);

    return (
        <main className="duckies container">
            <DuckiesHero
                bountiesToClaim={bountiesToClaim}
                handleClaimAllBounties={handleClaimAllBounties}
                bountyItems={bountyItems}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                isRewardsClaimed={isRewardsClaimed}
                setIsRewardsClaimed={setIsRewardsClaimed}
                affiliates={affiliates}
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
            />
            <DuckiesEarnMore />
            <DuckiesRedeem />
        </main>
    );
};
