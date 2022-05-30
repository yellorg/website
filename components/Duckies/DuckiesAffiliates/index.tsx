import React from 'react';
import useDuckiesContract from '../../../hooks/useDuckiesContract';
import useWallet from '../../../hooks/useWallet';
import PrismicSliceZone from '../../PrismicSliceZone';

interface DuckiesAffiliatesProps {
    bounties: any;
}

export const DuckiesAffiliates: React.FC<DuckiesAffiliatesProps> = ({ bounties }: DuckiesAffiliatesProps) => {
    const [affiliates, setAffiliates] = React.useState<number[]>([0, 0, 0, 0, 0]);
    const [payouts, setPayouts] = React.useState<number[]>([]);

    const duckiesContract = useDuckiesContract();
    const { active, account, signer } = useWallet();

    const getAffiliatesAndPayouts = React.useCallback(async() => {
        if (account && signer) {
            const affiliatesCount = await duckiesContract?.connect(signer).getAffiliatesCount();
            const payoutsCommission = await duckiesContract?.getPayouts();

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
                            </div>
                            <PrismicSliceZone slices={bounties.data.slices} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
