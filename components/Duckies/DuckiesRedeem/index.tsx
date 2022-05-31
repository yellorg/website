import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Slider, { LazyLoadTypes } from 'react-slick';
import Image from 'next/image';

const CustomDot = () => {
    return <span className="slider-dot" />;
};

const CustomArrow = (props: any) => {
    const { className, onClick } = props;
    return (
        <div className={className} style={{display:"flex", justifyContent:"center", alignItems:"center"}} onClick={onClick}>
            <Image
                src="/images/icons/chevron.svg"
                alt="Yellow ttetst Chain"
                width={10}
                height={14}
                layout='fixed'
            />
        </div>
    );
};

const SLIDER_SETTINGS = {
    customPaging: CustomDot,
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    lazyLoad: "progressive" as LazyLoadTypes,
    nextArrow: <CustomArrow style={{display:"flex", justifyContent:"center", alignItems:"center"}} />,
    prevArrow: <CustomArrow />,
    responsive: [
        {
            breakpoint: 1240,
            settings: {
                slidesToShow: 3,
                arrows: false,
            },
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 2,
                arrows: false,
            },
        },
        {
            breakpoint: 575,
            settings: {
                slidesToShow: 1,
                arrows: false,
            },
        },
    ],
};

const NFT_LIST = [
    '/images/components/duckies/ducky-pixel.png',
    '/images/components/duckies/ducky-pixel.png',
    '/images/components/duckies/ducky-pixel.png',
    '/images/components/duckies/ducky-pixel.png',
    '/images/components/duckies/ducky-pixel.png',
    '/images/components/duckies/ducky-pixel.png',
    '/images/components/duckies/ducky-pixel.png',
    '/images/components/duckies/ducky-pixel.png',
];

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
            <div className="container">
                <div className="duckies-redeem__slider">
                    <Slider {...SLIDER_SETTINGS}>
                        {NFT_LIST.map((imgSrc, i) => (
                            <div key={i} className="slider-item">
                                <LazyLoadImage
                                    src={imgSrc}
                                    effect="blur"
                                    threshold={200}
                                    className="slider-item__logo"
                                />
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </div>
    );
};
