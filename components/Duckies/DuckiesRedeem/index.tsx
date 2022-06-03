import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export const DuckiesRedeem = () => {
    return (
        <div className="duckies-redeem">
            <div className="container duckies-redeem__block">
                <div className="duckies-redeem__block-info">
                    <div className="duckies-redeem__block-info-header">
                        <div className="duckies-redeem__block-info-header-name">
                            <div className="duckies-redeem__block-info-header-name-content">
                                DUCKIES
                            </div>
                        </div>
                        <div className="duckies-redeem__block-info-header-title">
                            Redeem
                        </div>
                        <div className="duckies-redeem__block-info-header-subtitle">
                            Exchange your duckies for valuable gifts and rare NFTs
                        </div>
                    </div>
                    <div className="duckies-redeem__block-info-content">
                        <div className="duckies-redeem__block-info-content-row">
                            <div className="duckies-redeem__block-info-content-row-item">
                            <div className="duckies-redeem__block-info-content-row-item-line" />
                                Exclusive NFT Duckies collection
                            </div>
                            <div className="duckies-redeem__block-info-content-row-item">
                                <div className="duckies-redeem__block-info-content-row-item-line" />
                                Swap for YELLOW tokens
                            </div>
                        </div>
                        <div className="duckies-redeem__block-info-content-row">
                            <div className="duckies-redeem__block-info-content-row-item">
                            <div className="duckies-redeem__block-info-content-row-item-line" />
                                YELLOW NETWORK & DUCKIES merch
                            </div>
                            <div className="duckies-redeem__block-info-content-row-item">
                            <div className="duckies-redeem__block-info-content-row-item-line" />
                                And more coming soon
                            </div>
                        </div>
                    </div>
                </div>
                <div className="duckies-redeem__block-duckies">
                    <LazyLoadImage className="section__main-img"
                        srcSet={`${'/images/components/duckies/redeem.svg'}`}
                        effect="blur"
                        threshold={200}
                    />
                </div>
            </div>
        </div>
    );
};
