import React from "react";
import Link from "next/link";
import { LazyLoadImage } from 'react-lazy-load-image-component';

export const Tokenomics: React.FC = () => {
    return (
        <div className="section section__grey" id="tokenomics">
            <div className="container tokenomics">
                <div className="row">
                    <div className="col col--6">
                        <span className="highlight subtitle-2-18-700">
                            Economics
                        </span>

                        <h4>YELLOW Token</h4>

                        <div className="subtitle-2-18-600">
                            <p>
                                YELLOW is a native token of the
                                Yellow Network. It uses a non-custodial
                                solution based on OpenDAX v4 stack.
                            </p>

                            <p>Our token has the following utilities:</p>

                            <ul className="tokenomics__utilities-list">
                                <li>Fee settlement between brokers inside Yellow Network</li>
                                <li>Trading fee discount on <a href='https://yellow.com'>yellow.com</a></li>
                                <li>Staking</li>
                                <li>Yellow Foundation Development governance</li>

                            </ul>

                            <div>
                                <Link href="https://yellow.org/docs/token/token-overview">
                                    <a className="button button--outline button--secondary button--shadow-secondary button--wide">
                                        <span className="button__inner">
                                            Learn more
                                        </span>
                                    </a>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="col col--6">
                        <LazyLoadImage className="section__main-img"
                            srcSet={`${'/img/components/tokenomics_pie_chart_mobile.png'} 339w,
                                    ${'/img/components/tokenomics_pie_chart.png'} 623w,
                                    ${'/img/components/tokenomics_pie_chart_2x.png'} 1244w`}
                            sizes="(max-width: 425px) 339px, (max-width: 2000px) 623px, 1244px"
                            effect="blur"
                            threshold={200}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
