import type { AbstractConnector } from '@web3-react/abstract-connector'
import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import type { ethers } from 'ethers'
import { useCallback, useMemo } from 'react'
import { appConfig } from '../config/app'
import chains from '../config/chains'
import { IRPCMap } from '@walletconnect/types';
import { supabaseLogout } from '../lib/SupabaseConnector'

const { supportedChainIds } = appConfig.blockchain

export type ProviderWhitelist = 'Injected' | 'WalletConnect'

export const providerCache = {
  key: 'APP_CONNECT_CACHED_PROVIDER',
  set(name: ProviderWhitelist) {
    localStorage.setItem(this.key, name)
  },
  get(): ProviderWhitelist | null {
    return localStorage.getItem(this.key) as ProviderWhitelist
  },
  clear() {
    localStorage.removeItem(this.key)
  },
}

const rpc: IRPCMap = {
  80001: process.env.NEXT_PUBLIC_POLYGON_URL as string,
}

export const connectorsByProvider: {
  [id in ProviderWhitelist]: {
    connector: AbstractConnector
    preConnect?: () => void
    postDisconnect?: () => void
  }
} = {
  Injected: {
    connector: new InjectedConnector({
      supportedChainIds,
    }),
  },
  WalletConnect: {
    connector: new WalletConnectConnector({
      supportedChainIds,
      rpc,
      bridge: 'https://bridge.walletconnect.org',
      qrcode: true,
    }),
    preConnect() {},
    postDisconnect() {
      const connector = this.connector as WalletConnectConnector
      connector.walletConnectProvider?.disconnect()
    },
  },
}

export const getConnectorInfo = (
  connector?: AbstractConnector,
): { id: ProviderWhitelist; name: string } | undefined => {
  switch (connector?.constructor) {
    case InjectedConnector:
      return {
        id: 'Injected',
        name: (window as any).ethereum?.isMetaMask ? 'MetaMask' : 'Injected',
      }
    case WalletConnectConnector:
      return {
        id: 'WalletConnect',
        name: 'WalletConnect',
      }
    default:
      return
  }
}

export default function useDApp() {
  const context = useWeb3React<ethers.providers.Web3Provider>()
  const { account, activate, connector, error, chainId, library, deactivate } =
    context

  const signer = useMemo(() => {
    return library?.getSigner()
  }, [library])

  const chain = useMemo(() => {
    return chainId
      ? chains.find((chain) => chain.chainId === chainId)
      : undefined
  }, [chainId])

  const connectorInfo = useMemo(() => {
    return getConnectorInfo(connector)
  }, [connector])

  const connectWithProvider = useCallback(
    (providerId: ProviderWhitelist): Promise<void> => {
      if (account) {
        return Promise.resolve().then(() => {
          providerCache.set(providerId)
        })
      } else {
        console.log(`[${providerId}] Account connecting`)
        const connector = connectorsByProvider[providerId]
        if (connector.preConnect) {
          connector.preConnect()
        }
        return activate(connector.connector, undefined, true).then(() => {
          providerCache.set(providerId)
        })
      }
    },
    [account],
  )

  const disconnect = useCallback(() => {
    providerCache.clear()
    deactivate()
    supabaseLogout();

    if (connectorInfo) {
      const connector = connectorsByProvider[connectorInfo?.id]
      if (connector.postDisconnect) {
        connector.postDisconnect()
      }
    }
  }, [connector, connectorInfo])

  return {
    context,
    chain,
    signer,
    connectorInfo,
    connectWithProvider,
    disconnect,
    error,
  }
}
