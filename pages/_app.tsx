import '../styles/globals.css';
import 'infima/dist/css/default/default.min.css';
import '../styles/custom.scss';
import type { AppProps } from 'next/app';
import Link from 'next/link';
import { PrismicProvider } from '@prismicio/react';
import { PrismicPreview } from '@prismicio/next';
import { linkResolver, repositoryName } from '../prismicio';
import React from 'react';
import { useRouter } from 'next/router';
import { analytics } from '../lib/analitics';

function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();

    React.useEffect(() => {
        const handleRouteChange = (url: string) => {
            analytics({
                type: 'pageView',
                name: url,
            });
        }
        //When the component is mounted, subscribe to router changes
        //and log those page views
        router.events.on('routeChangeComplete', handleRouteChange);

        // If the component is unmounted, unsubscribe
        // from the event with the `off` method
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router.events]);

    return (
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
    );
}

export default MyApp
