import React from 'react';
import Link from 'next/link';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import useWallet from '../../../hooks/useWallet';
import { shortenHex } from '../../../utils/utils';
import { useENSName } from '../../../hooks/useENSName';
import useMetaMask from '../../../hooks/useMetaMask';
import { useEagerConnect } from '../../../hooks/useEagerConnect';
import { appConfig } from '../../../config/app';
import { convertNumberToLiteral } from '../../../helpers/convertNumberToLiteral';
import classNames from 'classnames';
import useBounties from '../../../hooks/useBounties';
import useDuckiesBalance from '../../../hooks/useDuckiesBalance';
import { Decimal } from '../../Decimal';
import { analytics } from '../../../lib/analitics';

interface DuckiesHeroProps {
    handleOpenModal: () => void;
    supabaseUser: any;
    bountiesItems: any;
}

export const DuckiesHero: React.FC<DuckiesHeroProps> = ({
    handleOpenModal,
    supabaseUser,
    bountiesItems,
}: DuckiesHeroProps) => {
    const [isOpenBalancesInfo, setIsOpenBalancesInfo] = React.useState<boolean>(false);
    const [isCopyClicked, setIsCopyClicked] = React.useState<boolean>(false);

    const { active, account, chain } = useWallet();
    const {
        supportedChain,
        handleDisconnect,
    } = useMetaMask();
    const ENSName = useENSName(account);
    const triedToEagerConnect = useEagerConnect();
    const {
        isRewardsClaimed,
        setIsRewardsClaimed,
    } = useBounties(bountiesItems);
    const balance = useDuckiesBalance();

    const isReady = React.useMemo(() => {
        return supportedChain && triedToEagerConnect && active && account;
    }, [supportedChain, triedToEagerConnect, active, account]);

    React.useEffect(() => {
        if (!isCopyClicked)
            return;

        setTimeout(() => {
            setIsCopyClicked(false);
        }, 700);
    }, [isCopyClicked]);

    React.useEffect(() => {
        if (isRewardsClaimed) {
            setIsRewardsClaimed(false);
        }
    }, [isRewardsClaimed]);

    const handleClaimRewardButtonClick = React.useCallback(() => {
        handleOpenModal();

        analytics({
            type: 'otherEvent',
            name: 'duckies_claim_reward_hero',
            params: {
                status: isReady ? (supabaseUser ? 'socials connected' : 'metamask connected' ) : 'not logged in',
            },
        });
    }, [isReady, supabaseUser, handleOpenModal]);

    const handleClickConnectMetamask = React.useCallback(() => {
        handleOpenModal();

        analytics({
            type: 'otherEvent',
            name: 'duckies_connect_metamask_hero',
        });
    }, [handleOpenModal]);

    const handleClickConnectSocials = React.useCallback(() => {
        handleOpenModal();

        analytics({
            type: 'otherEvent',
            name: 'duckies_connect_socials_hero',
        });
    }, [handleOpenModal]);

    const handleClickEarnMore = React.useCallback(() => {
        analytics({
            type: 'otherEvent',
            name: 'duckies_earn_more_button_click',
        });
    }, []);

    const handleClickReadFAQ = React.useCallback(() => {
        analytics({
            type: 'otherEvent',
            name: 'duckies_read_faq_click',
        });
    }, []);

    const handleHoverInfoIcon = React.useCallback(() => {
        setIsOpenBalancesInfo(true);

        analytics({
            type: 'otherEvent',
            name: 'duckies_balance_info_hover',
        });
    }, []);

    const handleHoverDuckImage = React.useCallback(() => {
        analytics({
            type: 'otherEvent',
            name: 'duckies_balance_duck_icon_hover',
        });
    }, []);

    const renderDuckImage = React.useMemo(() => {
        return (
            <div className={classNames("flex items-center justify-center rounded-[50%] h-full", { 'border border-primary-cta-color-90': !supabaseUser })}>
                <div className={classNames('flex items-center justify-center rounded-full', { 'bg-primary-cta-color-20': !!supabaseUser })}>
                    <LazyLoadImage
                        srcSet="/images/components/duckies/duckBigEyes.png"
                        className={classNames('hidden', { 'group-hover:block': isReady })}
                    />
                    <LazyLoadImage
                        srcSet="/images/components/duckies/duck.png"
                        className={classNames('block', { 'group-hover:hidden': isReady })}
                    />
                </div>
            </div>
        );
    }, [supabaseUser, isReady]);

    const renderDuckBubble = React.useMemo(() => {
        return (
            <div className="hidden group-hover:block">
                <div className="absolute bg-body-background-color w-[203px] h-[80px] top-[-100%] md:top-[-50%] right-[50%] rounded-[4px] !rounded-br-[0px] flex justify-center items-center shadow-md">
                    <span className="text-[16px] leading-[24px] text-black font-metro-bold">
                        {(isReady && !supabaseUser) && 'Need to connect socials'}
                        {(isReady && supabaseUser) && 'Secured duck'}
                    </span>
                </div>
                <div className="absolute bubble-corner h-[25px] w-[27px] top-[calc(-100%+80px)] md:top-[calc(-50%+80px)] right-[50%] z-20" />
            </div>
        )
    }, [isReady, supabaseUser])

    const renderDuck = React.useMemo(() => {
        if (!isReady) {
            return renderDuckImage;
        }

        if (!supabaseUser) {
            return (
                <React.Fragment>
                    {renderDuckImage}
                    <div className="absolute top-[-2px] z-20 flex justify-center items-center">
                        <svg className="w-[14px] h-[14px] md:w-[24px] md:h-[24px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="12" fill="#B01212"/>
                        </svg>
                        <div className="absolute">
                            <svg className="w-[8px] h-[8px] md:w-[12px] md:h-[12px]" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.5 10.5L10.5 1.5M1.5 1.5L10.5 10.5" stroke="#FFEBEB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div className="absolute">
                        <svg className="w-[93px] h-[93px] md:w-[169px] md:h-[169px]" viewBox="0 0 169 167" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g filter="url(#filter0_dd_5325_86048)">
                                <path d="M84.5 5.377C84.5 3.51193 82.9872 1.99261 81.1238 2.07082C68.165 2.61472 55.5113 6.28321 44.25 12.785C32.0125 19.8503 21.8503 30.0125 14.785 42.25C7.7196 54.4875 4 68.3693 4 82.5C4 96.6307 7.71961 110.512 14.785 122.75C21.8503 134.988 32.0125 145.15 44.25 152.215C56.4876 159.28 70.3693 163 84.5 163C98.6307 163 112.512 159.28 124.75 152.215C136.011 145.713 145.515 136.589 152.466 125.638C153.465 124.064 152.906 121.994 151.29 121.061C149.675 120.129 147.616 120.687 146.611 122.258C140.257 132.184 131.608 140.457 121.373 146.366C110.162 152.838 97.4451 156.246 84.5 156.246C71.5549 156.246 58.8378 152.838 47.627 146.366C36.4162 139.893 27.1067 130.584 20.6341 119.373C14.1615 108.162 10.754 95.4451 10.754 82.5C10.754 69.5549 14.1615 56.8378 20.6341 45.627C27.1067 34.4162 36.4162 25.1067 47.627 18.6341C57.8615 12.7252 69.3514 9.37073 81.1241 8.8313C82.9872 8.74593 84.5 7.24206 84.5 5.377Z" fill="url(#paint0_radial_5325_86048)"/>
                            </g>
                            <defs>
                                <filter id="filter0_dd_5325_86048" x="0" y="0.0678711" width="156.965" height="168.932" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                                    <feOffset dy="2"/>
                                    <feGaussianBlur stdDeviation="2"/>
                                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_5325_86048"/>
                                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                                    <feOffset/>
                                    <feGaussianBlur stdDeviation="1"/>
                                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"/>
                                    <feBlend mode="normal" in2="effect1_dropShadow_5325_86048" result="effect2_dropShadow_5325_86048"/>
                                    <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_5325_86048" result="shape"/>
                                </filter>
                                <radialGradient id="paint0_radial_5325_86048" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(146 132.5) rotate(-129.618) scale(149.107)">
                                    <stop stopColor="#FFA800"/>
                                    <stop offset="1" stopColor="#E91B1B"/>
                                </radialGradient>
                            </defs>
                        </svg>
                    </div>
                    {renderDuckBubble}
                </React.Fragment>
            );
        }

        return (
            <React.Fragment>
                <div className="absolute w-[84px] md:w-[161px] h-[84px] md:h-[161px] bg-system-green-10 rounded-full p-1 gradient-green">
                    {renderDuckImage}
                </div>
                <div className="absolute top-[-2px] z-20 flex justify-center items-center">
                    <svg className="w-[18px] h-[18px] md:w-[24px] md:h-[24px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="12" fill="#00632B"/>
                    </svg>
                    <div className="absolute">
                        <svg className="w-[12px] h-[12px] md:w-[16px] md:h-[16px]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M0.950278 3.499C3.65771 3.46227 6.12453 2.42929 8.00078 0.75C9.87702 2.42929 12.3438 3.46227 15.0513 3.499C15.1496 4.0847 15.2008 4.68638 15.2008 5.30002C15.2008 10.0024 12.1955 14.0028 8.00078 15.4854C3.80609 14.0028 0.800781 10.0024 0.800781 5.30002C0.800781 4.68638 0.851959 4.0847 0.950278 3.499ZM11.4079 6.90709C11.7984 6.51657 11.7984 5.8834 11.4079 5.49288C11.0174 5.10236 10.3842 5.10236 9.99367 5.49288L7.10078 8.38577L6.00788 7.29288C5.61736 6.90236 4.9842 6.90236 4.59367 7.29288C4.20315 7.6834 4.20315 8.31657 4.59367 8.70709L6.39367 10.5071C6.58121 10.6946 6.83556 10.8 7.10078 10.8C7.36599 10.8 7.62035 10.6946 7.80788 10.5071L11.4079 6.90709Z" fill="#E8FCF1"/>
                        </svg>
                    </div>
                </div>
                {renderDuckBubble}
            </React.Fragment>
        );
    }, [isReady, supabaseUser, renderDuckBubble, renderDuckImage, handleHoverDuckImage]);

    const renderBalanceCircleButton = React.useMemo(() => {
        if (!isReady) {
           return (
                <div onClick={handleClickConnectMetamask} className="w-full button button--outline button--secondary button--shadow-secondary">
                    <span className="button__inner !py-[6px] !px-[18px] !justify-center">Connect Metamask</span>
                </div>
           );
        }

        if (!supabaseUser) {
            return (
                <>
                    <div onClick={handleClickConnectSocials} className="text-center lg:w-full mr-[24px] lg:mr-0 mt-[16px] !mr-0 button button--outline button--secondary button--shadow-secondary">
                        <span className="button__inner !py-[6px] !px-[18px] !justify-center">Connect Social</span>
                    </div>
                    <div onClick={handleDisconnect} className="group flex flex-row items-center gap-1 mt-2 cursor-pointer">
                        <span className="text-[14px] leading-[22px] font-metro-semibold text-neutral-control-layer-color-60 underline group-hover:text-neutral-control-layer-color-80">Logout</span>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.75 12L15.75 9M15.75 9L12.75 6M15.75 9L5.25 9M9.75 12V12.75C9.75 13.9926 8.74264 15 7.5 15H4.5C3.25736 15 2.25 13.9926 2.25 12.75V5.25C2.25 4.00736 3.25736 3 4.5 3H7.5C8.74264 3 9.75 4.00736 9.75 5.25V6" stroke="#3F3F3F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </>
            );
        }

        return (
            <div onClick={handleDisconnect} className="text-center lg:w-full mr-[24px] lg:mr-0 mt-[16px] !mr-0 button button--outline button--secondary button--shadow-secondary">
                <span className="button__inner !py-[6px] !px-[18px] !justify-center">Log out</span>
            </div>
        );
    }, [
        isReady,
        supabaseUser,
        handleDisconnect,
        handleClickConnectMetamask,
        handleClickConnectSocials,
    ]);

    const handleCopy = React.useCallback(() => {
        navigator.clipboard.writeText(appConfig.duckiesSmartContractAddress);
        setIsCopyClicked(true);

        analytics({
            type: 'otherEvent',
            name: 'duckies_balance_info_sc_copy',
        });
    }, []);

    return (
        <React.Fragment>
            <div className="flex justify-between pb-[10.5rem] flex-col sm:flex-row pt-[2.625rem] sm:pt-8 duckies-hero">
                <div className="flex flex-col sm:flex-row mx-auto px-3.5 max-w-md-layout 2xl:max-w-lg-layout-2p">
                    <div className="flex flex-col justify-start mb-[3.75rem] sm:mb-0">
                        <div className="flex justify-center sm:justify-start sm:mb-4">
                            <LazyLoadImage
                                srcSet={`${'/images/components/duckies/celebration.png'}`}
                                effect="blur"
                                threshold={200}
                                width={132}
                                height={132}
                            />
                        </div>
                        <div className="flex flex-col justify-start break-words sm:justify-center sm:items-center sm:pb-2">
                            <div className="text-text-color-100 font-gilmer-bold text-6xl">
                            <div className="py-1">
                                <svg width="263" height="54" viewBox="0 0 263 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.24 6H0V48H18.24C30.6 48 38.34 39.12 38.34 27C38.34 14.64 30.48 6 18.24 6ZM18.06 40.56H8.16V13.38H18.06C25.26 13.38 30.06 18.84 30.06 26.82C30.06 34.92 25.26 40.56 18.06 40.56Z" fill="#090909"/>
                                    <path d="M72.1341 6V30.66C72.1341 36.84 68.8341 41.28 62.2341 41.28C55.6941 41.28 52.3941 36.84 52.3941 30.66V6H44.0541V30.78C44.0541 41.46 50.4741 48.84 62.2341 48.84C73.9341 48.84 80.4141 41.46 80.4141 30.78V6H72.1341Z" fill="#090909"/>
                                    <path d="M108.172 48.84C119.272 48.84 126.352 42.06 128.272 35.34L120.292 33.3C118.912 37.44 114.412 41.1 108.052 41.1C99.772 41.1 94.492 34.44 94.492 26.88C94.492 19.32 99.772 12.9 108.052 12.9C114.412 12.9 118.912 16.68 120.292 20.76L128.332 18.78C126.412 12.12 119.332 5.16 107.992 5.16C95.512 5.16 86.092 14.58 86.092 26.94C86.092 39.36 95.512 48.84 108.172 48.84Z" fill="#090909"/>
                                    <path d="M161.723 48H171.743L153.863 24.36L170.423 6H159.982L142.283 26.34V6H134.062V48H142.283V37.26L148.462 30.42L161.723 48Z" fill="#090909"/>
                                    <path d="M176.25 48H184.59V6H176.25V48Z" fill="#090909"/>
                                    <path d="M223.323 13.44V6H192.363V48H223.263V40.56H200.403V30.24H220.263V23.04H200.403V13.44H223.323Z" fill="#090909"/>
                                    <path d="M245.793 48.84C255.873 48.84 262.593 43.02 262.593 35.82C262.593 28.98 257.733 26.28 251.313 24.3L240.873 20.94C238.113 20.1 236.853 18.84 236.853 16.98C236.853 14.52 239.493 12.42 243.633 12.42C248.373 12.42 252.273 14.76 254.013 18.18L261.633 15.96C259.353 10.14 252.633 5.16 243.573 5.16C234.813 5.16 228.453 10.68 228.513 17.22C228.453 22.62 232.473 26.16 237.993 27.9L248.733 31.26C252.753 32.58 254.253 34.08 254.253 36.3C254.253 39.06 251.193 41.58 246.273 41.58C240.213 41.58 235.953 38.1 234.273 33.72L226.413 36.12C228.753 42.66 235.533 48.84 245.793 48.84Z" fill="#090909"/>
                                    <path d="M7.548 0H13.4948V12H7.548V0Z" fill="black"/>
                                    <path d="M7.548 42H13.4948V54H7.548V42Z" fill="black"/>
                                    <path d="M16.4682 0H22.415V12H16.4682V0Z" fill="black"/>
                                    <path d="M16.4682 42H22.415V54H16.4682V42Z" fill="black"/>
                                </svg>
                            </div>
                                <div className="lg:w-[37.5rem]">Crypto collectibles.</div>
                                <span>The fun and friendly reward token.</span>
                            </div>
                        </div>
                        <div className="flex mt-8 flex-col lg:flex-row gap-3">
                            <div onClick={handleClaimRewardButtonClick} className="w-full lg:w-fit button button--outline button--secondary button--shadow-secondary">
                                <span className="button__inner !text-2xl !p-4 !justify-center">Claim your reward</span>
                            </div>
                            <Link href="#earn-more">
                                <a className="sm:mt-0 w-full lg:w-fit button button--secondary button--shadow-secondary" onClick={handleClickEarnMore}>
                                    <span className="button__inner !text-2xl !p-4 !justify-center">
                                        Earn more
                                    </span>
                                </a>
                            </Link>
                        </div>
                        <Link href="#faq">
                            <a className="group font-metro-bold text-text-color-100 mt-4 hover:text-text-color-100 prevent-default" onClick={handleClickReadFAQ}>
                                <span className="underline pr-1 text-xl">
                                    Read FAQ
                                </span>
                                <svg className="inline group-hover:translate-x-1 duration-300 mb-[0.219rem]" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M8.26341 0.963555C8.61488 0.612083 9.18473 0.612083 9.5362 0.963555L14.9362 6.36356C15.2877 6.71503 15.2877 7.28488 14.9362 7.63635L9.5362 13.0363C9.18473 13.3878 8.61488 13.3878 8.26341 13.0363C7.91194 12.6849 7.91194 12.115 8.26341 11.7636L12.127 7.89995L1.69981 7.89995C1.20275 7.89995 0.799805 7.49701 0.799805 6.99995C0.799805 6.50289 1.20275 6.09995 1.69981 6.09995H12.127L8.26341 2.23635C7.91194 1.88488 7.91194 1.31503 8.26341 0.963555Z" fill="#070707"/>
                                </svg>
                            </a>
                        </Link>
                    </div>
                    <div className="flex pt-20 justify-center sm:justify-end w-full">
                        <div className="p-4 rounded-[50%] w-[18.75rem] h-[18.75rem] bg-primary-cta-color-10 z-[10] border-2 border-primary-cta-layer-color-60 shadow-[-0.313rem_0.313rem_#CC8F18] button--shadow-secondary">
                            <div className="flex flex-col items-center justify-center rounded-[50%] h-full bg-primary-cta-color-10 border border-primary-cta-color-90 z-[10]">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className={classNames('uppercase font-gilmer-bold text-primary-cta-layer-color-60', {'text-2xl': isReady, 'text-3xl': !isReady})}>
                                            Balance
                                        </div>
                                        <div onMouseEnter={handleHoverInfoIcon} onMouseLeave={() => setIsOpenBalancesInfo(false)} className="flex ml-2 sm:relative">
                                            <div className="z-[101] cursor-pointer bg-primary-cta-color-40 px-2 gap-1 rounded-[0.1875rem] flex items-center">
                                                <span className="uppercase text-xs leading-6 font-gilmer-bold text-text-color-90">
                                                    Info
                                                </span>
                                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11 14H10V10H9M10 6H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                            {isOpenBalancesInfo &&
                                                <div className="z-[100] absolute left-[1.125rem] sm:left-auto right-[1.125rem] sm:right-0 mt-[1.875rem] sm:mt-0 sm:pt-[1.875rem] sm:min-w-[27.813rem] w-[calc(100vw-2.25rem)] sm:w-fit">
                                                    <div className="bg-text-color-0 border-2 border-text-color-100 rounded flex h-fit flex-col p-4">
                                                        <h5 className="pb-2 mb-0 text-text-color-100 text-2xl font-gilmer-medium">Connected wallet info</h5>
                                                        {account && (
                                                            <React.Fragment>
                                                                <div className="flex items-center">
                                                                    <span className="text-sm text-text-color-100 font-metro-semibold">Balance:</span>
                                                                    <span className="text-sm text-text-color-100 font-metro-regular ml-[0.188rem] flex items-center">
                                                                        {Decimal.format(balance, 2, ',')}
                                                                        <svg className="ml-1" width="10" height="14" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M9.51487 3.11111H0V24.8889H9.51487C15.9624 24.8889 20 20.2844 20 14C20 7.59111 15.8998 3.11111 9.51487 3.11111ZM9.42097 21.0311H4.25665V6.93778H9.42097C13.1768 6.93778 15.6808 9.76889 15.6808 13.9067C15.6808 18.1067 13.1768 21.0311 9.42097 21.0311Z" fill="#000000"/>
                                                                            <path d="M3.92 0H7.04989V6.22222H3.92V0Z" fill="#000000"/>
                                                                            <path d="M3.92 21.7778H7.04989V28H3.92V21.7778Z" fill="#000000"/>
                                                                            <path d="M8.61484 0H11.7447V6.22222H8.61484V0Z" fill="#000000"/>
                                                                            <path d="M8.61484 21.7778H11.7447V28H8.61484V21.7778Z" fill="#000000"/>
                                                                        </svg>
                                                                    </span>
                                                                </div>
                                                                {chain && (
                                                                    <div>
                                                                        <span className="text-sm text-text-color-100 font-metro-semibold">Current network: </span>
                                                                        <span className="text-sm text-text-color-100 font-metro-regular">{chain.network}</span>
                                                                    </div>
                                                                )}
                                                                <div className="duckies-hero__tooltip-box">
                                                                    <span className="text-sm text-text-color-100 font-metro-semibold">Current address: </span>
                                                                    <span className="text-sm text-text-color-100 font-metro-regular">{ENSName || account}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm text-text-color-100 font-metro-semibold">DUCKIES smart-contract address:</span>
                                                                    <div className="flex">
                                                                        <span className="text-xs text-text-color-70 font-metro-medium bg-neutral-control-color-20 pl-2.5 flex items-center w-[calc(100%-2.625rem)] rounded-tl rounded-bl break-all">{appConfig.duckiesSmartContractAddress}</span>
                                                                        <div className={classNames('relative flex justify-center items-center w-[2.625rem] h-[2.625rem] bg-primary-cta-color-60 hover:bg-primary-cta-color-80 rounded-tr rounded-br cursor-pointer', { '!bg-system-green-20 !hover:bg-system-green-20': isCopyClicked })} onClick={handleCopy}>
                                                                            {isCopyClicked && (
                                                                                <div className="absolute bg-text-color-0 border-2 border-text-color-100 rounded text-sm font-metro-regular font-normal text-text-color-100 py-4 px-[1.125rem] bottom-[calc(100%+0.563rem)]">
                                                                                    Copied
                                                                                </div>
                                                                            )}
                                                                            {isCopyClicked ? (
                                                                                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                    <path d="M0.75 5.75L3.75 8.75L11.25 1.25" stroke="#00401C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                                                </svg>
                                                                            ) : (
                                                                                <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                    <path d="M6.10117 0.800049C5.10706 0.800049 4.30117 1.60594 4.30117 2.60005V9.80005C4.30117 10.7942 5.10706 11.6 6.10117 11.6H11.5012C12.4953 11.6 13.3012 10.7942 13.3012 9.80005V4.77284C13.3012 4.29545 13.1115 3.83761 12.774 3.50005L10.6012 1.32726C10.2636 0.989691 9.80577 0.800049 9.32838 0.800049H6.10117Z" fill="#070707"/>
                                                                                    <path d="M0.701172 6.20005C0.701172 5.20594 1.50706 4.40005 2.50117 4.40005V13.4H9.70117C9.70117 14.3942 8.89528 15.2 7.90117 15.2H2.50117C1.50706 15.2 0.701172 14.3942 0.701172 13.4V6.20005Z" fill="#070707"/>
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </React.Fragment>
                                                        ) || (
                                                            <div>
                                                                <span className="text-sm text-text-color-100 font-metro-regular">Connect MetaMask to access your balance (Polygon network)</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                    {isReady ? (
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="text-2xl text-text-color-100 font-gilmer-medium flex items-center">
                                                {convertNumberToLiteral(balance ? +balance : 0)}
                                                <svg className="ml-2" width="14" height="20" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9.51487 3.11111H0V24.8889H9.51487C15.9624 24.8889 20 20.2844 20 14C20 7.59111 15.8998 3.11111 9.51487 3.11111ZM9.42097 21.0311H4.25665V6.93778H9.42097C13.1768 6.93778 15.6808 9.76889 15.6808 13.9067C15.6808 18.1067 13.1768 21.0311 9.42097 21.0311Z" fill="#000000"/>
                                                    <path d="M3.92 0H7.04989V6.22222H3.92V0Z" fill="#000000"/>
                                                    <path d="M3.92 21.7778H7.04989V28H3.92V21.7778Z" fill="#000000"/>
                                                    <path d="M8.61484 0H11.7447V6.22222H8.61484V0Z" fill="#000000"/>
                                                    <path d="M8.61484 21.7778H11.7447V28H8.61484V21.7778Z" fill="#000000"/>
                                                </svg>
                                            </div>
                                            <span className="text-sm text-text-color-60 font-metro-semibold">
                                                {ENSName || `${shortenHex(account, 4)}`}
                                            </span>
                                            {renderBalanceCircleButton}
                                        </div>
                                    ) : (
                                        renderBalanceCircleButton
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={classNames('group p-[6px] md:p-[10px] rounded-[50%] w-[97px] md:w-[174px] h-[97px] md:h-[174px] bg-primary-cta-color-20 mt-[-18px] md:mt-[-24px] ml-[228px] md:ml-[-78px] z-[9] absolute md:relative shadow-[-5px_5px] shadow-primary-cta-color-90 flex justify-center items-center', { 'hover:shadow-transparent hover:translate-y-[5px]': isReady })} onMouseEnter={handleHoverDuckImage}>
                            {renderDuck}
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};
