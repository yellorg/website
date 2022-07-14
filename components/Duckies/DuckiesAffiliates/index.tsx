import React, { useEffect, useState } from 'react';
import useDuckiesContract from '../../../hooks/useDuckiesContract';
import useWallet from '../../../hooks/useWallet';
import { SimplePagination } from '../../Pagination/SimplePagination';
import { BountyItem, BountyRow } from '../BountyRow';
import UnloginEyes from '../UnloginEyes';
import * as ga from '../../../lib/ga';
import useBounties from '../../../hooks/useBounties';
import useAffiliates from '../../../hooks/useAffiliates';
import { useAppSelector } from '../../../app/hooks';

interface DuckiesAffiliatesProps {
    bountyTitle: string;
    supabaseUser: any;
    bountiesItems: any;
    handleOpenModal: () => void;
}

export const DuckiesAffiliates: React.FC<DuckiesAffiliatesProps> = ({
    bountyTitle,
    supabaseUser,
    bountiesItems,
    handleOpenModal,
}: DuckiesAffiliatesProps) => {
    const limit: number = 5;

    const { affiliates } = useAffiliates();
    const {
        bountiesToClaim,
        bountyItems,
        isSingleBountyProcessing,
        setIsSingleBountyProcessing,
        handleClaimReward,
    } = useBounties(bountiesItems);
    const isRewardsClaimProcessing = useAppSelector(state => state.globals.isRewardsClaimProcessing);

    const [bounties, setBounties] = useState<BountyItem[]>([]);
    const [page, setPage] = useState<number>(1);
    const [payouts, setPayouts] = useState<number[]>([]);

    const duckiesContract = useDuckiesContract();
    const { active, account, signer } = useWallet();

    const getPayouts = React.useCallback(async() => {
        if (account && signer) {
            const payoutsValues = await duckiesContract?.getPayouts();

            setPayouts(payoutsValues);
        }
    }, [account, duckiesContract, signer]);

    React.useEffect(() => {
        if (active && account) {
            getPayouts();
        }
    }, [active, account, getPayouts]);

    useEffect(() => {
        if (bountyItems && bountyItems.length) {
            const paginationBounties = [];

            for (let index = (page * limit - limit); index < limit * page; index++) {
                const element = bountyItems[index];

                element && paginationBounties.push(element);
            }

            setBounties(paginationBounties)
        }
    }, [bountyItems, page]);

    const renderAffiliateLevels = React.useMemo(() => {
        return affiliates.map((affiliateCount: number, index: number) => {
            return (
                <div
                    className="flex w-full items-center justify-between py-2 border-b border-divider-color-40"
                    key={`affiliate-${index}`}
                >
                    <div className="flex flex-col font-metro-semibold">
                        <div className="text-xl text-text-color-100">
                            Level {index + 1} invitees
                        </div>
                        <div className="text-base text-text-color-60 cursor-pointer flex items-center w-fit">
                            {payouts?.[index] ? `${payouts[index]}% bonus` : ''}
                        </div>
                    </div>
                    <div className="text-2xl flex items-center font-gilmer-medium text-text-color-100">
                        {affiliateCount}
                    </div>
                </div>
            );
        });
    }, [affiliates, payouts]);

    const renderBountySlices = React.useMemo(() => {
        return bounties.map((bounty: BountyItem, index: number) => {
            return (
                <React.Fragment key={`bounty-${bounty.fid}`}>
                    <BountyRow
                        bounty={bounty}
                        handleClaim={handleClaimReward}
                        index={((page - 1) * limit) + index + 1}
                        isLoading={isRewardsClaimProcessing}
                        isSingleBountyProcessing={isSingleBountyProcessing}
                        setIsSingleBountyProcessing={setIsSingleBountyProcessing}
                        supabaseUser={supabaseUser}
                    />
                </React.Fragment>
            );
        });
    }, [
        bounties,
        page,
        isRewardsClaimProcessing,
        isSingleBountyProcessing,
        supabaseUser,
    ]);

    const handleClickNextButton = React.useCallback((value: number) => {
        setPage(value + 1);
        setBounties([]);

        ga.event({
            action: "duckies_bounty_next_click",
        });
    }, []);

    const handleClickPrevButton = React.useCallback((value: number) => {
        setPage(value - 1);
        setBounties([]);

        ga.event({
            action: "duckies_bounty_previous_click",
        });
    }, []);

    return (
        <React.Fragment>
            <div className="pt-8 pb-44 mx-auto bg-primary-cta-color-90 duckies-affiliates">
                <div className="mx-auto p-0 w-full max-w-full max-w-md-layout 2xl:max-w-lg-layout-2p">
                    <div className="flex w-full overflow-x-auto overflow-y-hidden px-4 no-scrollbar">
                        <div className="mr-6 w-1/4 min-w-[18.75rem]">
                            <div className="h-full border-2 rounded p-6 border-text-color-90 bg-body-background-color">
                                <div className="font-gilmer-bold text-4xl text-text-color-100">
                                    Your Team
                                </div>
                                <UnloginEyes>
                                    {renderAffiliateLevels}
                                </UnloginEyes>
                            </div>
                        </div>
                        <div className="w-full min-w-[40.625rem]">
                            <div className="h-full border-2 rounded p-6 border-text-color-90 bg-body-background-color">
                                <div className="font-gilmer-bold text-4xl text-text-color-100 flex justify-between mb-2">
                                    {bountyTitle}
                                    {bountiesToClaim.length > 1 && (
                                        <div onClick={handleOpenModal} className="button button--outline button--secondary button--shadow-secondary">
                                            <span className="button__inner">Claim All</span>
                                        </div>
                                    )}
                                </div>
                                <UnloginEyes isReversed={true} paginationComponent={
                                    <SimplePagination
                                        page={page}
                                        limit={limit}
                                        nextPageExists={page * limit < bountyItems.length}
                                        handleClickNextButton={handleClickNextButton}
                                        handleClickPrevButton={handleClickPrevButton}
                                        totalValue={bountyItems.length}
                                        total={bounties.length}
                                        shouldRenderTotal={true}
                                    />
                                }>
                                    {renderBountySlices}
                                </UnloginEyes>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};
