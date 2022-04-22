import React from "react";
import Link from "next/link";

export const Community = () => {
    return (
        <div className="section section__yellow community">
            <div className="container">
                <div className="row section__center">
                    <h4 className="section-title">Community</h4>

                    <div className="community__socials">
                        <div className="community__socials-item">
                            <img src={"/img/icons/twitter-black.svg"} />

                            <Link href="https://twitter.com/yellow_defi">
                                <a className="button button--outline button--secondary button--shadow-secondary">
                                    <span className="button__inner">Follow on Twitter</span>
                                </a>
                            </Link>
                        </div>

                        <div className="community__socials-item">
                            <img src={"/img/icons/telegram-black.svg"} />

                            <Link href="https://t.me/yellow_org">
                                <a className="button button--outline button--secondary button--shadow-secondary">
                                    <span className="button__inner">Join in Telegram</span>
                                </a>
                            </Link>
                        </div>

                        <div className="community__socials-item">
                            <img src={"/img/icons/reddit-black.svg"} />

                            <Link href="https://www.reddit.com/r/YellowDeFi/">
                                <a className="button button--outline button--secondary button--shadow-secondary">
                                    <span className="button__inner">Join on Reddit</span>
                                </a>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
