import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { DuckiesPrizesList } from './defaults';
import Tilt from 'react-parallax-tilt';

export interface DuckiesPrizesProps {
    prizes: DuckiesPrizesList[],
}

export const DuckiesPrizes = ({ prizes }: DuckiesPrizesProps) => {
    return (
        <div className="mx-auto mt-[4.625rem] max-w-md-layout 2xl:max-w-lg-layout-2p">
            <div className="flex items-center w-full flex-col sm:flex-row">
                <div className="flex w-full max-w-full sm:max-w-1/2 flex-col">
                    <div className="flex justify-start flex-col px-3.5">
                        <div className="text-primary-cta-layer-color-60 font-bold text-lg mb-3">
                            <div className="block w-fit bg-primary-cta-color-90 py-1 px-3.5 font-metro-bold">
                                BUILT ON POLYGON
                            </div>
                        </div>
                        <div className="text-text-color-100 font-gilmer-bold text-6xl mb-3">
                            Redeem
                        </div>
                        <div className="text-text-color-100 font-metro-semibold text-xl mb-9 lg:w-1/2">
                            Connect your Metamask wallet, prove you are human, claim your rewards in DUCKIES tokens, redeem them for awesome prizes.
                        </div>
                    </div>
                    <div className="flex items-center flex-col md:flex-row md:overflow-scroll no-scrollbar lg:overflow-visible md:gap-x-5 px-3.5">
                        {prizes.map((prize: DuckiesPrizesList, index) => 
                            <div key={`redeem-duck-${index}`} className="mb-14 md:mb-0">
                                <Tilt
                                    perspective={500}
                                    scale={0.9}
                                    tiltMaxAngleX={15}
                                    tiltMaxAngleY={15}
                                    glareEnable={true} 
                                    glareMaxOpacity={0.3}
                                    glareBorderRadius="10px"
                                    className="group"
                                >
                                    <div className="flex w-[25.5rem] h-[35.813rem] min-w-[20rem] min-h-[30rem] max-w-[30rem] max-h-[40rem] lg:w-full lg:h-[38vw] border-2 border-text-color-100 items-center rounded-lg bg-primary-cta-color-80 shadow-[0_4.625rem_2.125rem_-2.5rem_rgba(166,87,14,0.24)]">
                                        <LazyLoadImage
                                            srcSet={`${prize.imgPath}`}
                                            effect="blur"
                                            threshold={200}
                                        />                  
                                        {(typeof prize.collection) === 'string' 
                                            ? <span className="absolute bottom-0 right-0 m-4 font-metro-semibold">{prize.collection}</span> 
                                            : prize.collection
                                        }
                                        <LazyLoadImage
                                            srcSet={`${'/images/components/duckies/sparkles.gif'}`}
                                            threshold={200}
                                            className="absolute rounded-lg pr-1 mix-blend-color-dodge opacity-50 w-full h-full"
                                        />
                                        <LazyLoadImage
                                            srcSet={`${'/images/components/duckies/holo.webp'}`}
                                            threshold={200}
                                            className="absolute rounded-lg pr-1 mix-blend-color-dodge opacity-20 w-full h-full"
                                        />
                                        <LazyLoadImage
                                            srcSet={`${'/images/components/duckies/coming-soon.gif'}`}
                                            threshold={200}
                                            className="absolute pr-1 bottom-16 w-full"
                                        />
                                        <div className="group-hover:hidden w-full h-full absolute">
                                            <LazyLoadImage
                                                srcSet={`${'/images/components/duckies/coming-soon-static.png'}`}
                                                threshold={200}
                                                className="absolute pr-1 bottom-12 w-full"
                                            />
                                        </div>
                                    </div>
                                </Tilt>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
