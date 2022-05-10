import React from 'react';
import Image from 'next/image';

const blocks = [
    {
        src: '/images/icons/overview-1.svg',
        text: 'Multi-asset spot trading exchange built with OpenDAX stack, connected to Yellow Network.',
    },
    {
        src: '/images/icons/overview-2.svg',
        text: 'A Layer-3 non-custodial clearing network offering unparalleled security and transparency for the traders.',
    },
    {
        src: '/images/icons/overview-3.svg',
        text: 'Access to Ultra-High-Speed Trading thanks to the advantages of having nodes on each exchange, blockchain, and market.',
    },
    {
        src: '/images/icons/overview-4.svg',
        text: 'Wrapped tokens managed with state channel smart contracts to provide access to diverse assets.',
    },
    {
        src: '/images/icons/overview-5.svg',
        text: 'Compliance with international regulations using 3rd party KYC providers and custodians without sharing sensitive data.',
    },
    {
        src: '/images/icons/overview-6.svg',
        text: 'Explore, create and host various markets to trade on Yellow.com',
    },
];

export const WhatsYellow: React.FC = () => {
    return (
        <div className="section section__dark" id="about">
            <div className="container overview">
                <div className="row section__center">
                    <div className="section-title">
                        <h4>What is</h4>
                        <div className='overview__logo'>
                            <Image
                                src="/images/logo-white.svg"
                                alt="Yellow"
                                width={208}
                                height={65}
                                layout='responsive'
                            />
                        </div>
                        <h4>?</h4>
                    </div>
                    <div className="blocks">
                        {blocks.map(i => {
                            return (
                                <div key={i.src} className="icon-block">
                                    <div className="icon-block__img">
                                        <Image
                                            src={i.src}
                                            alt="Yellow ttetst Chain"
                                            width={41}
                                            height={42}
                                            layout='responsive'
                                        />
                                    </div>
                                    <p className="subtitle-2-18-600 icon-block__text">{i.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
