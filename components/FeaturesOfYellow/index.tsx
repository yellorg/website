import React from 'react';
import Image from 'next/image';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const blocks = [
    {
        src: '/images/icons/features-2.png',
        title: 'Aggregated Order Books',
        text: 'We understand how important it is to have stable access to different Market pairs, despite the blockchain technologies that are used for their maintenance. Yellow Network connects multiple exchanges to share orders. Liquidity providers receive profits from trading fees.',
        link: '/docs/network/broker-node',
        linkText: 'Explore State channels',
    },
    {
        src: '/images/icons/features-1.png',
        title: 'Non-Custodial',
        text: 'Instead of transferring your assets to the exchange, like old-school CEX, you enable a MetaMask connection. Your funds are secured using a multi-signature smart contract on the blockchain. You can fully audit the assets held by the network anytime.',
        link: '/docs/network/smart-contracts',
        linkText: 'Explore Smart Contracts',
    },
    {
        src: '/images/icons/features-3.png',
        title: 'Information security',
        text: 'It is vital to secure personal data in the era of hacks and leaks. We don’t share any transaction details or sensitive information about the Platform user except what is mandatory, KYC level, in this case. This way your personal information is safe and transactional privacy is respected.',
        link: '/docs/network/smart-contracts',
        linkText: 'Explore State channels',
    },
    {
        src: '/images/icons/features-4.png',
        title: 'Ultra-High-Speed Trading',
        text: 'Built on top of the Yellow Network, brokers have deep liquidity and tight spread while enabling traditional market making and high-frequency trading.',
        link: '/docs/overview/what-is-yellow-network',
        linkText: 'Explore Yellow Network',
    },
];

export const FeaturesOfYellow: React.FC = () => {
    return (
        <div className="section">
            <div className="container features">
                <div className="row section__center">
                    <div className="section-title">
                        <Image
                            src="/images/logo-black.svg"
                            alt="overview"
                            className="themedImage themedImage--light"
                            width={208}
                            height={65}
                            layout='responsive'
                        />
                        <h4>Yellow Clearing Network Features</h4>
                    </div>
                    <div className="blocks">
                        {blocks.map(i => {
                            return (
                                <div key={i.src} className="icon-block">
                                    <LazyLoadImage className="icon-block__img" src={i.src} effect="blur" threshold={200} />
                                    <div className="h8 icon-block__title">{i.title}</div>
                                    <p className="body-2-16-400 icon-block__text">{i.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
