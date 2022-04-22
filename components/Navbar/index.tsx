import classnames from 'classnames';
import Link from 'next/link';
import React from 'react';
import IconClose from '../IconClose';
import IconMenu from '../IconMenu';
import { NAV_ITEMS } from './navItems';

export const Navbar = () => {
    const [showSidebar, setShowSidebar] = React.useState<boolean>(false);

    const renderNavItems = React.useMemo(() => {
        return NAV_ITEMS.map((n, i) => {
            const isPageSection = n.to.indexOf('#') > -1;
            return isPageSection ? (
                <Link key={i} href={n.to}>
                    <a
                        aria-current="page"
                        className="navbar__item navbar__link navbar__link--active"
                    >
                        {n.label}
                    </a>
                </Link>
            ) : (
                <Link key={i} href={`https://yellow.org${n.to}`}>
                    <a className="navbar__item navbar__link">{n.label}</a>
                </Link>
            );
        });
    }, [NAV_ITEMS]);

    const renderMobileNavItems = React.useMemo(() => {
        return NAV_ITEMS.map((n, i) => {
            const isPageSection = n.to.indexOf('#') > -1;
            return isPageSection ? (
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
            ) : (
                <li key={i} className="menu__list-item">
                    <Link href={`https://yellow.org${n.to}`}>
                        <a aria-current="page" className="menu__link">
                            {n.label}
                        </a>
                    </Link>
                </li>
            );
        });
    }, [NAV_ITEMS]);

    const cnNav = classnames('navbar navbar--fixed-top', {
        'navbar-sidebar--show': showSidebar,
    });

    return (
        <nav className={cnNav}>
            <div className="navbar__inner container">
                <div className="navbar__items">
                    <button
                        aria-label="Navigation bar toggle"
                        className="navbar__toggle clean-btn"
                        type="button"
                        tabIndex={0}
                        onClick={() => setShowSidebar(true)}
                    >
                        <IconMenu />
                    </button>
                    <a className="navbar__brand" href="/">
                        <div className="navbar__logo">
                            <img
                                src="/images/logo.svg"
                                alt="Yellow ttetst Chain"
                                className="themedImage themedImage--light"
                            />
                        </div>
                    </a>
                    {renderNavItems}
                </div>
                <div className="navbar__items navbar__items--right">
                    <a
                        className="button button--secondary margin-right--md"
                        href="https://yellow.org/docs/overview/what-is-yellow"
                    >
                        <span className="button__inner">Litepaper</span>
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
                    <a className="navbar__brand" href="/">
                        <div className="navbar__logo">
                            <img
                                src="/images/logo.svg"
                                alt="Yellow ttetst Chain"
                                className="themedImage themedImage--light"
                            />
                        </div>
                    </a>
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
