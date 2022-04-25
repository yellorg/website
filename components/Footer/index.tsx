import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { FOOTER_ITEMS } from './footerItems';
import IconExternalLink from '../IconExternalLink';

export const Footer = () => {
    const renderLogo = React.useMemo(() => {
        const { logo } = FOOTER_ITEMS;
        return (
            <div>
                <Image
                    src={logo.src}
                    alt={logo.alt}
                    className="footer__logo"
                    width={137}
                    height={43}
                />
            </div>
        );
    }, []);

    const renderSocials = React.useMemo(() => {
        const { socials } = FOOTER_ITEMS;
        return (
            <div className="footer__socials">
                {socials.map( (social, i) => {
                    return (
                        <Link key={i} href={social.to}>
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Image
                                    src={social.src}
                                    alt="social"
                                    loading="lazy"
                                    width={24}
                                    height={24}
                                />
                            </a>
                        </Link>
                    )
                })}
            </div>
        );
    }, []);

    const renderLinkItems = (items: any) => {
        return (
            <ul className="footer__items">
                {items.map((item: any, i: number) => {
                    const isExternal = item.hasOwnProperty('href');
                    return (
                        <li key={i} className="footer__item">
                            <Link href={isExternal ? item.href : item.to}>
                                {isExternal ? (
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="footer__link-item"
                                    >
                                        <span>
                                            {item.label}
                                            {/* <svg
                                                width="13.5"
                                                height="13.5"
                                                aria-hidden="true"
                                                viewBox="0 0 24 24"
                                                className="iconExternalLink"
                                            >
                                                <path
                                                    fill="currentColor"
                                                    d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"
                                                ></path>
                                            </svg> */}
                                            <IconExternalLink />
                                        </span>
                                    </a>
                                ):(
                                    <a className="footer__link-item" >
                                        {item.label}
                                    </a>
                                )}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        )
    };

    const renderLinks = React.useMemo(() => {
        const { links } = FOOTER_ITEMS;
        return (
            <>
                {links.map((linkType, i) => {
                    const { title, items } = linkType
                    return (
                        <div key={i} className="col footer__col">
                            <div className="footer__title">
                                {title}
                            </div>
                            {renderLinkItems(items)}
                        </div>
                    )
                })}
            </>
        );
    }, []);

    return (
        <footer className="footer footer--dark">
            <div className="container">
                <div className="row footer__links">
                    <div className="col col--4 footer__col footer__overview">
                        {renderLogo}
                        <p className="body-2-14-400 margin-bottom--md footer__text">
                            Yellow is a hybrid Layer-3 digital exchange system
                            based on technology that combines the best of
                            centralized and decentralized worlds. Let’s build
                            the future of finance together!
                        </p>
                        {renderSocials}
                    </div>
                    {/* <div className="col footer__col">
                        <div className="footer__title">Docs</div>
                        <ul className="footer__items">
                            <li className="footer__item">
                                <a
                                    className="footer__link-item"
                                    href="/docs/overview/what-is-yellow"
                                >
                                    Introduction
                                </a>
                            </li>
                            <li className="footer__item">
                                <a
                                    className="footer__link-item"
                                    href="/docs/overview/vision"
                                >
                                    Vision
                                </a>
                            </li>
                            <li className="footer__item">
                                <a
                                    className="footer__link-item"
                                    href="/docs/network/architecture"
                                >
                                    Architecture
                                </a>
                            </li>
                            <li className="footer__item">
                                <a
                                    className="footer__link-item"
                                    href="/docs/token/token-overview"
                                >
                                    Tokenomics
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="col footer__col">
                        <div className="footer__title">Community</div>
                        <ul className="footer__items">
                            <li className="footer__item">
                                <a
                                    href="https://twitter.com/yellow_defi"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer__link-item"
                                >
                                    <span>
                                        Twitter{' '}
                                        <svg
                                            width="13.5"
                                            height="13.5"
                                            aria-hidden="true"
                                            viewBox="0 0 24 24"
                                            className="iconExternalLink_I5OW"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"
                                            ></path>
                                        </svg>
                                    </span>
                                </a>
                            </li>
                            <li className="footer__item">
                                <a
                                    href="https://t.me/yellow_org"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer__link-item"
                                >
                                    <span>
                                        Telegram{' '}
                                        <svg
                                            width="13.5"
                                            height="13.5"
                                            aria-hidden="true"
                                            viewBox="0 0 24 24"
                                            className="iconExternalLink"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"
                                            ></path>
                                        </svg>
                                    </span>
                                </a>
                            </li>
                            <li className="footer__item">
                                <a
                                    href="https://stackoverflow.com/questions/tagged/yellow"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer__link-item"
                                >
                                    <span>
                                        Stack Overflow{' '}
                                        <svg
                                            width="13.5"
                                            height="13.5"
                                            aria-hidden="true"
                                            viewBox="0 0 24 24"
                                            className="iconExternalLink"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"
                                            ></path>
                                        </svg>
                                    </span>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="col footer__col">
                        <div className="footer__title">More</div>
                        <ul className="footer__items">
                            <li className="footer__item">
                                <a className="footer__link-item" href="/blog">
                                    Blog
                                </a>
                            </li>
                            <li className="footer__item">
                                <a
                                    href="https://github.com/openware/opendax"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer__link-item"
                                >
                                    <span>
                                        GitHub{' '}
                                        <svg
                                            width="13.5"
                                            height="13.5"
                                            aria-hidden="true"
                                            viewBox="0 0 24 24"
                                            className="iconExternalLink"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"
                                            ></path>
                                        </svg>
                                    </span>
                                </a>
                            </li>
                        </ul>
                    </div> */}
                    {renderLinks}
                </div>
                <div className="footer__bottom text--center">
                    <div className="footer__copyright">
                        Copyright © 2022 Yellow, Inc.
                    </div>
                </div>
            </div>
        </footer>
    );
};
