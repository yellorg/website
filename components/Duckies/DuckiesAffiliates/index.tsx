import React from 'react';
import useDuckiesContract from '../../../hooks/useDuckiesContract';
import useWallet from '../../../hooks/useWallet';
import PrismicSliceZone from '../../PrismicSliceZone';

const affiliateLevels = [
    {
        id: 1,
        commission: '500',
        count: 23,
    },
    {
        id: 2,
        commission: '125',
        count: 23,
    },
    {
        id: 3,
        commission: '50',
        count: 23,
    },
    {
        id: 4,
        commission: '20',
        count: 23,
    },
    {
        id: 5,
        commission: '10',
        count: 23,
    },
];

const bounties = [
    {
        title: 'Recruit 25 Affiliates level 1',
        subtitle: 'With more friends you recruit',
        value: '70,000',
    },
    {
        title: 'Comment this Tweet',
        subtitle: 'React & Bootstrap Framework',
        value: '135,000',
    },
    {
        title: 'Design your pixel art Ducky',
        subtitle: 'Bootstrap Framework',
        value: '1,230,000',
    },
    {
        title: 'Create a DAO for your affiliates',
        subtitle: 'Tailwind, React',
        value: '440,000',
    },
    {
        title: 'Clap on this medium article',
        subtitle: 'Vue Js, Tailwind',
        value: '1,394 ',
    },
];

export const DuckiesAffiliates = ({ bounties }: any) => {
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
    }, [account, duckiesContract]);

    React.useEffect(() => {
        if (active && account) {
            getAffiliatesAndPayouts();
        }
    }, [active, account]);

    const renderAffiliateLevels = React.useMemo(() => {
        return affiliates.map((affiliateCount: number, index: number) => {
            return (
                <div className="table-row" key={`affiliate-${index}`}>
                    <div className="table-row-key">
                        <div className="table-row-key-title">
                            Level {index}
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
