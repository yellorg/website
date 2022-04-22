import { isBrowser } from '../helpers'
import { useEffect, useState } from 'react'

export const useSetMobileDevice = (mobileThreshold: number = 768) => {
    const [isMobile, setIsMobile] = useState(true)

    useEffect(() => {
        if (isBrowser()) {
            const query = window.matchMedia(`(max-width: ${mobileThreshold}px)`)
            const handleResize = () => {
                if (query.matches) {
                    setIsMobile(true)
                } else {
                    setIsMobile(false)
                }
            }
            window.addEventListener('resize', handleResize)
            handleResize()
            return () => window.removeEventListener('resize', handleResize)
        }
    }, [isBrowser])

    return isMobile
}
