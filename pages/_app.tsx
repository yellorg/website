import '../styles/globals.css'
import 'infima/dist/css/default/default.min.css'
import '../styles/custom.scss'
import type { AppProps } from 'next/app'
import Link from 'next/link'
import { PrismicProvider } from '@prismicio/react'
import { PrismicPreview } from '@prismicio/next'
import { linkResolver, repositoryName } from '../prismicio'
import { AlertProvider } from '../contexts/Alert'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AlertProvider>
      <PrismicProvider
        linkResolver={linkResolver}
        internalLinkComponent={({ href, children, ...props }) => (
          <Link href={href}>
            <a {...props}>
              {children}
            </a>
          </Link>
        )}
      >
        <PrismicPreview repositoryName={repositoryName}>
          <Component {...pageProps} />
        </PrismicPreview>
      </PrismicProvider>
    </AlertProvider>
  )
}

export default MyApp
