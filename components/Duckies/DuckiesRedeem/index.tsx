import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export const DuckiesRedeem = () => {
    return (
        <div className="mx-auto mt-[4.625rem] px-3.5 max-w-md-layout 2xl:max-w-lg-layout">
            <div className="flex items-center w-full flex-col sm:flex-row">
                <div className="flex w-full max-w-full sm:max-w-1/2 flex-col">
                    <div className="flex justify-start flex-col">
                        <div className="text-primary-cta-layer-color-60 font-bold text-lg mb-3">
                            <div className="block w-fit bg-primary-cta-color-90 py-1 px-3.5 font-metro-bold">
                                DUCKIES
                            </div>
                        </div>
                        <div className="text-text-color-100 font-gilmer-bold text-6xl mb-3">
                            Redeem Prizes
                        </div>
                        <div className="text-text-color-100 font-metro-semibold text-xl mb-9">
                            Exchange your duckies for valuable gifts and rare NFTs
                        </div>
                    </div>
                    <div className="flex mb-10 sm:hidden">
                        <LazyLoadImage
                            srcSet={`${'/images/components/duckies/redeem.png'}`}
                            effect="blur"
                            threshold={200}
                        />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex w-full flex-col sm:flex-row">
                            <div className="flex w-full max-w-full sm:max-w-1/2 mb-9 pr-[3.625rem] flex-col font-gilmer-medium text-2xl">
                                <div className="w-12 h-1 bg-primary-cta-color-90 mb-2" />
                                Exclusive NFT Duckies collection
                            </div>
                            <div className="flex w-full max-w-full sm:max-w-1/2 mb-9 pr-[3.625rem] flex-col font-gilmer-medium text-2xl">
                                <div className="w-12 h-1 bg-primary-cta-color-90 mb-2" />
                                Swap for YELLOW tokens
                            </div>
                        </div>
                        <div className="flex w-full flex-col sm:flex-row">
                            <div className="flex w-full max-w-full sm:max-w-1/2 mb-9 pr-[3.625rem] flex-col font-gilmer-medium text-2xl">
                                <div className="w-12 h-1 bg-primary-cta-color-90 mb-2" />
                                YELLOW NETWORK &#38; DUCKIES merch
                            </div>
                            <div className="flex w-full max-w-full sm:max-w-1/2 mb-9 pr-[3.625rem] flex-col font-gilmer-medium text-2xl">
                                <div className="w-12 h-1 bg-primary-cta-color-90 mb-2" />
                                And more coming soon
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hidden sm:flex w-full max-w-full sm:max-w-1/2">
                    <LazyLoadImage
                        srcSet={`${'/images/components/duckies/redeem.png'}`}
                        effect="blur"
                        threshold={200}
                    />
                </div>
            </div>
        </div>
    );
};
