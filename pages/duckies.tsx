import Head from 'next/head';
import React, { FC } from 'react';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { DuckiesLayout } from '../components/Duckies/DuckiesWrapper';
import { createClient } from '../prismicio';
import '../.d';
import { ReduxProvider } from '../providers/ReduxProvider';
import { Alerts } from '../components/Alerts';
import Script from 'next/script';
import { GTM_ID, pageview } from '../lib/gtm';

const getLibrary = (provider: any): ethers.providers.Web3Provider => {
    const library = new ethers.providers.Web3Provider(provider, 'any');
    library.pollingInterval = 12000;

    return library;
};

export const getServerSideProps = async ({ previewData }: any) => {
    const client = createClient({ previewData });
    const bounties = await client.getSingle('bounties');

    return {
        props: {
            bounties,
        },
    };
};

const Duckies: FC = ({ bounties }: any): JSX.Element => {
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <ReduxProvider>
                <div className="flex flex-col min-h-full">
                    <Navbar />
                    <Alerts />
                    <div className="main-wrapper">
                        <Head>
                            <title>
                                Yellow DeFi - Discover WEB 3.0 Internet of Finance
                            </title>
                            <meta
                                name="description"
                                content="Yellow DeFi is a new generation hybrid technology cryptocurrency exchange combining the best of decentralized and centralized performance."
                            />
                        </Head>
                        <Script
                            id="gtm"
                            strategy="afterInteractive"
                            dangerouslySetInnerHTML={{
                                __html: `
                                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                                    })(window,document,'script','dataLayer', '${GTM_ID}');
                                `,
                            }}
                        />
                        <DuckiesLayout bounties={bounties} />
                    </div>
                    <Footer />
                </div>
            </ReduxProvider>
        </Web3ReactProvider>
    );
};

export default Duckies;
