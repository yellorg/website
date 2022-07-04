import { UnsupportedChainIdError } from '@web3-react/core'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import MetaMaskOnboarding from '@metamask/onboarding';
import type { ProviderWhitelist } from '../../../hooks/useDApp';
import useDApp from '../../../hooks/useDApp';
import useWallet from '../../../hooks/useWallet';
import { shortenHex } from '../../../utils/utils';
import { useENSName } from '../../../hooks/useENSName';
import { DuckiesConnectorModalWindow } from '../DuckiesConnectModalWindow';
import { useEagerConnect } from '../../../hooks/useEagerConnect';
import useDuckiesContract from '../../../hooks/useDuckiesContract';
import { appConfig } from '../../../config/app';
import { convertNumberToLiteral } from '../../../helpers/convertNumberToLiteral';
import Image from 'next/image';
import { dispatchAlert } from '../../../features/alerts/alertsSlice';
import { useAppDispatch } from '../../../app/hooks';
import { isBrowser } from '../../../helpers';

import * as ga from '../../../lib/ga';
import classNames from 'classnames';

interface DuckiesHeroProps {
    bountiesToClaim: string[];
    handleClaimAllBounties: (amountToClaim: number) => void;
    bountyItems: any[];
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
    isRewardsClaimed: boolean;
    setIsRewardsClaimed: (value: boolean) => void;
    affiliates: number[];
    isSingleBountyProcessing: boolean;
    isReferralClaimed: boolean;
    setIsReferralClaimed: (value: boolean) => void;
}

