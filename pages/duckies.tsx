import Head from 'next/head';
import React, { FC } from 'react';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { DuckiesHero} from '../components/Duckies/DuckiesHero';
import { DuckiesAffiliates} from '../components/Duckies/DuckiesAffiliates';
import { DuckiesEarnMore} from '../components/Duckies/DuckiesEarnMore';
import { DuckiesRedeem} from '../components/Duckies/DuckiesRedeem';


const Home: FC<{}> = (): JSX.Element => {
    return (
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
                <main className="duckies container">
                    <DuckiesHero />
                    <DuckiesAffiliates />
                    <DuckiesEarnMore />
                    <DuckiesRedeem />
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
