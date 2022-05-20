import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export const DuckiesHero = () => {
    return (
        <div className="duckies-hero container">
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
            </div>
            <div className="duckies-hero__icons">
                Icons
            </div>
        </div>
    );
};
