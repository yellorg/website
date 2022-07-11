import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { UnsupportedChainIdError } from '@web3-react/core'
import MetaMaskOnboarding from '@metamask/onboarding'
import useDApp from './useDApp'
import type { ProviderWhitelist } from './useDApp'
import { useEagerConnect } from './useEagerConnect'
import useWallet from './useWallet'
import chains from '../config/chains'
import { appConfig } from '../config/app'
import { isBrowser } from '../helpers'
import * as ga from '../lib/ga'

export default function useMetaMask() {
    const { connectWithProvider, disconnect } = useDApp()
    const { chain } = useWallet()
    const triedToEagerConnect = useEagerConnect()
    const [isMetaMaskInstalled, setMetaMaskInstalled] = useState<boolean>(true)
    const [isSwitchedMainChain, setSwitchedMainChain] = useState<boolean>(false)
    const [currentMetamaskChain, setCurrentMetamaskChain] = useState<number>(-1)

    const onboarding = useRef<MetaMaskOnboarding>()

    const mainChain = useMemo(() => {
        return chains.find(chain => chain.chainId === appConfig.blockchain.mainChainId)
    }, [])

    const mainChainIdHex = useMemo(() => {
        return `0x${(mainChain?.chainId!).toString(16)}`
    }, [mainChain])

    const supportedChain = useMemo(() => {
        return appConfig.blockchain.supportedChainIds.includes(chain?.chainId ?? currentMetamaskChain)
    }, [chain, currentMetamaskChain])

    const switchToMainChain = useCallback(async () => {
        try {
            await window?.ethereum?.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: mainChainIdHex }],
            })
            setSwitchedMainChain(true)
            return true
        } catch (switchError: any) {
            setSwitchedMainChain(false)
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                return false
            }
            throw switchError
        }
    }, [mainChainIdHex, setSwitchedMainChain])

    const addOrSwitchToMainChain = useCallback(async () => {
        try {
            const succeed = await switchToMainChain()
            if (succeed) {
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
                    })
                    await switchToMainChain()
                    return true
                } catch (addError: any) {
                    console.error(addError)
                    return false
                }
            }
        } catch (error: any) {
            console.error(error)
            return false
        }
    }, [mainChain, mainChainIdHex, switchToMainChain]);

    const handleConnectWallet = useCallback(async (provider: ProviderWhitelist) => {
        if (!triedToEagerConnect) return

        const isMetamaskUnlocked = await (window as any)?.ethereum._metamask?.isUnlocked()

        if (!isMetamaskUnlocked) {
            console.warn('alerts.message.wallet.metamask.locked')
        }

        const switched = await addOrSwitchToMainChain()
        if (!switched) return

        connectWithProvider(provider).then(() => {
            console.log('removeConnectWalletAlert')
        }).catch(async (error) => {
            if (
                error instanceof UnsupportedChainIdError &&
                !error
                    .toString()
                    .includes('Supported chain ids are: undefined')
            ) {
                console.log('success')
            } else {
                console.error('handleConnectWallet: sign error')
            }
        })
    }, [connectWithProvider, triedToEagerConnect, addOrSwitchToMainChain])

    const handleMetamask = useCallback(async (isMetaMaskInstalled: boolean, id: ProviderWhitelist) => {
        if (isMetaMaskInstalled) {
            await handleConnectWallet(id)
            ga.event({
                action: "duckies_connect_metamask_click",
                params: {
                    source: 'hero',
                },
            })
        } else {
            onboarding.current?.startOnboarding()
            ga.event({
                action: "duckies_hero_metamask_install_click",
            })
        }
    }, [handleConnectWallet, onboarding])

    const handleDisconnect = useCallback(() => {
        disconnect();
    }, [disconnect]);

    useEffect(() => {
        onboarding.current = new MetaMaskOnboarding()
        setMetaMaskInstalled(MetaMaskOnboarding.isMetaMaskInstalled())
    }, [])

    useEffect(() => {
        const handleChainChange = (chainId: string) => {
            setCurrentMetamaskChain(+chainId)
            setSwitchedMainChain(+chainId === mainChain?.chainId)
        }

        if (isBrowser()) {
            isBrowser() && window?.ethereum?.on('chainChanged', handleChainChange);

            return () => {
                isBrowser() && window?.ethereum?.removeListener('chainChanged', handleChainChange)
            }
        }

    }, [mainChain, setCurrentMetamaskChain, setSwitchedMainChain, isBrowser])

    return {
        mainChain,
        mainChainIdHex,
        supportedChain,
        switchToMainChain,
        addOrSwitchToMainChain,
        isSwitchedMainChain,
        currentMetamaskChain,
        handleConnectWallet,
        handleMetamask,
        handleDisconnect,
        isMetaMaskInstalled,
    }
}
