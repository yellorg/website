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
            <ul className="list-none pl-0">
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
                                        <span className="flex inline-block items-center">
                                            {item.label}
                                            <IconExternalLink />
                                        </span>
                                    </a>
                                ):(
                                    <a className="footer__link-item">
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
        <footer className="flex justify-center pt-[36px] pb-[18px] bg-[#101010]">
            <div className="w-full max-w-md-layout 2xl:max-w-lg-layout-2p px-[14px]">
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
