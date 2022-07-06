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
import chains from '../../../config/chains'
import * as ga from '../../../lib/ga';
import classNames from 'classnames';
import { loginWithProvider } from '../../../lib/SupabaseConnector';
import ReCAPTCHA from 'react-google-recaptcha';
import classnames from 'classnames';

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
    supabaseUser: any;
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
    supabaseUser,
}: DuckiesHeroProps) => {
    const [isMetaMaskInstalled, setMetaMaskInstalled] = useState<boolean>(true);
    const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
    const [isOpenBalancesInfo, setIsOpenBalancesInfo] = useState<boolean>(false);
    const [balance, setBalance] = useState<number | undefined>(undefined);
    const [isAddedMainChain, setAddedMainChain] = useState<boolean>(false);
    const [currentMetamaskChain, setCurrentMetamaskChain] = useState<number>(-1);
    const [isCopyClicked, setIsCopyClicked] = useState<boolean>(false);
    const [isCaptchaNotResolved, setIsCaptchaNotResolved] = React.useState<boolean>(true);

    let captcha: any = React.useRef();

    const dispatch = useAppDispatch();
    const duckiesContract = useDuckiesContract();
    const { connectWithProvider, disconnect } = useDApp();
    const { active, account, chain, signer } = useWallet();
    const ENSName = useENSName(account);
    const triedToEagerConnect = useEagerConnect();

    const onboarding = useRef<MetaMaskOnboarding>();
    const mainChain = useMemo(() => {
        return chains.find(chain => chain.chainId === appConfig.blockchain.mainChainId)
    }, []);
    const mainChainIdHex = useMemo(() => {
        return `0x${(mainChain?.chainId!).toString(16)}`
    }, [mainChain]);
    const supportedChain = useMemo(() => {
        return appConfig.blockchain.supportedChainIds.includes(chain?.chainId ?? currentMetamaskChain);
    }, [chain, currentMetamaskChain]);

    const isReady = useMemo(() => {
        return supportedChain && triedToEagerConnect && active && account;
    }, [supportedChain, triedToEagerConnect, active, account]);

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

    const getBalance = React.useCallback(async() => {
        if (account) {
            const balance = (await duckiesContract?.balanceOf(account).catch((error: any) => {
                console.error(error)
                return '0'
            })).toString();
            const decimals = await duckiesContract?.decimals().catch((error: any) => {
                console.error(error)
                return '2'
            });
            setBalance(balance / (10 ** decimals));
        }
    }, [account, duckiesContract]);

    const switchToMainChain = useCallback(async() => {
        try {
            await window?.ethereum?.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: mainChainIdHex }],
            });
            return true
        } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                return false
            }
            throw switchError
        }
    }, [mainChainIdHex])

    const addOrSwitchToMainChain = useCallback(async() => {
        try {
            const succeed = await switchToMainChain()
            if (succeed) {
                setAddedMainChain(true)
                return true
            } else {
                try {
                    await window?.ethereum?.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                        {
                            chainId: mainChainIdHex,
                            chainName: mainChain?.name,
                            rpcUrls: mainChain?.rpc,
                            nativeCurrency: mainChain?.nativeCurrency,
                            blockExplorerUrls: mainChain?.explorers?.map(exp => exp.url),
                        },
                        ],
                    });
                    setAddedMainChain(true)
                    return true
                } catch (addError: any) {
                    console.error(addError)
                    setAddedMainChain(false)
                    return false
                }
            }
        } catch (error: any) {
            console.error(error)
            setAddedMainChain(false)
            return false
        }
    }, [mainChain, mainChainIdHex, switchToMainChain, setAddedMainChain])

    useEffect(() => {
        if (!isCopyClicked)
            return;

        setTimeout(() => {
            setIsCopyClicked(false);
        }, 700);
    }, [isCopyClicked]);

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

        const switched = await addOrSwitchToMainChain()
        if (!switched) return

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
    }, [connectWithProvider, triedToEagerConnect, addOrSwitchToMainChain]);

    useEffect(() => {
        onboarding.current = new MetaMaskOnboarding();
        setMetaMaskInstalled(MetaMaskOnboarding.isMetaMaskInstalled());
    }, [])

    useEffect(() => {
        const handleChainChange = (chainId: string) => {
            setCurrentMetamaskChain(+chainId);
            setAddedMainChain(+chainId === mainChain?.chainId);
        }
        isBrowser() && window?.ethereum?.on('chainChanged', handleChainChange);

        return () => {
            isBrowser() && window?.ethereum?.off('chainChanged', handleChainChange);
        };
    }, [mainChain, setCurrentMetamaskChain, setAddedMainChain, isBrowser])

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

        captcha.reset();

        if (!isReferralClaimed && !isCaptchaNotResolved) {
            const token = localStorage.getItem('referral_token');
            setIsCaptchaNotResolved(false);

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


    const handleClaimButtonClick = useCallback(async () => {
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

        const added = await switchToMainChain()
        setAddedMainChain(added)
    }, [isReady, getBountiesClaimableAmount, isReferralClaimed, switchToMainChain, setAddedMainChain]);

    const handleSocialAuth = React.useCallback((provider: string) => {
        loginWithProvider(provider);
    }, []);

    const renderMetamaskModalBody = React.useMemo(() => {
        return (
            <div className="flex flex-col w-full">
                <div className="flex justify-center mb-4">
                    <Image width="156px" height="156px" src="/images/components/duckies/duckMetamask.png" alt="duck-no-rewards" />
                </div>
                <div className="text-text-color-100 text-sm text-center font-metro-regular font-medium mb-6">
                    Connect Metamask wallet in order to be able to get Duckies tokens
                </div>
                <div className="flex items-center justify-center mb-8">
                    {isAddedMainChain && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 13L9 17L19 7" stroke="#419E6A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    )}
                    <div
                        onClick={() => addOrSwitchToMainChain()}
                        className={[
                            'button-link cursor-pointer font-bold text-center underline px-2',
                            isAddedMainChain ? 'active no-underline' : undefined
                        ].join(' ')}
                    >
                        <span>Switch to {mainChain?.name?.split(' ')[0]} network</span>
                    </div>
                </div>
                <div className="flex items-center justify-center">
                    <div onClick={() => handleMetamask(isMetaMaskInstalled, 'Injected')} className="button button--outline button--secondary button--shadow-secondary">
                        <span className="button__inner">{isMetaMaskInstalled ? 'Connect Metamask' : 'Install Metamask'}</span>
                    </div>
                </div>
            </div>
        );
    }, [handleMetamask, isMetaMaskInstalled, isAddedMainChain, addOrSwitchToMainChain, mainChain]);

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
                <div>
                    <ReCAPTCHA
                        ref={e => {captcha = e}}
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY || 'changeme'}
                        onChange={() => setIsCaptchaNotResolved(false)}
                        className="mb-5"
                    />
                </div>
                <div className="flex items-center justify-center">
                    <div className={claimButtonContainerClassName} onClick={() => handleClaimRewards(amountToClaim)}>
                        <button className={claimButtonClassName} disabled={isCaptchaNotResolved}>Claim all</button>
                    </div>
                </div>
            </React.Fragment>
        );
    }, [isReferralClaimed, getBountiesClaimableAmount, handleClaimRewards, captcha, isCaptchaNotResolved]);

    const renderClaimRewardModalBody = React.useMemo(() => {
        return (
            <div className="flex flex-col w-full">
                <div className="flex justify-center mb-4">
                    <Image width="156px" height="156px" src="/images/components/duckies/duckDetective.png" alt="duck-detective" />
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

        if (!supabaseUser) {
            return 'Connect social';
        }

        return 'Claim reward';
    }, [isReady, supabaseUser]);

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
        const token = isBrowser() && localStorage.getItem('referral_token');

        if (!isReady) {
            return renderMetamaskModalBody;
        }

        if (!supabaseUser) {
            return renderSocialsModalBody;
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
        renderSocialsModalBody,
        supabaseUser,
    ]);

    const handleSendGAEvent = React.useCallback(() => {
        ga.event({
            action: "duckies_hero_earn_click",
        });
    }, []);

    const handleCopy = React.useCallback(() => {
        navigator.clipboard.writeText(appConfig.duckzSmartContractAddress);
        setIsCopyClicked(true);
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
                                The Fun and Friendly
                                Web3 reward Token
                            </div>
                        </div>
                        <div className="flex mt-8 flex-col lg:flex-row gap-3">
                            <div onClick={handleClaimButtonClick} className="w-full lg:w-fit button button--outline button--secondary button--shadow-secondary">
                                <span className="button__inner !text-2xl !p-4 !justify-center">Claim your reward</span>
                            </div>
                            <Link href="#earn-more">
                                <a className="sm:mt-0 w-full lg:w-fit button button--secondary button--shadow-secondary" onClick={handleSendGAEvent}>
                                    <span className="button__inner !text-2xl !p-4 !justify-center">
                                        Earn more
                                    </span>
                                </a>
                            </Link>
                        </div>
                        <Link href="#faq">
                            <a className="group font-metro-bold text-text-color-100 mt-4 hover:text-text-color-100 prevent-default">
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
                                        <div onMouseEnter={() => setIsOpenBalancesInfo(true)} onMouseLeave={() => setIsOpenBalancesInfo(false)} className="flex ml-[0.813rem] sm:relative">
                                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="z-[101] cursor-pointer">
                                                <path d="M11 14H10V10H9M10 6H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            {isOpenBalancesInfo &&
                                                <div className="z-[100] absolute left-[1.125rem] sm:left-auto right-[1.125rem] sm:right-0 mt-[1.875rem] sm:mt-0 sm:pt-[1.875rem] sm:min-w-[27.813rem] w-[calc(100vw-2.25rem)] sm:w-fit">
                                                    <div className="bg-text-color-0 border-2 border-text-color-100 rounded flex h-fit flex-col p-4">
                                                        <h5 className="pb-2 mb-0 text-text-color-100 text-2xl font-gilmer-medium">Connected wallet info</h5>
                                                        {account && (
                                                            <React.Fragment>
                                                                <div className="flex items-center">
                                                                    <span className="text-sm text-text-color-100 font-metro-semibold">Balance:</span>
                                                                    <span className="text-sm text-text-color-100 font-metro-regular ml-[0.188rem] flex items-center">
                                                                        {convertNumberToLiteral(balance ? +balance : 0)}
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
                                                                    <span className="text-sm text-text-color-100 font-metro-semibold">DUCKZ smart-contract address:</span>
                                                                    <div className="flex">
                                                                        <span className="text-xs text-text-color-70 font-metro-medium bg-neutral-control-color-20 pl-2.5 flex items-center w-[calc(100%-2.625rem)] rounded-tl-1.5 rounded-bl-1.5 break-all">{appConfig.duckzSmartContractAddress}</span>
                                                                        <div className={classNames('relative flex justify-center items-center w-[2.625rem] h-[2.625rem] bg-primary-cta-color-60 hover:bg-primary-cta-color-80 rounded-tr-1.5 rounded-br-1.5 cursor-pointer', { '!bg-system-green-20 !hover:bg-system-green-20': isCopyClicked })} onClick={handleCopy}>
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
                                            <div onClick={handleDisconnect} className="text-center w-1/2 lg:w-full mr-6 lg:mr-0 mt-4 !mr-0 button button--outline button--secondary button--shadow-secondary">
                                                <span className="button__inner !py-1.5 !px-[1.125rem] !justify-center">Log out</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div onClick={() => handleMetamask(isMetaMaskInstalled, 'Injected')} className="w-full button button--outline button--secondary button--shadow-secondary">
                                            <span className="button__inner !py-1.5 !px-[1.125rem] !justify-center">{isMetaMaskInstalled ? 'Connect Metamask' : 'Install Metamask'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-1.5 md:p-2.5 rounded-[50%] w-[6.063rem] md:w-[10.875rem] h-[6.063rem] md:h-[10.875rem] bg-primary-cta-color-20 mt-[-1.125rem] md:mt-[-1.5rem] ml-[14.25rem] md:ml-[-4.875rem] z-[9] absolute md:relative shadow-[-0.313rem_0.313rem] shadow-primary-cta-color-90">
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
