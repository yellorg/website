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

                        <h4>$YELLOW Token</h4>

                        <div className="subtitle-2-18-600">
                            <p>
                                $YELLOW is a native token for clearing fees on Yellow Network.
                                Market makers, brokers, and traders inside
                                the network will be the main users of the token.
                            </p>

                            <p>$YELLOW token has the following utilities:</p>

                            <ul className="tokenomics__utilities-list">
                                <li>Collateral and clearing fee settlements between brokers inside Yellow Network</li>
                                <li>Trading fee discount on <a href='https://yellow.com'>yellow.com</a> Exchange</li>
                                <li>Social and content rewards on Yellow Capital</li>
                                <li>Staking to brokers</li>
                                <li>Yellow Foundation development governance</li>
                            </ul>

                            <div>
                                <Link href="https://docs.yellow.org">
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
                            srcSet={`${'/images/components/tokenomics_pie_chart_mobile.png'} 339w,
                                    ${'/images/components/tokenomics_pie_chart.png'} 623w,
                                    ${'/images/components/tokenomics_pie_chart_2x.png'} 1244w`}
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
