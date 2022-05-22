import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Slider, { LazyLoadTypes } from 'react-slick';
import Image from 'next/image';

const CustomDot = () => {
    return <span className="slider-dot" />;
};

const CustomArrow = (props: any) => {
    const { className, style, onClick } = props;
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
            <div className="container">
                <div className="duckies-redeem__header">
                    <div className="duckies-redeem__header-title">
                        Redeem
                    </div>
                    <div className="duckies-redeem__header-subtitle">
                        Exchange your duckies for valuable gifts and rare NFTs
                    </div>
                </div>
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
