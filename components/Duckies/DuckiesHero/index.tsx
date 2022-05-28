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

export const DuckiesHero = () => {
    const [isMetaMaskInstalled, setMetaMaskInstalled] = useState<boolean>(true);
    const [isOpenConnect, setIsOpenConnect] = useState<boolean>(false);
    const [balance, setBalance] = useState<number | undefined>(undefined);

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

            setBalance(balance);
        }
    }, [account, duckiesContract]);

    useEffect(() => {
        if (isReady) {
            setIsOpenConnect(false);

            getBalance();
        }
    }, [isReady]);

    const handleConnectWallet = useCallback(
        async (provider: ProviderWhitelist) => {
            if (!triedToEagerConnect) return

            // Metamask exposes experimental methods under 'ethereum._metamask' property.
            // 'ethereum._metamask.isUnlocked' may be removed or changed without warning.
            // There is no other stable solution to detect Metamask 'unlocked' status right now.
            // Details: https://docs.metamask.io/guide/ethereum-provider.html#ethereum-metamask-isunlocked
            // Future breaking changes can be found here https://medium.com/metamask
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
            })
        },
        [connectWithProvider, triedToEagerConnect],
    )

    useEffect(() => {
        onboarding.current = new MetaMaskOnboarding();
        setMetaMaskInstalled(MetaMaskOnboarding.isMetaMaskInstalled());
    }, [])

    const handleMetamask = (isMetaMaskInstalled: boolean, id: ProviderWhitelist) => {
        if (isMetaMaskInstalled) {
            handleConnectWallet(id);
        } else {
            onboarding.current?.startOnboarding();
        }
    }

    const handleDisconnect = React.useCallback(() => {
        disconnect();
    }, []);

    const renderMetamaskAccount = () => {
        return (
            <div className="flex items-center text-base font-bold text-gray-700 group-hover:text-gray-900">
                <span>
                    {ENSName || `${shortenHex(account, 4)}`}
                </span>
                {chain && (
                    <div className="ml-1 px-2 py-1 text-xs font-medium uppercase rounded-full bg-secondary-cta-color-10 text-secondary-cta-color-90">{chain.network}</div>
                )}
                {balance && (
                    <div className="ml-1 px-2 py-1 text-xs font-medium uppercase rounded-full bg-secondary-cta-color-10 text-secondary-cta-color-90">{balance}</div>
                )}
                <div onClick={handleDisconnect}>logout</div>
            </div>
        );
    }

    const renderMetamaskButton = () => (
        <div onClick={() => handleMetamask(isMetaMaskInstalled, 'Injected')} className="button button--outline button--secondary button--shadow-secondary">
            <span className="button__inner">{isMetaMaskInstalled ? 'Connect Metamask' : 'Install Metamask'}</span>
        </div>
    );

    const handleClaimReward = React.useCallback(async (token: string) => {
        if (signer && account) {
            const { transaction } = await (await fetch(`/api/txReferralHash?token=${token}&account=${account}`)).json();

            try {
                const tx = await signer.sendTransaction(transaction);
                await tx.wait();
                localStorage.removeItem('referral_token');
            } catch (error) {
                console.log(error);
            }
        }
    }, [duckiesContract, signer, account]);

    const handleClaimBounty = React.useCallback(async (token: string) => {
        if (signer && account) {
            const { transaction } = await (await fetch(`/api/txBountyHash?token=${token}&account=${account}`)).json();

            try {
                const tx = await signer.sendTransaction(transaction);
                await tx.wait();
                localStorage.removeItem('bounty_token');
            } catch (error) {
                console.log(error);
            }
        }
    }, [duckiesContract, signer, account]);


    const handleClick = React.useCallback(async () => {
        if (!active) {
            setIsOpenConnect(true);
        } else {
            if (signer) {
                const referralToken = localStorage.getItem('referral_token');
                if (referralToken) {
                    handleClaimReward(referralToken);
                } else {
                    const bountyToken = localStorage.getItem('bounty_token');

                    if (bountyToken) {
                        handleClaimBounty(bountyToken);
                    }
                }

            }
        }
    }, [active, signer, handleClaimReward]);

    return (
        <>
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
                                You have received
                            </div>
                            <div className="duckies-hero__info-received-amount">
                                <span>+10,000,000</span>
                                DUCKIES
                            </div>
                        </div>
                        <div className="duckies-hero__info-buttons">
                            <div onClick={handleClick} className="duckies-hero__info-buttons-claim button button--outline button--secondary button--shadow-secondary">
                                <span className="button__inner">Claim your reward</span>
                            </div>
                            <Link href="#earn-more">
                                <a className="duckies-hero__info-buttons-earn button button--secondary button--shadow-secondary">
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
                                        <div className="duckies-hero__icons-balance-body-content-title-icon">
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M11 14H10V10H9M10 6H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    {isReady ? renderMetamaskAccount() : renderMetamaskButton()}
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
                bodyContent={isReady ? <div>Claim logic</div> : renderMetamaskButton()}
                headerContent="Connect Wallet"
                isOpen={isOpenConnect}
                setIsOpen={setIsOpenConnect}
            />
        </>
    );
};
