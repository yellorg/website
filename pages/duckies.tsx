import Head from 'next/head';
import React, { FC } from 'react';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { DuckiesLayout } from '../components/Duckies/DuckiesWrapper';
import { createClient } from '../prismicio';
import '../.d';

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
            <div className="flex flex-col min-h-full">
                <Navbar />
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
                    <DuckiesLayout bounties={bounties} />
                </div>
                <Footer />
            </div>
        </Web3ReactProvider>
    );
};

export default Duckies;