export const DuckiesHero: React.FC<DuckiesHeroProps> = ({
    bountiesToClaim,
    handleClaimAllBounties,
    bountyItems,
    isLoading,
    setIsLoading,
    isRewardsClaimed,
    setIsRewardsClaimed,
    affiliates,
    isSingleBountyProcessing,
    isReferralClaimed,
    setIsReferralClaimed,
}: DuckiesHeroProps) => {
    const [isMetaMaskInstalled, setMetaMaskInstalled] = useState<boolean>(true);
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
    const [isOpenBalancesInfo, setIsOpenBalancesInfo] = useState<boolean>(false);
    const [balance, setBalance] = useState<number | undefined>(undefined);

    const dispatch = useAppDispatch();
    const duckiesContract = useDuckiesContract();
    const { connectWithProvider, disconnect } = useDApp();
    const { active, account, chain, signer } = useWallet();
    const ENSName = useENSName(account);
    const triedToEagerConnect = useEagerConnect();

    const onboarding = useRef<MetaMaskOnboarding>();
    const supportedChain = useMemo(() => {
        return appConfig.blockchain.supportedChainIds.includes(chain?.chainId ?? -1);
    }, [chain]);

    const isReady = useMemo(() => {
        return supportedChain && triedToEagerConnect && active && account;
    }, [supportedChain, triedToEagerConnect, active, account]);
;
    const getBalance = React.useCallback(async() => {
        if (account) {
            const balance = (await duckiesContract?.balanceOf(account)).toString();
            const decimals = await duckiesContract?.decimals();

            setBalance(balance);
            setBalance(balance / (10 ** decimals));
        }
    }, [account, duckiesContract]);

    useEffect(() => {
        if (isRewardsClaimed) {
            getBalance();
            setIsRewardsClaimed(false);
        }
    }, [isRewardsClaimed]);

    useEffect(() => {
        if (!isReady) {
            return;
        }

        (async () => {
            const token = localStorage.getItem('referral_token');
            const referralLimit = +await duckiesContract?.getAccountBountyLimit('referral');

            setIsReferralClaimed(!token || referralLimit === 1 || affiliates[0] > 0 || (balance && balance > 0 || false));

            if (referralLimit === 1 || affiliates[0] > 0) {
                localStorage.removeItem('referral_token');
            }
        })();
    }, [isReady, duckiesContract, isRewardsClaimed, affiliates, balance]);

    useEffect(() => {
        if (isReady) {
            getBalance();
        }
    }, [isReady, getBalance]);

    const handleConnectWallet = useCallback(async (provider: ProviderWhitelist) => {
        if (!triedToEagerConnect) return;

        const isMetamaskUnlocked = await (window as any)?.ethereum._metamask?.isUnlocked();

        if (!isMetamaskUnlocked) {
            console.warn('alerts.message.wallet.metamask.locked');
        }

        connectWithProvider(provider).then(() => {
            console.log('removeConnectWalletAlert');
        }).catch(async (error) => {
            if (
                error instanceof UnsupportedChainIdError &&
                !error
                    .toString()
                    .includes('Supported chain ids are: undefined')
            ) {
                console.log('success');
            } else {
                console.error('handleConnectWallet: sign error');
            }
        });
    }, [connectWithProvider, triedToEagerConnect]);

    useEffect(() => {
        onboarding.current = new MetaMaskOnboarding();
        setMetaMaskInstalled(MetaMaskOnboarding.isMetaMaskInstalled());
    }, [])

    const handleMetamask = React.useCallback((isMetaMaskInstalled: boolean, id: ProviderWhitelist) => {
        if (isMetaMaskInstalled) {
            handleConnectWallet(id);
            ga.event({
                action: "duckies_connect_metamask_click",
                params: {
                    source: 'hero',
                },
            });
        } else {
            onboarding.current?.startOnboarding();
            ga.event({
                action: "duckies_hero_metamask_install_click",
            });
        }
    }, [handleConnectWallet, onboarding]);

    const handleDisconnect = React.useCallback(() => {
        disconnect();
    }, [disconnect]);

    const handleClaimRewards = React.useCallback(async (amountToClaim: number) => {
        if (isLoading || isSingleBountyProcessing || (isReferralClaimed && !bountiesToClaim.length)) {
            return;
        }

        if (!isReferralClaimed) {
            const token = localStorage.getItem('referral_token');

            if (token && signer && account) {
                setIsLoading(true);

                try {
                    const response = await fetch(`/api/tx?token=${token}&account=${account}`);

                    if (response.status !== 400 && response.status !== 500) {
                        const { transaction } = await response.json();

                        const tx = await signer.sendTransaction(transaction);
                        await tx.wait();
                        localStorage.removeItem('referral_token');
                        dispatch(dispatchAlert({
                            type: 'success',
                            title: 'Success',
                            message: 'You have successfully claimed the reward!',
                        }));
                        setIsRewardsClaimed(true);
                        ga.event({
                            action: "duckies_claim_success",
                            params: {
                                duckies_amount_claim: 10000,
                            }
                        });
                    } else {
                        localStorage.removeItem('referral_token');
                        dispatch(dispatchAlert({
                            type: 'error',
                            title: 'Error',
                            message: 'Something went wrong! Please, try again!',
                        }));
                    }
                } catch (error) {
                    dispatch(dispatchAlert({
                        type: 'error',
                        title: 'Error',
                        message: 'Something went wrong! Please, try again!',
                    }));
                }

                setIsLoading(false);
            }
        } else {
            if (bountiesToClaim.length) {
                setIsLoading(true);
                await handleClaimAllBounties(amountToClaim);
                setIsLoading(false);
            }
        }
    }, [
        signer,
        account,
        isLoading,
        setIsLoading,
        bountiesToClaim,
        isReferralClaimed,
        handleClaimAllBounties,
        dispatch,
        setIsRewardsClaimed,
        isSingleBountyProcessing,
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


    const handleClaimButtonClick = React.useCallback(() => {
        setIsOpenModal(true);

        if (isReady) {
            const [amountToClaim] = !isReferralClaimed ? [10000, ['Referral reward']] : getBountiesClaimableAmount();
            ga.event({
                action: "duckies_hero_claim_click",
                params: {
                    duckies_amount_claim: amountToClaim,
                }
            });
        } else {
            ga.event({
                action: "duckies_hero_claim_show_auth_click",
            });
        }
    }, [isReady, getBountiesClaimableAmount, isReferralClaimed]);

    const renderMetamaskModalBody = React.useMemo(() => {
        return (
            <div className="flex flex-col w-full">
                <div className="flex justify-center mb-4">
                    <Image width="156px" height="156px" src="/images/components/duckies/duckMetamask.png" alt="duck-no-rewards" />
                </div>
                <div className="text-text-color-100 text-sm text-center font-metro-regular font-medium mb-6">
                    Connect Metamask wallet in order to be able to get Duckies tokens
                </div>
                <div className="flex items-center justify-center">
                    <div onClick={() => handleMetamask(isMetaMaskInstalled, 'Injected')} className="button button--outline button--secondary button--shadow-secondary">
                        <span className="button__inner">{isMetaMaskInstalled ? 'Connect Metamask' : 'Install Metamask'}</span>
                    </div>
                </div>
            </div>
        );
    }, [handleMetamask, isMetaMaskInstalled]);

    const renderLoadingModalBody = React.useMemo(() => {
        return (
            <React.Fragment>
                <div className="text-text-color-100 text-sm text-center font-metro-regular font-medium mb-6">
                    In order for the on-chain transaction to be executed please wait a couple of minutes. Time may vary depending on the queue & gas.
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

    const renderClaimModalBody = React.useMemo(() => {
        const [amountToClaim, bountyTitles]: any = !isReferralClaimed ? [10000, ['Referral reward']] : getBountiesClaimableAmount();
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
                <div className="flex items-center justify-center">
                    <div className="button button--outline button--secondary button--shadow-secondary" onClick={() => handleClaimRewards(amountToClaim)}>
                        <span className="button__inner">Claim all</span>
                    </div>
                </div>
            </React.Fragment>
        );
    }, [isReferralClaimed, getBountiesClaimableAmount, handleClaimRewards]);

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

    const renderModalTitle = React.useMemo(() => {
        if (!isReady) {
            return 'Connect Wallet';
        }

        return 'Claim reward';
    }, [isReady]);

    const renderModalBody = React.useMemo(() => {
        const token = isBrowser() && localStorage.getItem('referral_token');

        if (!isReady) {
            return renderMetamaskModalBody;
        }

        if ((isReferralClaimed && !bountiesToClaim.length) || (!isReferralClaimed && !token)) {
            return renderNoRewardsModalBody;
        }

        return renderClaimRewardModalBody;
    }, [
        isReady,
        isReferralClaimed,
        bountiesToClaim,
        renderMetamaskModalBody,
        renderNoRewardsModalBody,
        renderClaimRewardModalBody,
    ]);

    const handleSendGAEvent = React.useCallback(() => {
        ga.event({
            action: "duckies_hero_earn_click",
        });
    }, []);

    const handleCopy = React.useCallback(() => {
        navigator.clipboard.writeText(appConfig.duckzSmartContractAddress);
    }, []);

    return (
        <React.Fragment>
            <div className="flex justify-between pb-[168px] flex-col sm:flex-row pt-[42px] sm:pt-8 duckies-hero">
                <div className="flex flex-col sm:flex-row mx-auto px-[14px] max-w-md-layout 2xl:max-w-lg-layout-2p">
                    <div className="flex flex-col justify-start mb-[60px] sm:mb-0">
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
                            <div className="text-text-color-100 font-gilmer-bold text-[60px] leading-[64px]">
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
                                The Fun and Friendly 
                                Web3 reward Token
                            </div>
                        </div>
                        <div className="flex mt-[32px] flex-col lg:flex-row gap-[12px]">
                            <div onClick={handleClaimButtonClick} className="w-full lg:w-fit button button--outline button--secondary button--shadow-secondary">
                                <span className="button__inner !text-[24px] !leading-[32px] !p-[16px] !justify-center">Claim your reward</span>
                            </div>
                            <Link href="#earn-more">
                                <a className="sm:mt-0 w-full lg:w-fit button button--secondary button--shadow-secondary" onClick={handleSendGAEvent}>
                                    <span className="button__inner !text-[24px] !leading-[32px] !p-[16px] !justify-center">
                                        Earn more
                                    </span>
                                </a>
                            </Link>
                        </div>
                    </div>
                    <div className="flex pt-20 justify-center sm:justify-end w-full">
                        <div className="p-[16px] rounded-[50%] w-[300px] h-[300px] bg-primary-cta-color-10 z-[10] border-2 border-primary-cta-layer-color-60 shadow-[-5px_5px_#CC8F18] button--shadow-secondary">
                            <div className="flex flex-col items-center justify-center rounded-[50%] h-full bg-primary-cta-color-10 border border-primary-cta-color-90 z-[10]">
                                <div>
                                    <div className="flex justify-between items-center mb-[8px]">
                                        <div className={classNames('uppercase font-gilmer-bold text-primary-cta-layer-color-60', {'text-[24px] leading-[32px]': isReady, 'text-[30px] leading-[40px]': !isReady})}>
                                            Balance
                                        </div>
                                        <div onMouseEnter={() => setIsOpenBalancesInfo(true)} onMouseLeave={() => setIsOpenBalancesInfo(false)} className="flex ml-[13px] sm:relative">
                                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="z-[101] cursor-pointer">
                                                <path d="M11 14H10V10H9M10 6H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            {isOpenBalancesInfo &&
                                                <div className="z-[100] absolute left-[18px] sm:left-auto right-[18px] sm:right-0 mt-[30px] sm:mt-0 sm:pt-[30px] sm:min-w-[445px] w-[calc(100vw-36px)] sm:w-fit">
                                                    <div className="bg-text-color-0 border-2 border-text-color-100 rounded flex h-fit flex-col p-[16px]">
                                                        <h5 className="pb-[8px] mb-0 text-text-color-100 text-[24px] leading-[32px] font-gilmer-medium">Connected wallet info</h5>
                                                        {account && (
                                                            <React.Fragment>
                                                                <div className="flex items-center">
                                                                    <span className="text-[14px] leading-[22px] text-text-color-100 font-metro-semibold">Balance:</span>
                                                                    <span className="text-[14px] leading-[22px] text-text-color-100 font-metro-regular ml-[3px] flex items-center">
                                                                        {convertNumberToLiteral(balance ? +balance : 0)}
                                                                        <svg className="ml-[4px]" width="10" height="14" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                                                                        <span className="text-[14px] leading-[22px] text-text-color-100 font-metro-semibold">Current network: </span>
                                                                        <span className="text-[14px] leading-[22px] text-text-color-100 font-metro-regular">{chain.network}</span>
                                                                    </div>
                                                                )}
                                                                <div className="duckies-hero__tooltip-box">
                                                                    <span className="text-[14px] leading-[22px] text-text-color-100 font-metro-semibold">Current address: </span>
                                                                    <span className="text-[14px] leading-[22px] text-text-color-100 font-metro-regular">{ENSName || account}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-[14px] leading-[22px] text-text-color-100 font-metro-semibold">DUCKZ smart-contract address:</span>
                                                                    <div className="flex">
                                                                        <span className="text-[13px] leading-[14px] text-text-color-70 font-metro-medium bg-neutral-control-color-20 pl-[10px] flex items-center w-[calc(100%-42px)] rounded-tl-[6px] rounded-bl-[6px] break-all">{appConfig.duckzSmartContractAddress}</span>
                                                                        <div className="flex justify-center items-center w-[42px] h-[42px] bg-primary-cta-color-60 rounded-tr-[6px] rounded-br-[6px] cursor-pointer" onClick={handleCopy}>
                                                                            <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M6.10117 0.800049C5.10706 0.800049 4.30117 1.60594 4.30117 2.60005V9.80005C4.30117 10.7942 5.10706 11.6 6.10117 11.6H11.5012C12.4953 11.6 13.3012 10.7942 13.3012 9.80005V4.77284C13.3012 4.29545 13.1115 3.83761 12.774 3.50005L10.6012 1.32726C10.2636 0.989691 9.80577 0.800049 9.32838 0.800049H6.10117Z" fill="#070707"/>
                                                                                <path d="M0.701172 6.20005C0.701172 5.20594 1.50706 4.40005 2.50117 4.40005V13.4H9.70117C9.70117 14.3942 8.89528 15.2 7.90117 15.2H2.50117C1.50706 15.2 0.701172 14.3942 0.701172 13.4V6.20005Z" fill="#070707"/>
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </React.Fragment>
                                                        ) || (
                                                            <div>
                                                                <span className="text-[14px] leading-[22px] text-text-color-100 font-metro-regular">Connect MetaMask to access your balance (Polygon network)</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                    {isReady ? (
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="text-[24px] leading-[32px] text-text-color-100 font-gilmer-medium flex items-center">
                                                {convertNumberToLiteral(balance ? +balance : 0)}
                                                <svg className="ml-[8px]" width="14" height="20" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9.51487 3.11111H0V24.8889H9.51487C15.9624 24.8889 20 20.2844 20 14C20 7.59111 15.8998 3.11111 9.51487 3.11111ZM9.42097 21.0311H4.25665V6.93778H9.42097C13.1768 6.93778 15.6808 9.76889 15.6808 13.9067C15.6808 18.1067 13.1768 21.0311 9.42097 21.0311Z" fill="#000000"/>
                                                    <path d="M3.92 0H7.04989V6.22222H3.92V0Z" fill="#000000"/>
                                                    <path d="M3.92 21.7778H7.04989V28H3.92V21.7778Z" fill="#000000"/>
                                                    <path d="M8.61484 0H11.7447V6.22222H8.61484V0Z" fill="#000000"/>
                                                    <path d="M8.61484 21.7778H11.7447V28H8.61484V21.7778Z" fill="#000000"/>
                                                </svg>
                                            </div>
                                            <span className="text-[14px] text-text-color-60 font-metro-semibold">
                                                {ENSName || `${shortenHex(account, 4)}`}
                                            </span>
                                            <div onClick={handleDisconnect} className="text-center w-1/2 lg:w-full mr-[24px] lg:mr-0 mt-[16px] !mr-0 button button--outline button--secondary button--shadow-secondary">
                                                <span className="button__inner !py-[6px] !px-[18px] !justify-center">Log out</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div onClick={() => handleMetamask(isMetaMaskInstalled, 'Injected')} className="w-full button button--outline button--secondary button--shadow-secondary">
                                            <span className="button__inner !py-[6px] !px-[18px] !justify-center">{isMetaMaskInstalled ? 'Connect Metamask' : 'Install Metamask'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-[6px] md:p-[10px] rounded-[50%] w-[97px] md:w-[174px] h-[97px] md:h-[174px] bg-primary-cta-color-20 mt-[-18px] md:mt-[-24px] ml-[228px] md:ml-[-78px] z-[9] absolute md:relative shadow-[-5px_5px] shadow-primary-cta-color-90">
                            <div className="flex items-center justify-center rounded-[50%] h-full border border-primary-cta-color-90">
                                <LazyLoadImage
                                    srcSet={`${'/images/components/duckies/duck.png'}`}
                                    effect="blur"
                                    threshold={200}
                                />
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
