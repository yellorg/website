import React from 'react';
import useDuckiesContract from '../../../hooks/useDuckiesContract';
import useWallet from '../../../hooks/useWallet';
import { SimplePagination } from '../../Pagination/SimplePagination';
import { BountyItem, BountyRow } from '../BountyRow';
import UnloginEyes from '../UnloginEyes';

interface DuckiesAffiliatesProps {
    bountyItems: BountyItem[];
    bountyTitle: string;
    affiliates: number[];
    bountiesToClaim: string[];
    handleClaimAllBounties: () => void;
}

export const DuckiesAffiliates: React.FC<DuckiesAffiliatesProps> = ({
    bountyItems,
    bountyTitle,
    affiliates,
    bountiesToClaim,
    handleClaimAllBounties,
}: DuckiesAffiliatesProps) => {
    const [payouts, setPayouts] = React.useState<number[]>([]);

    const duckiesContract = useDuckiesContract();
    const { active, account, signer } = useWallet();

    const getPayouts = React.useCallback(async() => {
        if (account && signer) {
            const payoutsCommission = await duckiesContract?.getReferralPayouts();

            setPayouts(payoutsCommission);
        }
    }, [account, duckiesContract, signer]);

    React.useEffect(() => {
        if (active && account) {
            getPayouts();
        }
    }, [active, account, getPayouts]);

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

    const renderBountySlices = React.useMemo(() => {
        return bountyItems.map((bounty: BountyItem, index: number) => {
            return (
                <React.Fragment key={`bounty-${bounty.fid}`}>
                    <BountyRow bounty={bounty} handleClaim={handleClaimReward} index={index + 1} />
                </React.Fragment>
            );
        });
    }, [bountyItems, handleClaimReward]);

    return (
        <div className="duckies-affiliates">
            <div className="container">
                <div className="duckies-affiliates__row">
                    <div className="duckies-affiliates__row-info">
                        <div className="table">
                            <div className="table-title">
                                Affiliates
                            </div>
                            <UnloginEyes>
                                {renderAffiliateLevels}
                            </UnloginEyes>
                        </div>
                    </div>
                    <div className="duckies-affiliates__row-bounties">
                        <div className="table">
                            <div className="table-title">
                                {bountyTitle}
                                {bountiesToClaim.length > 1 && (
                                    <div onClick={handleClaimAllBounties} className="button button--outline button--secondary button--shadow-secondary">
                                        <span className="button__inner">Claim All</span>
                                    </div>)
                                }
                            </div>
                            <UnloginEyes>
                                {renderBountySlices}
                                <SimplePagination
                                    page={1}
                                    limit={10}
                                    nextPageExists={true}
                                    handleClickNextButton={() => console.log('test')}
                                    handleClickPrevButton={() => console.log('test')}
                                    total={15}
                                    shouldRenderTotal={true}
                                />
                            </UnloginEyes>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
