import React from 'react';
import Head from 'next/head';

const DuckiesHead: React.FC = () => {
    return (
        <Head>
            <title>Yellow DeFi - Discover WEB 3.0 Internet of Finance</title>
            <meta
                name="description"
                content="Yellow DeFi is a new generation hybrid technology cryptocurrency exchange combining the best of decentralized and centralized performance."
            />
            <meta property="og:type" content="website" />
            <meta
                property="og:title"
                content="DUCKIES—The Fun and Friendly Web3 Currency"
            />
            <meta
                property="og:description"
                content="The DUCKIES token is a decentralized meme coin and the Yellow community currency for true growth hackers. Join the duckies squad! Quack-quack!"
            />
            <meta property="og:image" content="/images/og-image.png" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta
                name="twitter:title"
                content="DUCKIES—The Fun and Friendly Web3 Currency"
            />
            <meta
                name="twitter:description"
                content="The DUCKIES token is a decentralized meme coin and the Yellow community currency for true growth hackers. Join the duckies squad! Quack-quack!"
            />
            <meta property="twitter:image" content="/images/og-image.png" />
        </Head>
    );
};

export default DuckiesHead;
