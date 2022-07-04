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

const getLibrary = (provider: any): ethers.providers.Web3Provider => {
    const library = new ethers.providers.Web3Provider(provider, 'any');
    library.pollingInterval = 12000;

    return library;
};

export const getServerSideProps = async ({ previewData }: any) => {
    const client = createClient({ previewData });
    const bounties = await client.getSingle('bounties');
    const faqList = await client.getSingle('faq');

    return {
        props: {
            bounties,
            faqList,
        },
    };
};

const Duckies: FC = ({ bounties, faqList }: any): JSX.Element => {
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
                            <meta 
                                property="og:type"
                                content="website"
                            />
                            <meta
                                property="og:title"
                                content="DUCKIES—The Fun and Friendly Web3 Currency"
                            />
                            <meta
                                property="og:description"
                                content="The DUCKIES token is a decentralized meme coin and the Yellow community currency for true growth hackers. Join the duckies squad! Quack-quack!"
                            />
                            <meta
                                property="og:image"
                                content="/images/og-image.png"    
                            />
                            <meta
                                name="twitter:card"
                                content="summary_large_image"
                            />
                            <meta
                                name="twitter:title"
                                content="DUCKIES—The Fun and Friendly Web3 Currency"
                            />
                            <meta
                                name="twitter:description"
                                content="The DUCKIES token is a decentralized meme coin and the Yellow community currency for true growth hackers. Join the duckies squad! Quack-quack!"
                            />
                            <meta
                                name="twitter:image"
                                content="https://www.yellow.org/images/og-image.png"    
                            />
                        </Head>
                        <DuckiesLayout bounties={bounties} faqList={faqList} />
                    </div>
                    <Footer />
                </div>
            </ReduxProvider>
        </Web3ReactProvider>
    );
};

export default Duckies;
