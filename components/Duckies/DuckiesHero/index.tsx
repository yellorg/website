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
import Spinner from '../../Spinner';

export const DuckiesHero = () => {
    const [isMetaMaskInstalled, setMetaMaskInstalled] = useState<boolean>(true);
    const [isOpenConnect, setIsOpenConnect] = useState<boolean>(false);
    const [isOpenBalancesInfo, setIsOpenBalancesInfo] = useState<boolean>(false);
    const [isClaimed, setIsClaimed] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
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
        if (!isReady) return
        (async () => {
            // if no referral_token, mark it as unclaim
            const token = localStorage.getItem('referral_token');
            const limit = +await duckiesContract?.getAccountBountyLimit('referral');
            setIsClaimed(!token || limit > 0)
        })()
    }, [isReady])

    useEffect(() => {
        if (isReady) {
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
            setIsLoading(true)
            const { transaction } = await (await fetch(`/api/tx?token=${token}&account=${account}`)).json();

            try {
                const tx = await signer.sendTransaction(transaction);
                await tx.wait();
                localStorage.removeItem('referral_token');
                setIsLoading(false)
                setIsOpenConnect(false)
            } catch (error) {
                console.log(error);
                setIsLoading(false)
            }
        }
    }, [signer, account, setIsLoading, setIsOpenConnect]);

    const handleClick = React.useCallback(async () => {
        setIsOpenConnect(true);
    }, []);

    const MetamaskModal = useMemo(() => {

        const loginState = (
            <>
                <svg className="icon" width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="30" cy="30" r="30" fill="#FFF5C7"/>
                    <path d="M48.7424 10.8027L32.4912 22.8275L35.5133 15.7409L48.7424 10.8027Z" fill="#E17726" stroke="#E17726" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11.2568 10.8027L27.3633 22.9397L24.4861 15.7409L11.2568 10.8027Z" fill="#E27625" stroke="#E27625" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M42.8914 38.6826L38.5674 45.2882L47.8262 47.8375L50.4785 38.827L42.8914 38.6826Z" fill="#E27625" stroke="#E27625" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9.53711 38.827L12.1733 47.8375L21.4161 45.2882L17.1081 38.6826L9.53711 38.827Z" fill="#E27625" stroke="#E27625" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.9176 27.5273L18.3457 31.4073L27.5081 31.8241L27.2027 21.9639L20.9176 27.5273Z" fill="#E27625" stroke="#E27625" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M39.0816 27.5233L32.7002 21.8477L32.4912 31.8202L41.6535 31.4033L39.0816 27.5233Z" fill="#E27625" stroke="#E27625" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21.4155 45.2877L26.9611 42.6103L22.1871 38.8906L21.4155 45.2877Z" fill="#E27625" stroke="#E27625" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M33.0371 42.6103L38.5666 45.2877L37.8111 38.8906L33.0371 42.6103Z" fill="#E27625" stroke="#E27625" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M38.5666 45.2927L33.0371 42.6152L33.4871 46.2066L33.4389 47.7297L38.5666 45.2927Z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21.4155 45.2927L26.5594 47.7297L26.5272 46.2066L26.9611 42.6152L21.4155 45.2927Z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M26.6564 36.5204L22.0591 35.1737L25.3061 33.6826L26.6564 36.5204Z" fill="#233447" stroke="#233447" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M33.3433 36.5204L34.6936 33.6826L37.9566 35.1737L33.3433 36.5204Z" fill="#233447" stroke="#233447" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21.4158 45.2882L22.2196 38.6826L17.1079 38.827L21.4158 45.2882Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M37.7793 38.6826L38.567 45.2882L42.8909 38.827L37.7793 38.6826Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M41.6535 31.4023L32.4912 31.8192L33.3431 36.517L34.6934 33.679L37.9565 35.1701L41.6535 31.4023Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22.0589 35.1701L25.3059 33.679L26.6562 36.517L27.5081 31.8192L18.3457 31.4023L22.0589 35.1701Z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.3457 31.4023L22.1875 38.8898L22.0588 35.1701L18.3457 31.4023Z" fill="#E27525" stroke="#E27525" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M37.9567 35.1701L37.812 38.8898L41.6538 31.4023L37.9567 35.1701Z" fill="#E27525" stroke="#E27525" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M27.5083 31.8223L26.6562 36.52L27.7332 42.0673L27.9744 34.7563L27.5083 31.8223Z" fill="#E27525" stroke="#E27525" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M32.4921 31.8223L32.042 34.7404L32.2671 42.0673L33.344 36.52L32.4921 31.8223Z" fill="#E27525" stroke="#E27525" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M33.3436 36.5187L32.2666 42.066L33.0382 42.6112L37.8123 38.8915L37.957 35.1719L33.3436 36.5187Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22.0591 35.1719L22.1878 38.8915L26.9617 42.6112L27.7333 42.066L26.6564 36.5187L22.0591 35.1719Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M33.4391 47.73L33.4873 46.2069L33.0694 45.8541H26.9291L26.5272 46.2069L26.5594 47.73L21.4155 45.293L23.2158 46.768L26.8647 49.2852H33.1176L36.7825 46.768L38.5668 45.293L33.4391 47.73Z" fill="#C0AC9D" stroke="#C0AC9D" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M33.0379 42.6105L32.2663 42.0654H27.7334L26.9619 42.6105L26.5278 46.2019L26.9297 45.8492H33.0701L33.4881 46.2019L33.0379 42.6105Z" fill="#161616" stroke="#161616" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M49.4328 23.613L50.7992 16.9754L48.7417 10.8027L33.0371 22.4267L39.081 27.5251L47.6164 30.0103L49.4972 27.8138L48.6774 27.2205L49.9794 26.0341L48.9828 25.2645L50.2849 24.2704L49.4328 23.613Z" fill="#763E1A" stroke="#763E1A" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9.19971 16.9754L10.5821 23.613L9.69802 24.2704L11.0161 25.2645L10.0195 26.0341L11.3215 27.2205L10.5017 27.8138L12.3824 30.0103L20.918 27.5251L26.9618 22.4267L11.2572 10.8027L9.19971 16.9754Z" fill="#763E1A" stroke="#763E1A" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M47.6173 30.0095L39.0819 27.5244L41.6538 31.4044L37.812 38.8918L42.8915 38.8277H50.4785L47.6173 30.0095Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.9177 27.5244L12.3823 30.0095L9.53711 38.8277H17.1081L22.1875 38.8918L18.3458 31.4044L20.9177 27.5244Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M32.4918 31.8213L33.0384 22.4259L35.5138 15.7402H24.4868L26.9622 22.4259L27.5087 31.8213L27.7177 34.7714L27.7338 42.0664H32.2668L32.2829 34.7714L32.4918 31.8213Z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.693333" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="content">
                    Connect Metamask wallet in order to be able to get Duckies tokens
                </p>
                {renderMetamaskButton()}
            </>
        )

        const claimState = (
            <>
                <p className="content">
                    In order for the on-chain transaction to be executed please wait a couple of minutes. Time may vary depending on the queue & gas.
                </p>
                <div onClick={() => handleClaimReward()} className="button button--outline button--secondary button--shadow-secondary">
                    <span className="button__inner">
                        {isLoading ? <Spinner style={{margin: ".3em 1.25em"}} /> : <span>Confirm</span>}
                    </span>
                </div>
            </>
        )

        const claimedState = (
            <>
                <p className="content">
                    There is nothing to claim. You have already claimed your current rewards. Invite more people and fulfill more bounties to get more DUCKZ
                </p>
                <div onClick={() => setIsOpenConnect(false)} className="button button--outline button--secondary button--shadow-secondary">
                    <span className="button__inner">OK</span>
                </div>
            </>
        )

        return (
            <div className="metamask-modal">
                {isClaimed ? claimedState : isReady ? claimState : loginState}
            </div>
        )
    }, [isReady, handleClaimReward, setIsOpenConnect, isClaimed, isLoading]);

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
                bodyContent={MetamaskModal}
                headerContent={isReady ? "Claim Reward" : "Connect Wallet"}
                isOpen={isOpenConnect}
                setIsOpen={setIsOpenConnect}
            />
        </>
    );
};
