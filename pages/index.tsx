import Head from 'next/head';
import React, { FC } from 'react';
import { Announcement } from '../components/Announcement';
import { Community } from '../components/Community';
import { FeaturesOfYellow } from '../components/FeaturesOfYellow';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { Navbar } from '../components/Navbar';
import { Partners } from '../components/Partners';
import { Roadmap } from '../components/Roadmap';
import { Team } from '../components/Team';
import { Tokenomics } from '../components/Tokenomics';
import { WhatsYellow } from '../components/WhatsYellow';
import { YellowNetwork } from '../components/YellowNetwork';
// import { appTitle } from '../libs/page';

const Home: FC<{}> = (): JSX.Element => {
    const [showAnnouncement, setShowAnnouncement] = React.useState<boolean>(true);

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
                <div className="homepage">
                    <Hero />
                    <main>
                        <YellowNetwork />
                        <HowItWorks />
                        <WhatsYellow />
                        <FeaturesOfYellow />
                        <Tokenomics />
                        <Roadmap />
                        <Team />
                        <Partners />
                        <Community />
                    </main>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
