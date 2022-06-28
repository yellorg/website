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
            <div className="cr-bounty-modal__body">
                <div className="cr-bounty-modal__body-image">
                    <Image width="156px" height="156px" src="/images/components/duckies/duckMetamask.svg" alt="duck-no-rewards" />
                </div>
                <div className="cr-bounty-modal__body-description">
                    Connect Metamask wallet in order to be able to get Duckies tokens
                </div>
                <div className="cr-bounty-modal__body-buttons buttons-justify-center">
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

    const renderClaimModalBody = React.useMemo(() => {
        const [amountToClaim, bountyTitles]: any = !isReferralClaimed ? [10000, ['Referral reward']] : getBountiesClaimableAmount();
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
                    <div className="button button--outline button--secondary button--shadow-secondary" onClick={() => handleClaimRewards(amountToClaim)}>
                        <span className="button__inner">Claim all</span>
                    </div>
                </div>
            </React.Fragment>
        );
    }, [isReferralClaimed, getBountiesClaimableAmount, handleClaimRewards]);

    const renderClaimRewardModalBody = React.useMemo(() => {
        return (
            <div className="cr-bounty-modal__body">
                <div className="cr-bounty-modal__body-image">
                    <Image width="156px" height="156px" src="/images/components/duckies/duckDetective.svg" alt="duck-no-rewards" />
                </div>
                {(isLoading || isSingleBountyProcessing) ? renderLoadingModalBody : renderClaimModalBody}
            </div>
        );
    }, [isLoading, renderLoadingModalBody, renderClaimModalBody, isSingleBountyProcessing]);

    const renderNoRewardsModalBody = React.useMemo(() => {
        return (
            <div className="cr-bounty-modal__body">
                <div className="cr-bounty-modal__body-image">
                    <Image width="156px" height="156px" src="/images/components/duckies/duckNoRewards.svg" alt="duck-no-rewards" />
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

    return (
        <React.Fragment>
            <div className="duckies-hero">
                <div className="container">
                    <div className="duckies-hero__info">
                        <div className="duckies-hero__info-selebration">
                            <LazyLoadImage className="section__main-img"
                                srcSet={`${'/images/components/duckies/selebration.svg'}`}
                                effect="blur"
                                threshold={200}
                            />
                        </div>
                        <div className="duckies-hero__info-received">
                            <div className="duckies-hero__info-received-message">
                                Go and get your DUCKZ tokens!
                            </div>
                        </div>
                        <div className="duckies-hero__info-buttons">
                            <div onClick={handleClaimButtonClick} className="duckies-hero__info-buttons-claim button button--outline button--secondary button--shadow-secondary">
                                <span className="button__inner">Claim your reward</span>
                            </div>
                            <Link href="#earn-more">
                                <a className="duckies-hero__info-buttons-earn button button--secondary button--shadow-secondary" onClick={handleSendGAEvent}>
                                    <span className="button__inner">
                                        Earn more
                                    </span>
                                </a>
                            </Link>
                        </div>
                    </div>
                    <div className="duckies-hero__icons">
                        <div className="duckies-hero__icons-balance button--shadow-secondary">
                            <div className="duckies-hero__icons-balance-body">
                                <div className="duckies-hero__icons-balance-body-content">
                                    <div className="duckies-hero__icons-balance-body-content-title">
                                        <div className="duckies-hero__icons-balance-body-content-title-name">
                                            Balance
                                        </div>
                                        <div onMouseEnter={() => setIsOpenBalancesInfo(true)} onMouseLeave={() => setIsOpenBalancesInfo(false)} className="duckies-hero__icons-balance-body-content-title-icon">
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M11 14H10V10H9M10 6H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            {isOpenBalancesInfo &&
                                                <div className="duckies-hero__tooltip">
                                                    <h5 className="duckies-hero__tooltip-header">Connected wallet info</h5>
                                                    {account && (
                                                        <React.Fragment>
                                                            <div className="duckies-hero__tooltip-box">
                                                                <span className="duckies-hero__tooltip-box-title">Current address: </span>
                                                                <span className="duckies-hero__tooltip-box-text">{ENSName || account}</span>
                                                            </div>
                                                            {chain && (
                                                                <div>
                                                                    <span className="duckies-hero__tooltip-box-title">Current network: </span>
                                                                    <span className="duckies-hero__tooltip-box-text">{chain.network}</span>
                                                                </div>
                                                            )}
                                                            <div className="duckies-hero__tooltip-balance">
                                                                <span className="duckies-hero__tooltip-box-title">Balance:</span>
                                                                <span className="duckies-hero__tooltip-box-text duckies-hero__tooltip-box-balance">
                                                                    {balance}
                                                                    <svg width="14" height="20" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M9.51487 3.11111H0V24.8889H9.51487C15.9624 24.8889 20 20.2844 20 14C20 7.59111 15.8998 3.11111 9.51487 3.11111ZM9.42097 21.0311H4.25665V6.93778H9.42097C13.1768 6.93778 15.6808 9.76889 15.6808 13.9067C15.6808 18.1067 13.1768 21.0311 9.42097 21.0311Z" fill="#000000"/>
                                                                        <path d="M3.92 0H7.04989V6.22222H3.92V0Z" fill="#000000"/>
                                                                        <path d="M3.92 21.7778H7.04989V28H3.92V21.7778Z" fill="#000000"/>
                                                                        <path d="M8.61484 0H11.7447V6.22222H8.61484V0Z" fill="#000000"/>
                                                                        <path d="M8.61484 21.7778H11.7447V28H8.61484V21.7778Z" fill="#000000"/>
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                        </React.Fragment>
                                                    ) || (
                                                        <div className="duckies-hero__tooltip-box">
                                                            <span className="duckies-hero__tooltip-box-message">Connect MetaMask to access your balance (Polygon network)</span>
                                                        </div>
                                                    )}
                                                </div>
                                            }
                                        </div>
                                    </div>
                                    {isReady ? (
                                        <div className="duckies-hero__balance">
                                            <div className="duckies-hero__balance-amount">
                                                {convertNumberToLiteral(balance ? +balance : 0)}
                                                <svg width="14" height="20" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9.51487 3.11111H0V24.8889H9.51487C15.9624 24.8889 20 20.2844 20 14C20 7.59111 15.8998 3.11111 9.51487 3.11111ZM9.42097 21.0311H4.25665V6.93778H9.42097C13.1768 6.93778 15.6808 9.76889 15.6808 13.9067C15.6808 18.1067 13.1768 21.0311 9.42097 21.0311Z" fill="#000000"/>
                                                    <path d="M3.92 0H7.04989V6.22222H3.92V0Z" fill="#000000"/>
                                                    <path d="M3.92 21.7778H7.04989V28H3.92V21.7778Z" fill="#000000"/>
                                                    <path d="M8.61484 0H11.7447V6.22222H8.61484V0Z" fill="#000000"/>
                                                    <path d="M8.61484 21.7778H11.7447V28H8.61484V21.7778Z" fill="#000000"/>
                                                </svg>
                                            </div>
                                            <span className="duckies-hero__balance-address">
                                                {ENSName || `${shortenHex(account, 4)}`}
                                            </span>
                                            <div onClick={handleDisconnect} className="duckies-hero__info-buttons-claim duckies-hero__balance-logout button button--outline button--secondary button--shadow-secondary">
                                                <span className="button__inner">Logout</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div onClick={() => handleMetamask(isMetaMaskInstalled, 'Injected')} className="button button--outline button--secondary button--shadow-secondary">
                                            <span className="button__inner">{isMetaMaskInstalled ? 'Connect Metamask' : 'Install Metamask'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="duckies-hero__icons-duck">
                            <div className="duckies-hero__icons-duck-body">
                                <LazyLoadImage className="duckies-hero__icons-duck-body-img"
                                    srcSet={`${'/images/components/duckies/duck.svg'}`}
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
