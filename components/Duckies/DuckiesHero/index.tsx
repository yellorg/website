import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export const DuckiesHero = () => {
    return (
        <div className="duckies-hero">
            <div className="duckies-hero__info">
                <div className="duckies-hero__info-selebration">
                    <LazyLoadImage className="section__main-img"
                        srcSet={`${'/images/components/duckies/selebration.svg'}`}
                        effect="blur"
                        threshold={200}
                    />
                </div>
                <div className="duckies-hero__info-received">
                    <div className="duckies-hero__info-received-message">
                        You have received
                    </div>
                    <div className="duckies-hero__info-received-amount">
                        <span>+10,000,000</span>
                        DUCKIES
                    </div>
                </div>
                <div className="duckies-hero__info-buttons">
                    <div className="duckies-hero__info-buttons-claim button button--outline button--secondary button--shadow-secondary">
                        <span className="button__inner">Claim your reward</span>
                    </div>
                    <div className="duckies-hero__info-buttons-earn button button--secondary button--shadow-secondary">
                        <span className="button__inner">Earn more</span>
                    </div>
                </div>
            </div>
            <div className="duckies-hero__icons">
                <div className="duckies-hero__icons-balance button--shadow-secondary">
                    <div className="duckies-hero__icons-balance-body">
                        <div className="duckies-hero__icons-balance-body-content">
                            <div className="duckies-hero__icons-balance-body-content-title">
                                <div className="duckies-hero__icons-balance-body-content-title-name">
                                    Balance
                                </div>
                                <div className="duckies-hero__icons-balance-body-content-title-icon">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11 14H10V10H9M10 6H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="button button--outline button--secondary button--shadow-secondary">
                                <span className="button__inner">Connect Metamask</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="duckies-hero__icons-duck">
                    <div className="duckies-hero__icons-duck-body">
                        <LazyLoadImage className="duckies-hero__icons-duck-body-img"
                            srcSet={`${'/images/components/duckies/duck.svg'}`}
                            effect="blur"
                            threshold={200}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
