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
import DuckiesHead from '../components/Duckies/DuckiesHead';

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
                <div className="flex flex-col overflow-clip min-h-screen test-caching-duckies">
                    <Navbar />
                    <Alerts />
                    <div className="h-full">
                        <DuckiesHead />
                        <DuckiesLayout bounties={bounties} faqList={faqList} />
                    </div>
                    <Footer />
                </div>
            </ReduxProvider>
        </Web3ReactProvider>
    );
};

export default Duckies;
