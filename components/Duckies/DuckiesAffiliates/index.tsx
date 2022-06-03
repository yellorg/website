import React from 'react';
import useDuckiesContract from '../../../hooks/useDuckiesContract';
import useWallet from '../../../hooks/useWallet';
import { BountyItem, BountyRow } from '../BountyRow';

interface DuckiesAffiliatesProps {
    bounties: any;
}

export const DuckiesAffiliates: React.FC<DuckiesAffiliatesProps> = ({ bounties }: DuckiesAffiliatesProps) => {
    const [affiliates, setAffiliates] = React.useState<number[]>([0, 0, 0, 0, 0]);
    const [payouts, setPayouts] = React.useState<number[]>([]);
    const { items } = bounties.data.slices[0];
    const [bountyItems, setBountyItems] = React.useState<any[]>([]);

    const duckiesContract = useDuckiesContract();
    const { active, account, signer } = useWallet();

    const getAffiliatesAndPayouts = React.useCallback(async() => {
        if (account && signer) {
            const affiliatesCount = await duckiesContract?.connect(signer).getAffiliatesCount();
            const payoutsCommission = await duckiesContract?.getReferralPayouts();

            setAffiliates(affiliatesCount);
            setPayouts(payoutsCommission);
        }
    }, [account, duckiesContract, signer]);

    React.useEffect(() => {
        if (active && account) {
            getAffiliatesAndPayouts();
        }
    }, [active, account, getAffiliatesAndPayouts]);

    const renderAffiliateLevels = React.useMemo(() => {
        return affiliates.map((affiliateCount: number, index: number) => {
            return (
                <div className="table-row" key={`affiliate-${index}`}>
                    <div className="table-row-key">
                        <div className="table-row-key-title">
                            Level {index + 1}
                        </div>
                        <div className="table-row-key-subtitle">
                            {payouts && payouts[index] ? `${payouts[index]}% commission` : ''}
                        </div>
                    </div>
                    <div className="table-row-value">
                        {affiliateCount}
                    </div>
                </div>
            );
        });
    }, [affiliates, payouts]);

    const handleClaimReward = React.useCallback(async (id: string) => {
        const bountyToClaim = bountyItems.find((item: BountyItem) => item.fid === id);

        if (bountyToClaim && signer) {
            const { transaction } = await (await fetch(
                `/api/bountyTx?bountyID=${bountyToClaim.fid}&&account=${account}`
            )).json();

            try {
                const tx = await signer.sendTransaction(transaction);
                await tx.wait();
            } catch (error) {
                console.log(error);
            }
        }
    }, [signer, bountyItems, account]);

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
    }, [items]);

    React.useEffect(() => {
        if (bountyItems.length) {
            bountyItems.forEach((bounty: any) => {
                getClaimedBountyInfo(bounty);
            });
        }
    }, [bountyItems, getClaimedBountyInfo]);

    const renderBountySlices = React.useMemo(() => {
        return bountyItems.map((bounty: BountyItem, index: number) => {
            return (
                <React.Fragment key={`bounty-${bounty.fid}`}>
                    <BountyRow bounty={bounty} handleClaim={handleClaimReward} index={index + 1} />
                </React.Fragment>
            );
        });
    }, [bountyItems, handleClaimReward]);

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
            } catch (error) {
                console.log(error);
            }
        }
    }, [signer, account, bountiesToClaim]);

    return (
        <div className="duckies-affiliates">
            <div className="container">
                <div className="duckies-affiliates__row">
                    <div className="duckies-affiliates__row-info">
                        <div className="table">
                            <div className="table-title">
                                Affiliates
                            </div>
                            {renderAffiliateLevels}
                        </div>
                    </div>
                    <div className="duckies-affiliates__row-bounties">
                        <div className="table">
                            <div className="table-title">
                                {bounties.data.title}
                                {bountiesToClaim.length > 1 && (
                                    <div onClick={handleClaimAllBounties} className="button button--outline button--secondary button--shadow-secondary">
                                        <span className="button__inner">Claim All</span>
                                    </div>)
                                }
                            </div>
                            {renderBountySlices}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
