import React from 'react';
import Link from 'next/link'
import { LazyLoadImage } from 'react-lazy-load-image-component';

export const HowItWorks: React.FC = () => {
    return (
        <div className="section section__grey how-it-works">
            <div className="container">
                <div className="row">
                    <div className="col col--6">
                        <span className="highlight">Architecture</span>
                        <h4 className="section-title">How does it work?</h4>
                        <p className="section-text--smaller subtitle-2-18-700">
                            Yellow Network is the Layer-3 scaling solution that utilizes state channels technology.
                            That makes it possible to use high-performance centralized
                            matching with trustless funds management.
                            <br /><br />
                            Functionality:
                        </p>

                        <ul className="section-text subtitle-2-18-700 how-it-works__list">
                            <li>MetaMask Sign In</li>
                            <li>Deposit / Withdraw</li>
                            <li>Spot Trading</li>
                            <li>Broker Admin Panel</li>
                        </ul>

                        <Link href="https://docs.yellow.org">
                            <a className="button button--outline button--secondary button--wide">
                                <span className="button__inner">
                                    Learn More
                                </span>
                            </a>
                        </Link>
                    </div>

                    <div className="col col--6">
                        <LazyLoadImage className="section__main-img"
                            srcSet={`${'/images/components/how_it_works_mobile.png'} 339w,
                                    ${'/images/components/how_it_works.png'} 624w,
                                    ${'/images/components/how_it_works_2x.png'} 1248w`}
                            sizes="(max-width: 425px) 339px, (max-width: 2000px) 624px, 1248px"
                            effect="blur"
                            threshold={200}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
