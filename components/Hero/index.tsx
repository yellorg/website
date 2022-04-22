import Link from 'next/link'
import Image from 'next/image'
import React from 'react';

export const Hero: React.FC = () => {
    return (
        <header className="hero hero--primary hero__banner">
            <div className="container">
                <div className="row">
                    <div className="col col--7">
                        <div className="hero-left">
                            <h4 className="hero__text">Franchising trading businesses</h4>
                            <p className="h8 hero__text hero__description">
                                Yellow is revolutionazing crypto exchanges. We are building the next-gen global network of Web3 financial exchanges, using state-channel technology.
                            </p>
                            <div className="hero__buttons">
                                <Link href="#tokenomics">
                                    <a className="button button--secondary margin-right--md">
                                        <span className="button__inner">Tokenomics</span>
                                    </a>
                                </Link>
                                <Link href="https://yellow.org/docs/overview/what-is-yellow">
                                    <a className="button button--secondary margin-right--md">
                                        <span className="button__inner">Technology</span>
                                    </a>
                                </Link>
                                <Link href="#">
                                    <a className="button button--secondary margin-right--md">
                                        <span className="button__inner">Investors</span>
                                    </a>
                                </Link>
                                {/* <Link href="https://twitter.com/yellow_defi">
                                    <a className="button button--outline button--secondary">
                                        <span className="button__inner">
                                            <img src={'/images/icons/twitter.svg'} className="button__icon-left" />
                                            Follow Us
                                        </span>
                                    </a>
                                </Link> */}
                            </div>
                        </div>
                    </div>
                    <div className="col col--5 hero-img">
                    <Image
                        src={"/images/hero_2x.png"}
                        width={1032}
                        height={1032}
                        layout="responsive"
                    />
                    {/* <img srcSet={`${'/images/hero_mobile.png'} 339w,
                                ${'/images/hero.png'} 516w,
                                ${'/images/hero_2x.png'} 1032w`}
                        sizes="(max-width: 425px) 339px, (max-width: 2000px) 516px, 1032px"
                        className='inline'
                    /> */}
                    </div>
                </div>
            </div>
        </header>
    );
}
