import React from 'react';
import Image from 'next/image';
import { DuckiesModalWindow } from '../../DuckiesModalWindow';
import ReCAPTCHA from 'react-google-recaptcha';
import classnames from 'classnames';
import useBounties from '../../../../hooks/useBounties';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { isBrowser } from '../../../../helpers/isBrowser';
import { dispatchAlert } from '../../../../app/store';
import { Decimal } from '../../../Decimal';

interface ClaimRewardModalProps {
    bounties: any;
    isOpenModal: boolean;
    setIsOpenModal: (value: boolean) => void;
}

export const ClaimRewardModal: React.FC<ClaimRewardModalProps> = ({
    bounties,
    isOpenModal,
    setIsOpenModal,
}: ClaimRewardModalProps) => {
    const [isCaptchaNotResolved, setIsCaptchaNotResolved] = React.useState<boolean>(true);
    const [isComponentLoading, setIsComponentLoading] = React.useState<boolean>(true);

    const {
        bountiesToClaim,
        handleClaimRewards,
        getBountiesClaimableAmount,
        isReferralClaimed,
        isSingleBountyProcessing,
    } = useBounties(bounties);
    const isRewardsClaimProcessing = useAppSelector(state => state.globals.isRewardsClaimProcessing);

    let captcha: any = React.useRef();
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        setIsComponentLoading(false);

        return () => {
            captcha?.current?.reset();
        };
    }, []);

    React.useEffect(() => {
        const referralToken = localStorage.getItem('referral_token');
        if (isReferralClaimed && referralToken && isOpenModal) {
            dispatch(dispatchAlert({
                type: 'error',
                title: 'Error',
                message: 'You already have your referral.',
            }));
            localStorage.removeItem('referral_token');
        }
    }, [isReferralClaimed, isOpenModal]);

    const renderLoadingModalBody = React.useMemo(() => {
        return (
            <React.Fragment>
                <div className="text-text-color-100 text-sm text-center font-metro-regular font-medium mb-6">
                    A tiny amount of MATIC will be charged to cover the network fee. Please wait for the transaction to be completed. Time may vary depending on the Polygon Network congestion.               
                </div>
                <div className="flex items-center justify-center">
                    <span className="animate-spin">
                        <svg width="38" height="39" viewBox="0 0 38 39" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M38 19.5C38 15.1042 36.4758 10.8445 33.6872 7.44653C30.8986 4.04857 27.018 1.72265 22.7067 0.86508C18.3954 0.00751132 13.9202 0.671353 10.0435 2.7435C6.16676 4.81564 3.12847 8.16787 1.44629 12.229C-0.235892 16.2902 -0.457885 20.8089 0.818133 25.0154C2.09415 29.2219 4.78923 32.8558 8.44416 35.2979C12.0991 37.7401 16.4877 38.8394 20.8623 38.4085C25.2369 37.9777 29.3268 36.0433 32.435 32.935L31.0915 31.5915C28.2941 34.389 24.6132 36.1299 20.6761 36.5177C16.739 36.9054 12.7892 35.9161 9.49975 33.7181C6.21031 31.5202 3.78474 28.2497 2.63632 24.4639C1.4879 20.678 1.6877 16.6111 3.20166 12.9561C4.71562 9.30108 7.45008 6.28407 10.9391 4.41915C14.4282 2.55422 18.4559 1.95676 22.336 2.72857C26.2162 3.50038 29.7087 5.59371 32.2185 8.65187C34.7282 11.71 36.1 15.5438 36.1 19.5H38Z" fill="#F8C100"/>
                        </svg>
                    </span>
                </div>
            </React.Fragment>
        );
    }, []);

    const renderNoRewardsModalBody = React.useMemo(() => {
        return (
            <div className="flex flex-col w-full">
                <div className="flex justify-center mb-4">
                    <Image width="156px" height="156px" src="/images/components/duckies/duckNoRewards.png" alt="duck-no-rewards" />
                </div>
                <div className="text-text-color-100 text-base text-center font-metro-regular font-semibold mb-1">
                    Rewards are unavailable
                </div>
                <div className="text-text-color-100 text-sm text-center font-metro-regular font-medium mb-6">
                    It’s just not the right time. Invite more people to your team and complete more quests to get DUCKIES.
                </div>
                <div className="flex items-center justify-center">
                    <div
                        className="button button--outline button--secondary button--shadow-secondary"
                        onClick={() => { setIsOpenModal(false); }}
                    >
                        <span className="button__inner">OK</span>
                    </div>
                </div>
            </div>
        );
    }, [setIsOpenModal]);

    const claimButtonContainerClassName = React.useMemo(() => {
        return classnames({
            'px-7 py-1.5 bg-neutral-control-color-40 rounded-sm text-neutral-control-layer-color-40 cursor-not-allowed': isCaptchaNotResolved,
            'button button--outline button--secondary button--shadow-secondary': !isCaptchaNotResolved,
        });
    },[isCaptchaNotResolved]);

    const claimButtonClassName = React.useMemo(() => {
        return classnames('button__inner', {
            'cursor-not-allowed': isCaptchaNotResolved,
        });
    },[isCaptchaNotResolved]);

    const renderClaimModalBody = React.useMemo(() => {
        const [amountToClaim, bountyTitles]: any = getBountiesClaimableAmount();

        const renderBountyTitles = bountyTitles.map((bountyTitle: any, index: number) => {
            return (
                <div key={`bounty-title-${index}`}>
                    &#x2022; {bountyTitle}
                </div>
            );
        });

        return (
            <React.Fragment>
                <div className="text-text-color-100 text-base text-center font-metro-regular font-semibold mb-1">
                    Amount
                </div>
                <div className="bg-primary-cta-color-10 w-full flex justify-center py-3 mb-4">
                    <div className="text-text-color-100 text-2xl font-gilmer-bold flex items-center">
                        {Decimal.format(amountToClaim, 2, ',')}
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
                        onChange={() => setIsCaptchaNotResolved(false)}
                        className="mb-5 inline-block scale-80 lg:scale-100"
                        hl="en"
                    />
                </div>
                <div className="flex items-center justify-center">
                    <div
                        className={claimButtonContainerClassName}
                        onClick={() => handleClaimRewards(amountToClaim, isCaptchaNotResolved, setIsCaptchaNotResolved, captcha)}
                    >
                        <button
                            className={claimButtonClassName}
                            disabled={isCaptchaNotResolved}
                        >
                            Claim all
                        </button>
                    </div>
                </div>
            </React.Fragment>
        );
    }, [
        getBountiesClaimableAmount,
        handleClaimRewards,
        captcha,
        isCaptchaNotResolved,
        claimButtonContainerClassName,
        claimButtonClassName,
    ]);

    const renderClaimRewardModalBody = React.useMemo(() => {
        return (
            <div className="flex flex-col w-full">
                <div className="flex justify-center mb-4">
                    <Image
                        width="156px"
                        height="156px"
                        src="/images/components/duckies/duckDetective.png"
                        alt="duck-detective"
                    />
                </div>
                {(isRewardsClaimProcessing || isSingleBountyProcessing) ? renderLoadingModalBody : renderClaimModalBody}
            </div>
        );
    }, [
        isRewardsClaimProcessing,
        isSingleBountyProcessing,
        renderLoadingModalBody,
        renderClaimModalBody,
    ]);

    const renderModalBody = React.useMemo(() => {
        const referral_token = isBrowser() && localStorage.getItem('referral_token');

        if ((isReferralClaimed && !bountiesToClaim.length) || (!isReferralClaimed && !referral_token)) {
            return renderNoRewardsModalBody;
        }

        return renderClaimRewardModalBody;
    }, [
        isReferralClaimed,
        bountiesToClaim,
        renderNoRewardsModalBody,
        renderClaimRewardModalBody,
    ]);

    if (isComponentLoading) {
        return null;
    }

    return (
        <DuckiesModalWindow
            bodyContent={renderModalBody}
            headerContent="Claim reward"
            isOpen={isOpenModal}
            setIsOpen={setIsOpenModal}
        />
    );
};
