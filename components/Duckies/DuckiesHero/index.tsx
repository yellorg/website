import { UnsupportedChainIdError } from '@web3-react/core'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

export const DuckiesHero = () => {
    const [isMetaMaskInstalled, setMetaMaskInstalled] = useState<boolean>(true);
    const [isOpenConnect, setIsOpenConnect] = useState<boolean>(false);
    const [isOpenBalancesInfo, setIsOpenBalancesInfo] = useState<boolean>(false);
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
    }, [isReady, getBalance]);

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
    }, [disconnect]);

    const renderMetamaskAccount = () => {
        return (
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
        );
    }

    const renderMetamaskButton = () => (
        <div onClick={() => handleMetamask(isMetaMaskInstalled, 'Injected')} className="button button--outline button--secondary button--shadow-secondary">
            <span className="button__inner">{isMetaMaskInstalled ? 'Connect Metamask' : 'Install Metamask'}</span>
        </div>
    );

    const handleClaimReward = React.useCallback(async () => {
        const token = localStorage.getItem('referral_token');

        if (token && signer && account) {
            const { transaction } = await (await fetch(`/api/tx?token=${token}&account=${account}`)).json();

            try {
                const tx = await signer.sendTransaction(transaction);
                await tx.wait();
                localStorage.removeItem('referral_token');
            } catch (error) {
                console.log(error);
            }
        }
    }, [signer, account]);

    const handleClick = React.useCallback(async () => {
        if (!active) {
            setIsOpenConnect(true);
        } else {
            if (signer) {
                handleClaimReward();
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
                                <div className="duckies-hero__info-received-amount-value">
                                    +10,000
                                </div>
                                <div className="duckies-hero__info-received-amount-image">
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
                                        <div onMouseEnter={() => setIsOpenBalancesInfo(true)} onMouseLeave={() => setIsOpenBalancesInfo(false)} className="duckies-hero__icons-balance-body-content-title-icon">
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M11 14H10V10H9M10 6H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            {/* TODO: create tooltip component */}
                                            {isOpenBalancesInfo &&
                                                <div className="duckies-hero__tooltip">
                                                    <h5 className="duckies-hero__tooltip-header">Connected wallet info</h5>
                                                    <div className="duckies-hero__tooltip-box">
                                                        <span className="duckies-hero__tooltip-box-title">Current address: </span>
                                                        <span className="duckies-hero__tooltip-box-text">{ENSName || account}</span>
                                                    </div>
                                                    {
                                                        chain && <div>
                                                            <span className="duckies-hero__tooltip-box-title">Current network: </span>
                                                            <span className="duckies-hero__tooltip-box-text">{chain.network}</span>
                                                        </div>
                                                    }
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
                                                </div>
                                            }
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
