import React, { useEffect, useState } from 'react';
import useDuckiesContract from '../../../hooks/useDuckiesContract';
import useWallet from '../../../hooks/useWallet';
import { SimplePagination } from '../../Pagination/SimplePagination';
import { BountyItem, BountyRow } from '../BountyRow';
import { DuckiesConnectorModalWindow } from '../DuckiesConnectModalWindow';
import UnloginEyes from '../UnloginEyes';
import Image from 'next/image';
import { dispatchAlert } from '../../../features/alerts/alertsSlice';
import { useAppDispatch } from '../../../app/hooks';

import * as ga from '../../../lib/ga';

interface DuckiesAffiliatesProps {
    bountyItems: BountyItem[];
    bountyTitle: string;
    affiliates: number[];
    bountiesToClaim: string[];
    handleClaimAllBounties: (amountToClaim: number) => void;
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
    setIsRewardsClaimed: (value: boolean) => void;
    isSingleBountyProcessing: boolean;
    setIsSingleBountyProcessing: (value: boolean) => void;
    isReferralClaimed: boolean;
}

export const DuckiesAffiliates: React.FC<DuckiesAffiliatesProps> = ({
    bountyItems,
    bountyTitle,
    affiliates,
    bountiesToClaim,
    handleClaimAllBounties,
    isLoading,
    setIsLoading,
    setIsRewardsClaimed,
    isSingleBountyProcessing,
    setIsSingleBountyProcessing,
    isReferralClaimed,
}: DuckiesAffiliatesProps) => {
    const limit: number = 5;

    const [bounties, setBounties] = useState<BountyItem[]>([]);
    const [page, setPage] = useState<number>(1);
    const [payoutsReferral, setPayoutsReferral] = useState<number[]>([]);
    const [payoutsBounty, setPayoutsBounty] = useState<number[]>([]);
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

    const dispatch = useAppDispatch();
    const duckiesContract = useDuckiesContract();
    const { active, account, signer } = useWallet();

    const getPayouts = React.useCallback(async() => {
        if (account && signer) {
            const payoutsReferralValues = await duckiesContract?.getReferralPayouts();
            const payoutsBountyValues = await duckiesContract?.getBountyPayouts();

            setPayoutsReferral(payoutsReferralValues);
            setPayoutsBounty(payoutsBountyValues);
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
    }, [bountyItems, page])

    const renderAffiliateLevels = React.useMemo(() => {
        return affiliates.map((affiliateCount: number, index: number) => {
            return (
                <div className="table-row" key={`affiliate-${index}`}>
                    <div className="table-row-key">
                        <div className="table-row-key-title">
                            Level {index + 1}
                        </div>
                        <div className="table-row-key-subtitle">
                            {payoutsReferral?.[index] ? `${payoutsReferral[index]}% commission / ` : ''}
                            {payoutsBounty?.[index] ? `${payoutsBounty[index]}% bounty` : ''}
                        </div>
                    </div>
                    <div className="table-row-value">
                        {affiliateCount}
                    </div>
                </div>
            );
        });
    }, [affiliates, payoutsReferral, payoutsBounty]);

    const handleClaimReward = React.useCallback(async (id: string) => {
        const bountyToClaim = bountyItems.find((item: BountyItem) => item.fid === id);

        if (bountyToClaim && signer) {
            setIsLoading(true);
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
            setIsLoading(false);
        }
    }, [signer, bountyItems, account]);

    const renderBountySlices = React.useMemo(() => {
        return bounties.map((bounty: BountyItem, index: number) => {
            return (
                <React.Fragment key={`bounty-${bounty.fid}`}>
                    <BountyRow
                        bounty={bounty}
                        handleClaim={handleClaimReward}
                        index={((page - 1) * limit) + index + 1}
                        isLoading={isLoading}
                        isSingleBountyProcessing={isSingleBountyProcessing}
                        setIsSingleBountyProcessing={setIsSingleBountyProcessing}
                    />
                </React.Fragment>
            );
        });
    }, [bounties, handleClaimReward, page, isLoading, isSingleBountyProcessing]);

    const getBountiesClaimableAmount = React.useCallback(() => {
        let amountToClaim = 0;
        let bountyTitles: string[] = [];

        bountiesToClaim.forEach((bountyItem: string) => {
            const bounty = bountyItems.find(item => item.fid === bountyItem);

            if (bounty) {
                amountToClaim += bounty.value;
                bountyTitles.push(bounty.title);
            }
        });

        return [amountToClaim as number, bountyTitles as string[]];
    }, [bountyItems, bountiesToClaim]);

    const renderLoadingModalBody = React.useMemo(() => {
        return (
            <React.Fragment>
                <div className="cr-bounty-modal__body-description">
                    In order for the on-chain transaction to be executed please wait a couple of minutes. Time may vary depending on the queue & gas.
                </div>
                <div className="cr-bounty-modal__body-buttons buttons-justify-center">
                    <div className="button button--outline button--secondary button--shadow-secondary" onClick={() => setIsOpenModal(false)}>
                        <span className="button__inner">Confirm</span>
                    </div>
                </div>
            </React.Fragment>
        );
    }, []);

    const handleClaim = React.useCallback(async (amountToClaim: number) => {
        setIsLoading(true);
        await handleClaimAllBounties(amountToClaim);
        setIsLoading(false);
    }, [handleClaimAllBounties, setIsLoading]);

    const renderClaimModalBody = React.useMemo(() => {
        const [amountToClaim, bountyTitles]: any = getBountiesClaimableAmount();
        const renderBountyTitles = bountyTitles.map((bountyTitle: any, index: number) => {
            return (
                <div key={`bounty-title-${index}`}>&#x2022; {bountyTitle}</div>
            );
        });

        return (
            <React.Fragment>
                <div className="cr-bounty-modal__body-subtitle">
                    Amount
                </div>
                <div className="cr-bounty-modal__body-price">
                    <div className="cr-bounty-modal__body-price-value">
                        {amountToClaim}
                        <svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.51487 3.11111H0V24.8889H9.51487C15.9624 24.8889 20 20.2844 20 14C20 7.59111 15.8998 3.11111 9.51487 3.11111ZM9.42097 21.0311H4.25665V6.93778H9.42097C13.1768 6.93778 15.6808 9.76889 15.6808 13.9067C15.6808 18.1067 13.1768 21.0311 9.42097 21.0311Z" fill="#ECAA00" />
                            <path d="M3.92 0H7.04989V6.22222H3.92V0Z" fill="#ECAA00" />
                            <path d="M3.92 21.7778H7.04989V28H3.92V21.7778Z" fill="#ECAA00" />
                            <path d="M8.61484 0H11.7447V6.22222H8.61484V0Z" fill="#ECAA00" />
                            <path d="M8.61484 21.7778H11.7447V28H8.61484V21.7778Z" fill="#ECAA00" />
                        </svg>
                    </div>
                </div>
                <div className="cr-bounty-modal__body-description">
                    List of bounties:
                    {renderBountyTitles}
                </div>
                <div className="cr-bounty-modal__body-buttons buttons-justify-center">
                    <div className="button button--outline button--secondary button--shadow-secondary" onClick={() => handleClaim(amountToClaim)}>
                        <span className="button__inner">Claim all</span>
                    </div>
                </div>
            </React.Fragment>
        );
    }, [getBountiesClaimableAmount, handleClaim]);

    const renderClaimRewardModalBody = React.useMemo(() => {
        return (
            <div className="cr-bounty-modal__body">
                <div className="cr-bounty-modal__body-image">
                    <Image width="156px" height="156px" src="/images/components/duckies/duckDetective.png" alt="duck-no-rewards" />
                </div>
                {(isLoading || isSingleBountyProcessing) ? renderLoadingModalBody : renderClaimModalBody}
            </div>
        );
    }, [isLoading, renderLoadingModalBody, renderClaimModalBody, isSingleBountyProcessing]);

    const renderNoRewardsModalBody = React.useMemo(() => {
        return (
            <div className="cr-bounty-modal__body">
                <div className="cr-bounty-modal__body-image">
                    <Image width="156px" height="156px" src="/images/components/duckies/duckNoRewards.png" alt="duck-no-rewards" />
                </div>
                <div className="cr-bounty-modal__body-subtitle">
                    Duckies are busy with other rewards.
                </div>
                <div className="cr-bounty-modal__body-description">
                    You have already claimed your current rewards. Invite more people and fulfill more bounties to get more DUCKZ
                </div>
                <div className="cr-bounty-modal__body-buttons buttons-justify-center">
                    <div className="button button--outline button--secondary button--shadow-secondary" onClick={() => { setIsOpenModal(false); } }>
                        <span className="button__inner">OK</span>
                    </div>
                </div>
            </div>
        );
    }, []);

    const renderModalBody = React.useMemo(() => {
        if (isReferralClaimed && !bountiesToClaim.length) {
            return renderNoRewardsModalBody;
        }

        return renderClaimRewardModalBody;
    }, [
        isReferralClaimed,
        bountiesToClaim,
        renderNoRewardsModalBody,
        renderClaimRewardModalBody,
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
                                        <div onClick={() => setIsOpenModal(true)} className="button button--outline button--secondary button--shadow-secondary">
                                            <span className="button__inner">Claim All</span>
                                        </div>)
                                    }
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
            <DuckiesConnectorModalWindow
                bodyContent={renderModalBody}
                headerContent="Claim rewards"
                isOpen={isOpenModal}
                setIsOpen={setIsOpenModal}
            />
        </React.Fragment>
    );
};
