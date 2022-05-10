import React from "react";
import Link from "next/link";
import Image from 'next/image';

export const Community = () => {
    return (
        <div className="section section__yellow community">
            <div className="container">
                <div className="row section__center">
                    <h4 className="section-title">Join the Community of Yellowians!</h4>

                    <div className="community__socials">
                        <div className="community__socials-item">
                            <Image
                                src="/images/icons/twitter-black.svg"
                                alt="twitter"
                                width={72}
                                height={72}
                                layout='fixed'
                            />

                            <Link href="https://twitter.com/Yellow">
                                <a className="button button--outline button--secondary button--shadow-secondary">
                                    <span className="button__inner">Follow on Twitter</span>
                                </a>
                            </Link>
                        </div>

                        <div className="community__socials-item">
                            <Image
                                src="/images/icons/telegram-black.svg"
                                alt="telegram"
                                width={72}
                                height={69}
                                layout='fixed'
                            />

                            <Link href="https://t.me/yellow_org">
                                <a className="button button--outline button--secondary button--shadow-secondary">
                                    <span className="button__inner">Join in Telegram</span>
                                </a>
                            </Link>
                        </div>

                        <div className="community__socials-item">
                            <Image
                                src="/images/icons/reddit-black.svg"
                                alt="reddit"
                                width={72}
                                height={72}
                                layout='fixed'
                            />

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
