import '../styles/globals.css'
import 'infima/dist/css/default/default.min.css'
import '../styles/custom.scss'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
