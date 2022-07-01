import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export const DuckiesRedeem = () => {
    return (
        <div className="mx-auto mt-[74px] px-[14px] max-w-md-layout 2xl:max-w-lg-layout">
            <div className="flex items-center pb-[74px] w-full flex-col sm:flex-row">
                <div className="flex w-full max-w-full sm:max-w-1/2 flex-col">
                    <div className="flex justify-start flex-col">
                        <div className="text-primary-cta-layer-color-60 font-bold text-[18px] leading-[26px] mb-[12px]">
                            <div className="block w-fit bg-primary-cta-color-90 py-[4px] px-[14px] font-metro-bold">
                                DUCKIES
                            </div>
                        </div>
                        <div className="text-text-color-100 font-gilmer-bold text-[60px] leading-[64px] mb-[12px]">
                            Redeem Prizes
                        </div>
                        <div className="text-text-color-100 font-metro-semibold text-[20px] leading-[28px] mb-[36px]">
                            Exchange your duckies for valuable gifts and rare NFTs
                        </div>
                    </div>
                    <div className="flex mb-[40px] sm:hidden">
                        <LazyLoadImage
                            srcSet={`${'/images/components/duckies/redeem.png'}`}
                            effect="blur"
                            threshold={200}
                        />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex w-full flex-col sm:flex-row">
                            <div className="flex w-full max-w-full sm:max-w-1/2 mb-[36px] pr-[58px] flex-col font-gilmer-medium text-[24px] leading-[32px]">
                                <div className="w-[48px] h-[4px] bg-primary-cta-color-90 mb-[8px]" />
                                Exclusive NFT Duckies collection
                            </div>
                            <div className="flex w-full max-w-full sm:max-w-1/2 mb-[36px] pr-[58px] flex-col font-gilmer-medium text-[24px] leading-[32px]">
                                <div className="w-[48px] h-[4px] bg-primary-cta-color-90 mb-[8px]" />
                                Swap for YELLOW tokens
                            </div>
                        </div>
                        <div className="flex w-full flex-col sm:flex-row">
                            <div className="flex w-full max-w-full sm:max-w-1/2 mb-[36px] pr-[58px] flex-col font-gilmer-medium text-[24px] leading-[32px]">
                                <div className="w-[48px] h-[4px] bg-primary-cta-color-90 mb-[8px]" />
                                YELLOW NETWORK &#38; DUCKIES merch
                            </div>
                            <div className="flex w-full max-w-full sm:max-w-1/2 mb-[36px] pr-[58px] flex-col font-gilmer-medium text-[24px] leading-[32px]">
                                <div className="w-[48px] h-[4px] bg-primary-cta-color-90 mb-[8px]" />
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
