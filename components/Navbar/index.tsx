import classnames from 'classnames';
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect } from 'react';
import IconClose from '../IconClose';
import IconMenu from '../IconMenu';
import { NAV_ITEMS } from './navItems';

export const Navbar = () => {
    const [showSidebar, setShowSidebar] = React.useState<boolean>(false);
    const [isSocialsOpen, setIsSocialsOpen] = React.useState<boolean>(false);

    const socialsRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.addEventListener('mousedown', (event) => {
            if (socialsRef.current !== null && !socialsRef.current.contains(event.target as Node)) {
                setIsSocialsOpen(false);
            }
        });
    }),[]

    const renderSocials = React.useMemo(() => {
        const { socials } = NAV_ITEMS;
        return (
            <div className="flex justify-center">
                {socials.map( (social, i) => {
                    return (
                        <Link key={i} href={social.to}>
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mx-1"
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

    const renderNavItems = React.useMemo(() => {
        return NAV_ITEMS.navTabs.map((n, i) => {
            return (
                <Link key={i} href={n.to}>
                    <a
                        aria-current="page"
                        className="mx-[18px] hidden lg:inline-block relative text-text-color-90 text-[18px] leading-[26px] font-metro-semibold navbar__link"
                    >
                        {n.label}
                    </a>
                </Link>
            )
        });
    }, []);

    const renderMobileNavItems = React.useMemo(() => {
        return NAV_ITEMS.navTabs.map((n, i) => {
            return (
                <li key={i} className="menu__list-item">
                    <Link href={n.to}>
                        <a
                            aria-current="page"
                            className="menu__link menu__link--active"
                        >
                            {n.label}
                        </a>
                    </Link>
                </li>
            )
        });
    }, []);

    const cnNav = classnames('flex shadow-sm justify-center items-center h-[62px] sticky top-0 z-[22] bg-primary-cta-color-60', {
        'navbar-sidebar--show': showSidebar,
    });

    const cnSocialsArrow = classnames('h-4 w-4 mt-1', {
        'rotate-180': isSocialsOpen,
    });

    return (
        <nav className={cnNav}>
            <div className="flex justify-between w-full max-w-md-layout 2xl:max-w-lg-layout-2p px-[14px]">
                <div className="flex min-w-0 items-center">
                    <button
                        aria-label="Navigation bar toggle"
                        className="inherit lg:hidden mr-[10px]"
                        type="button"
                        tabIndex={0}
                        onClick={() => setShowSidebar(true)}
                    >
                        <IconMenu />
                    </button>
                    <Link href="/" >
                        <a className="navbar__brand">
                            <div className="navbar__logo">
                                <Image
                                    src="/images/logo.svg"
                                    alt="Yellow ttetst Chain"
                                    className="themedImage themedImage--light"
                                    width={143}
                                    height={44.69}
                                    layout='responsive'
                                />
                            </div>
                        </a>
                    </Link>
                    {renderNavItems}
                </div>
                <div className="flex items-center min-w-0 justify-end">
                    <div ref={socialsRef} className="relative invisible md:visible lg:invisible inline-block text-center mr-3">
                        <div>
                            <button 
                                type="button" 
                                className="inline-flex w-full items-center mr-5 justify-center w-full bg-primary-cta-color-60 text-md font-metro-semibold focus:outline-none" 
                                id="menu-button"
                                onClick={() => setIsSocialsOpen((isSocialsOpen) => !isSocialsOpen)}
                            >
                                Socials
                                <svg className={cnSocialsArrow} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                </svg>
                            </button>
                        </div>
                        {isSocialsOpen &&
                            <div className="origin-top-right rounded-sm absolute right-0 mt-5 shadow-lg bg-white focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
                                <div className="pt-4 pb-2 px-2" role="none">
                                    {renderSocials}
                                </div>
                            </div>
                        }
                    </div>
                    <div className="hidden lg:flex items-center justify-center pt-2 inline-block text-center mr-3">
                        <div className="pt-3 pb-2 px-3" role="none">
                            {renderSocials}
                        </div>
                    </div>
                    <a
                        className="button button--secondary"
                        href="https://docs.yellow.org/whitepaper"
                    >
                        <span className="button__inner">Whitepaper</span>
                    </a>
                </div>
            </div>
            <div
                role="presentation"
                className="navbar-sidebar__backdrop"
                onClick={() => setShowSidebar(false)}
            ></div>
            <div className="navbar-sidebar">
                <div className="navbar-sidebar__brand">
                    <Link href="/" >
                        <a className="navbar__brand">
                            <div className="navbar__logo">
                                <Image
                                    src="/images/logo.svg"
                                    alt="Yellow ttetst Chain"
                                    className="themedImage themedImage--light"
                                    width={143}
                                    height={44.69}
                                    layout='responsive'
                                />
                            </div>
                        </a>
                    </Link>
                    <button
                        type="button"
                        className="clean-btn navbar-sidebar__close"
                        onClick={() => setShowSidebar(false)}
                    >
                        <IconClose />
                    </button>
                </div>
                <div className="navbar-sidebar__items">
                    <div className="navbar-sidebar__item menu">
                        <ul
                            className="menu__list"
                            onClick={() => setShowSidebar(false)}
                        >
                            {renderMobileNavItems}
                        </ul>
                    </div>
                    <div className="navbar-sidebar__item menu">
                        <button
                            type="button"
                            className="clean-btn navbar-sidebar__back"
                            onClick={() => setShowSidebar(false)}
                        >
                            ← Back to main menu
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
