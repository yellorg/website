import type { InjectedConnector } from '@web3-react/injected-connector'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useDApp, {
  connectorsByProvider,
  providerCache,
  ProviderWhitelist,
} from './useDApp'

export function useEagerConnect() {
  const [tried, setTried] = useState(false)
  const [providerId, setProviderId] = useState<ProviderWhitelist>()
  const {
    context: { activate, active, library },
  } = useDApp()

  const injected = useMemo(() => {
    return connectorsByProvider['Injected'].connector as InjectedConnector
  }, [])

  useEffect(() => {
    const providerId = providerCache.get()
    setProviderId(providerId ? providerId : undefined)
  }, [library])

  const connector = useMemo(() => {
    if (!providerId) return
    return connectorsByProvider[providerId]?.connector
  }, [providerId])

  useEffect(() => {
    if (!connector) {
      setTried(true)
      return
    }
    ;(async () => {
      const isAuthorized = await ('isAuthorized' in connector
        ? injected.isAuthorized()
        : true)
      if (isAuthorized) {
        activate(connector, undefined, true).finally(() => {
          setTried(true)
        })
      } else {
        setTried(true)
      }
    })()
  }, [activate, connector])

  const handleAccountsChange = useCallback(([address]: string[]) => {
    if (!address) {
      providerCache.clear()
    }
  }, [])

  useEffect(() => {
    if (providerId !== 'Injected') return
    const provider = library?.provider as any
    provider?.on('accountsChanged', handleAccountsChange)
    return () => {
      provider?.removeListener('accountsChanged', handleAccountsChange)
    }
  }, [library, providerId, handleAccountsChange])

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true)
    }
  }, [tried, active])

  return tried
}
