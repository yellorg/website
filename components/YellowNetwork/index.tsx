import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const blocks = [
    {
        src: '/images/icons/liquidity.svg',
        title: 'Liquidity',
        text: 'Our technology is unlocking the liquidity of different blockchains and exchanges to the network of Nodes.',
    },
    {
        src: '/images/icons/security.svg',
        title: 'Security',
        text: 'We use state channel protocols that give off-chain performance while relying on the security of blockchain technology.',
    },
    {
        src: '/images/icons/speed.svg',
        title: 'Speed',
        text: 'Thanks to strategy embedding technology that enables Ultra HFT, Nodes can sell slots for embedded strategy.',
    },
    {
        src: '/images/icons/compliance.svg',
        title: 'Compliance',
        text: 'While keeping our network decentralized, we provide tools for Nodes to become compliant with their local regulation.',
    },
];

export const YellowNetwork: React.FC = () => {
    return (
        <div className="section section__dark">
            <div className="container xln">
                <div className="row">
                    <div className="col col--6">
                    <LazyLoadImage className="section__main-img"
                        srcSet={`${'/images/components/xln_mobile.png'} 339w,
                                ${'/images/components/xln.png'} 624w,
                                ${'/images/components/xln_2x.png'} 1248w`}
                        sizes="(max-width: 425px) 339px, (max-width: 2000px) 624px, 1248px"
                        effect="blur"
                        threshold={200}
                    />
                    </div>
                    <div className="col col--6">
                        <span className="highlight">Core Technology</span>
                        <h4 className="section-title">Yellow Network</h4>
                        <p className="section-text--smaller subtitle-2-18-600">
                            Broker Nodes (exchanges) connect to the P2P Network using a unified communication protocol. The main target of
                            the Network is to interconnect different blockchains unlocking access to liquidity with the layer of
                            decentralized exchanges.
                        </p>
                        <div className="blocks">
                            {blocks.map(i => {
                                return (
                                    <div key={i.title} className="icon-block">
                                        <img className="icon-block__img" src={i.src} />
                                        <div className="subtitle-1-20-600 icon-block__title">{i.title}</div>
                                        <p className="icon-block__text body-2-14-500">{i.text}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
