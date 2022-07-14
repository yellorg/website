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
import { loginWithProvider } from '../../../lib/SupabaseConnector';
import ReCAPTCHA from 'react-google-recaptcha';
import classnames from 'classnames';

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
    supabaseUser: any;
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
    supabaseUser,
}: DuckiesAffiliatesProps) => {
    const limit: number = 5;

    let captcha: any = React.useRef<ReCAPTCHA>();

    const [bounties, setBounties] = useState<BountyItem[]>([]);
    const [page, setPage] = useState<number>(1);
    const [payouts, setPayouts] = useState<number[]>([]);
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
    const [isCaptchaNotResolved, setIsCaptchaNotResolved] = React.useState<boolean>(true);

    const dispatch = useAppDispatch();
    const duckiesContract = useDuckiesContract();
    const { active, account, signer } = useWallet();

    const claimButtonClassName = React.useMemo(() => {
        return classnames('button__inner', {
            'cursor-not-allowed': isCaptchaNotResolved,
        });
    },[isCaptchaNotResolved]);

    const claimButtonContainerClassName = React.useMemo(() => {
        return classnames({
            'px-7 py-1.5 bg-neutral-control-color-40 rounded-sm text-neutral-control-layer-color-40 cursor-not-allowed': isCaptchaNotResolved,
            'button button--outline button--secondary button--shadow-secondary': !isCaptchaNotResolved,
        });
    },[isCaptchaNotResolved]);

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
    }, [bountyItems, page])

    const renderAffiliateLevels = React.useMemo(() => {
        return affiliates.map((affiliateCount: number, index: number) => {
            return (
                <div className="flex w-full items-center justify-between py-2 border-b border-divider-color-40" key={`affiliate-${index}`}>
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

    const handleClaimReward = React.useCallback(async (id: string) => {
        const bountyToClaim = bountyItems.find((item: BountyItem) => item.fid === id);

        if (bountyToClaim && signer && !isCaptchaNotResolved) {
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
    }, [
        signer,
        bountyItems,
        account,
        isCaptchaNotResolved,
        dispatch,
        setIsLoading,
        setIsRewardsClaimed,
    ]);

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
                        supabaseUser={supabaseUser}
                    />
                </React.Fragment>
            );
        });
    }, [
        bounties,
        handleClaimReward,
        page,
        isLoading,
        isSingleBountyProcessing,
        supabaseUser,
        setIsSingleBountyProcessing,
    ]);

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
                <div className="text-text-color-100 text-sm text-center font-metro-regular font-medium mb-6">
                    In order for the on-chain transaction to be executed please wait a couple of minutes. Time may vary depending on the queue & gas.
                </div>
                <div className="flex items-center justify-center">
                    <div className="button button--outline button--secondary button--shadow-secondary" onClick={() => setIsOpenModal(false)}>
                        <span className="button__inner">Confirm</span>
                    </div>
                </div>
            </React.Fragment>
        );
    }, []);

    const handleClaim = React.useCallback(async (amountToClaim: number) => {
        if (!isCaptchaNotResolved) {
            setIsLoading(true);
            await handleClaimAllBounties(amountToClaim);
            setIsLoading(false);
        }

        captcha?.current?.reset();
        setIsCaptchaNotResolved(true);
    }, [handleClaimAllBounties, setIsLoading, isCaptchaNotResolved]);

    const renderClaimModalBody = React.useMemo(() => {
        const [amountToClaim, bountyTitles]: any = getBountiesClaimableAmount();
        const renderBountyTitles = bountyTitles.map((bountyTitle: any, index: number) => {
            return (
                <div key={`bounty-title-${index}`}>&#x2022; {bountyTitle}</div>
            );
        });

        return (
            <React.Fragment>
                <div className="text-text-color-100 text-base text-center font-metro-regular font-semibold mb-1">
                    Amount
                </div>
                <div className="bg-primary-cta-color-10 w-full flex justify-center py-3 mb-4">
                    <div className="text-text-color-100 text-2xl font-gilmer-bold flex items-center">
                        {amountToClaim}
                        <svg className="ml-3" width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.51487 3.11111H0V24.8889H9.51487C15.9624 24.8889 20 20.2844 20 14C20 7.59111 15.8998 3.11111 9.51487 3.11111ZM9.42097 21.0311H4.25665V6.93778H9.42097C13.1768 6.93778 15.6808 9.76889 15.6808 13.9067C15.6808 18.1067 13.1768 21.0311 9.42097 21.0311Z" fill="#ECAA00" />
                            <path d="M3.92 0H7.04989V6.22222H3.92V0Z" fill="#ECAA00" />
                            <path d="M3.92 21.7778H7.04989V28H3.92V21.7778Z" fill="#ECAA00" />
                            <path d="M8.61484 0H11.7447V6.22222H8.61484V0Z" fill="#ECAA00" />
                            <path d="M8.61484 21.7778H11.7447V28H8.61484V21.7778Z" fill="#ECAA00" />
                        </svg>
                    </div>
                </div>
                <div className="text-text-color-100 text-sm text-center font-metro-regular font-medium mb-6">
                    List of bounties:
                    {renderBountyTitles}
                </div>
                <div className="flex justify-center">
                    <ReCAPTCHA
                        ref={captcha}
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY || 'changeme'}
                        onChange={() => setIsCaptchaNotResolved(!isCaptchaNotResolved)}
                        className="mb-5 inline-block scale-80 lg:scale-100"
                        hl="en"
                    />
                </div>
                <div className="flex items-center justify-center">
                    <div className={claimButtonContainerClassName} onClick={() => handleClaim(amountToClaim)}>
                        <button className={claimButtonClassName} disabled={isCaptchaNotResolved}>Claim all</button>
                    </div>
                </div>
            </React.Fragment>
        );
    }, [
        getBountiesClaimableAmount,
        handleClaim,
        captcha,
        isCaptchaNotResolved,
        claimButtonContainerClassName,
        claimButtonClassName,
    ]);

    const renderClaimRewardModalBody = React.useMemo(() => {
        return (
            <div className="flex flex-col w-full">
                <div className="flex justify-center mb-4">
                    <Image width="156px" height="156px" src="/images/components/duckies/duckDetective.png" alt="duck-no-rewards" />
                </div>
                {(isLoading || isSingleBountyProcessing) ? renderLoadingModalBody : renderClaimModalBody}
            </div>
        );
    }, [isLoading, renderLoadingModalBody, renderClaimModalBody, isSingleBountyProcessing]);

    const renderNoRewardsModalBody = React.useMemo(() => {
        return (
            <div className="flex flex-col w-full">
                <div className="flex justify-center mb-4">
                    <Image width="156px" height="156px" src="/images/components/duckies/duckNoRewards.png" alt="duck-no-rewards" />
                </div>
                <div className="text-text-color-100 text-base text-center font-metro-regular font-semibold mb-1">
                    Not the right time
                </div>
                <div className="text-text-color-100 text-sm text-center font-metro-regular font-medium mb-6">
                    You have already claimed your current rewards. Invite more people and fulfill more bounties to get more DUCKZ
                </div>
                <div className="flex items-center justify-center">
                    <div className="button button--outline button--secondary button--shadow-secondary" onClick={() => { setIsOpenModal(false); } }>
                        <span className="button__inner">OK</span>
                    </div>
                </div>
            </div>
        );
    }, []);

    const handleSocialAuth = React.useCallback((provider: string) => {
        loginWithProvider(provider);
    }, []);

    const renderSocialsModalBody = React.useMemo(() => {
        return (
            <div className="flex flex-col w-full p-0.5">
                <div className="flex justify-center mb-4">
                    <Image width="156px" height="156px" src="/images/components/duckies/duckDetective.png" alt="duck-detective" />
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex w-full mb-1.5 button socials facebook" onClick={() => handleSocialAuth('facebook')}>
                        <div className="button__inner">
                            <div className="absolute left-3">
                                <svg width="10" height="21" viewBox="0 0 10 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.47229 10.0923H6.64526C6.64526 14.609 6.64526 20.1686 6.64526 20.1686H2.45615C2.45615 20.1686 2.45615 14.6629 2.45615 10.0923H0.464844V6.53108H2.45615V4.2276C2.45615 2.57785 3.24008 0 6.68375 0L9.78796 0.0118993V3.46887C9.78796 3.46887 7.90164 3.46887 7.53487 3.46887C7.16811 3.46887 6.64666 3.65225 6.64666 4.43898V6.53178H9.83835L9.47229 10.0923Z" fill="white"/>
                                </svg>
                            </div>
                            Connect with Facebook
                        </div>
                    </div>
                    <div className="flex w-full my-1.5 button socials twitter" onClick={() => handleSocialAuth('twitter')}>
                        <div className="button__inner">
                            <div className="absolute left-3">
                                <svg width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.8668 4.02629C17.8746 4.20209 17.8789 4.37932 17.8789 4.55655C17.8789 9.95281 13.7726 16.1731 6.25955 16.1731C3.9534 16.1731 1.80661 15.4991 0 14.34C0.319445 14.3779 0.644607 14.3972 0.974056 14.3972C2.88787 14.3972 4.64803 13.744 6.04587 12.6492C4.25926 12.6163 2.75066 11.4357 2.23111 9.81274C2.47981 9.85991 2.73636 9.88635 2.99864 9.88635C3.37096 9.88635 3.73257 9.83776 4.07489 9.74414C2.20681 9.36967 0.799684 7.71956 0.799684 5.74C0.799684 5.72285 0.799684 5.70498 0.800399 5.68855C1.35067 5.9937 1.98027 6.17808 2.64918 6.1988C1.55435 5.46772 0.833272 4.2171 0.833272 2.80068C0.833272 2.05174 1.03409 1.34996 1.38569 0.746801C3.39884 3.21803 6.4089 4.84313 9.80202 5.01464C9.73199 4.7152 9.69697 4.40434 9.69697 4.08346C9.69697 1.82877 11.525 0 13.7797 0C14.9546 0 16.0144 0.495961 16.7605 1.28921C17.6917 1.10627 18.5635 0.767525 19.3546 0.298006C19.0473 1.25205 18.402 2.05174 17.5566 2.5577C18.3834 2.45908 19.1724 2.2404 19.9021 1.91524C19.3575 2.73279 18.665 3.45243 17.8668 4.02629Z" fill="white"/>
                                </svg>
                            </div>
                            Connect with Twitter
                        </div>
                    </div>
                    <div className="flex w-full mt-1.5 button socials google" onClick={() => handleSocialAuth('google')}>
                        <div className="button__inner">
                            <div className="absolute left-3">
                                <svg width="22" height="23" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21.5774 11.2707C21.5774 10.545 21.5131 9.85611 21.4029 9.18555H11.0229V13.3283H16.9661C16.6998 14.6878 15.919 15.8361 14.7616 16.6168V19.3726H18.3073C20.3833 17.4527 21.5774 14.6235 21.5774 11.2707Z" fill="#4285F4"/>
                                    <path d="M11.023 22.0459C13.9992 22.0459 16.4886 21.0538 18.3074 19.3728L14.7616 16.6171C13.7696 17.2784 12.5111 17.6826 11.023 17.6826C8.14788 17.6826 5.71365 15.7444 4.841 13.1265H1.18506V15.9649C2.99466 19.5657 6.7149 22.0459 11.023 22.0459Z" fill="#34A853"/>
                                    <path d="M4.84091 13.1265C4.61126 12.4652 4.49184 11.7579 4.49184 11.023C4.49184 10.2881 4.62045 9.58084 4.84091 8.91946V6.08105H1.18496C0.431731 7.56915 0 9.24096 0 11.023C0 12.805 0.431731 14.4769 1.18496 15.965L4.84091 13.1265Z" fill="#FBBC05"/>
                                    <path d="M11.023 4.36325C12.6489 4.36325 14.1003 4.92358 15.2485 6.01669L18.39 2.87515C16.4886 1.09311 13.9992 0 11.023 0C6.7149 0 2.99466 2.48016 1.18506 6.08099L4.841 8.91939C5.71365 6.30145 8.14788 4.36325 11.023 4.36325Z" fill="#EA4335"/>
                                </svg>
                            </div>
                            Connect with Google
                        </div>
                    </div>
                </div>
            </div>
        );
    }, [handleSocialAuth]);

    const renderModalBody = React.useMemo(() => {
        if (isReferralClaimed && !bountiesToClaim.length) {
            return renderNoRewardsModalBody;
        }

        if (!supabaseUser) {
            return renderSocialsModalBody;
        }

        return renderClaimRewardModalBody;
    }, [
        isReferralClaimed,
        bountiesToClaim,
        renderNoRewardsModalBody,
        renderClaimRewardModalBody,
        supabaseUser,
        renderSocialsModalBody,
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

    const renderModalTitle = React.useMemo(() => {
        if (!supabaseUser) {
            return 'Connect social';
        }

        return 'Claim rewards';
    }, [supabaseUser]);

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
                headerContent={renderModalTitle}
                isOpen={isOpenModal}
                setIsOpen={setIsOpenModal}
            />
        </React.Fragment>
    );
};
