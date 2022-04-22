import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export const Roadmap = () => {
    return (
        <div id="roadmap" className="section roadmap">
            <div className="container">
                <div className="row">
                    <div className="col col--6">
                        <div className="roadmap-left">
                            <span className="highlight">Roadmap</span>
                            <h4 className="section-title">Product first</h4>
                            <div className="roadmap-text">
                                <p className="section-text subtitle-2-18-700">
                                    Strategy and long-term planning steps to the future of digital exchange.
                                    <br />Get familiarized with our route and don’t hesitate to become our like-minded strategic partner.
                                </p>
                                <p className="section-text--smaller subtitle-2-18-700">
                                    Yellow Team
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="col col--6">
                        <LazyLoadImage className="section__main-img"
                            srcSet={`${'/img/components/roadmap_mobile.svg'} 339w,
                                    ${'/img/components/roadmap.png'} 682w,
                                    ${'/img/components/roadmap_2x.png'} 1362w`}
                            sizes="(max-width: 425px) 339px, (max-width: 2000px) 682px, 1364px"
                            effect="blur"
                            threshold={200}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
