import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Slider, { LazyLoadTypes } from "react-slick";
import Link from "next/link";
import { PARTNERS } from "./constants";

const CustomDot = () => {
    return <span className="slider-dot" />;
};

const CustomArrow = (props: any) => {
    const { className, style, onClick } = props;
    return (
        <div className={className} style={{ ...style }} onClick={onClick}>
            <img src={"/images/icons/chevron.svg"} />
        </div>
    );
};

const SLIDER_SETTINGS = {
    customPaging: CustomDot,
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    lazyLoad: "progressive" as LazyLoadTypes,
    nextArrow: <CustomArrow />,
    prevArrow: <CustomArrow />,
    responsive: [
        {
            breakpoint: 1440,
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

export const Partners = () => {
    return (
        <div className="section partners">
            <div className="container">
                <h4 className="section-title">
                    Strategic Partners & Integrations
                </h4>
                <p className="h8 section-text">
                    We are joined by respectful teams to support initiatives of
                    the new financial layer. The goal is to define a new
                    communication standard for emerging financial services.
                    Applying new standards in financial products makes the
                    system more inclusive and diversified.
                </p>
                <Slider {...SLIDER_SETTINGS}>
                    {PARTNERS.map(({ name, description, imgSrc, link }, i) => (
                        <div key={i} className="slider-item">
                            <LazyLoadImage
                                src={imgSrc}
                                effect="blur"
                                threshold={200}
                                className="slider-item__logo"
                            />

                            <p className="subtitle-2-18-700">{name}</p>
                            <p className="body-2-14-500">{description}</p>

                            <div className="slider-item__link">
                                <Link href={link}>
                                    <a>
                                        Learn More{" "}
                                        <span className="slider-item__right-chevron">
                                            &#8250;
                                        </span>
                                    </a>
                                </Link>
                            </div>
                        </div>
                    ))}
                </Slider>

                <Link href="https://www.openware.com/company/become-a-partner">
                    <a className="button button--outline button--secondary button--shadow-secondary">
                        <span className="button__inner">Join Us</span>
                    </a>
                </Link>
            </div>
        </div>
    );
}
