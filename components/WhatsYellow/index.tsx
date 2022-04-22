import React from 'react';

const blocks = [
    {
        src: '/images/icons/overview-1.svg',
        text: 'Multi-asset spot trading exchange built with OpenDAX stack, connected to the Yellow Network.',
    },
    {
        src: '/images/icons/overview-2.svg',
        text: 'A Layer-3 non-custodial exchange offering unparalleled security and transparency for the traders.',
    },
    {
        src: '/images/icons/overview-3.svg',
        text: 'Access to Ultra-High-Speed Trading due to the advantages of having Nodes on each market.',
    },
    {
        src: '/images/icons/overview-4.svg',
        text: 'Wrapped tokens managed with state channel smart contracts to provide access to diverse assets.',
    },
    {
        src: '/images/icons/overview-5.svg',
        text: 'Compliance with international regulations using 3rd party KYC Providers and Custodians without sharing sensitive data.',
    },
    {
        src: '/images/icons/overview-6.svg',
        text: 'Explore, create and host various markets to trade on Yellow.',
    },
];

export const WhatsYellow: React.FC = () => {
    return (
        <div className="section section__dark" id="about">
            <div className="container overview">
                <div className="row section__center">
                    <div className="section-title">
                        <h4>What is</h4>
                        <img className="overview__logo" src={'/images/logo-white.svg'} />
                        <h4>?</h4>
                    </div>
                    <div className="blocks">
                        {blocks.map(i => {
                            return (
                                <div key={i.src} className="icon-block">
                                    <img className="icon-block__img" src={i.src} />
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
