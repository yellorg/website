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
    const displayUatWarningMessage = (process.env.NEXT_PUBLIC_IS_UAT || '') === 'true' ? true : false;

    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <ReduxProvider>
                <div className="flex flex-col overflow-clip min-h-screen test-caching-duckies">
                    <Navbar />
                    <Alerts />
                    <div className="h-full">
                        {displayUatWarningMessage && (
                            <div id="uat-zone" className="flex text-sm justify-center bg-primary-cta-color-60 border-y-2 border-text-color-100 font-metro-bold">
                                WARNING! UAT ZONE!
                            </div>
                        )}
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
