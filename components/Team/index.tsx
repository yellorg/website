import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LazyLoadImage, LazyLoadComponent } from 'react-lazy-load-image-component';

import { MEMBERS, TEAM_HEADLINERS } from './members';
import useMediaQuery from '../../hooks/useMediaQuery';

const ACTIVE_GRADIENT = 'linear-gradient(0deg, #090909 0%, rgba(9, 9, 9, 0) 100%)';

const buildImagePath = (image: string) => {
    return `/img/photos/${image || 'anonymous.png'}`;
}

export const Team = () => {
    const [hoverId, setHoverId] = useState(-1);
    const [visibleMembers, setVisibleMembers] = useState(MEMBERS);

    const isMobileScreen = useMediaQuery('(max-width: 425px)');

    useEffect(() => {
        // show only first 15 team members on mobile devices
        const visibleMembers = isMobileScreen ? MEMBERS.slice(0, 15) : MEMBERS;

        setVisibleMembers(visibleMembers);
    }, [isMobileScreen])

    const buildStyle = (id: number, image: string) => {
        const isActive = hoverId === id;
        return {
            backgroundImage: `${isActive ? `${ACTIVE_GRADIENT}, ` : ''}url(${buildImagePath(image)})`,
        }
    };

    const isShowingAllMembers = visibleMembers.length === MEMBERS.length;

    const handleShowMoreClick = () => {
        const updatedVisibleMembers = isShowingAllMembers ? MEMBERS.slice(0, 15) : MEMBERS;
        setVisibleMembers(updatedVisibleMembers);
    }

    const buildSocialIconsGroup = (socials: any[]) => (
        <div className="icon__group">
            {socials.map((s: any) => (
                <Link key={s.link} href={s.link}>
                    <a>{s.img}</a>
                </Link>
            ))}
        </div>
    );

    return (
        <div className="section section__dark" id="team">
            <div className="container team">
                <div className="row section__center">
                    <h4 className="section-title">Team</h4>

                    <div className="team__grid-xl">
                        {TEAM_HEADLINERS.map(i => (
                            <div key={i.name} className="grid__item">
                                <LazyLoadImage className="mb-24 team__headliner-img" src={buildImagePath(i.photo)} effect="blur" threshold={200} />
                                <div className="space-between">
                                    <span className="h8">{i.name}</span>
                                    {i.socials.length && buildSocialIconsGroup(i.socials)}
                                </div>
                                <span className="body-1-16-700 yellow mb-12">{i.position}</span>
                                <p className="body-1-16-400 grey team__headliner-description">{i.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="team__grid-xs">
                        <LazyLoadComponent threshold={200}>
                            {visibleMembers.map((i, id) => (
                                <Link
                                    key={i.name}
                                    href={i.link}
                                >
                                    <a
                                        onMouseEnter={() => setHoverId(id)}
                                        onMouseLeave={() => setHoverId(-1)}
                                        style={buildStyle(id, i.image)}
                                        className="grid__item"
                                    >
                                        {i.link ? <img className="mb-24 grid__item-icon" src={'/img/icons/linkedin.svg'} /> : null}
                                        <div className="grid__item-text">
                                            <p className="body-1-16-700">{i.name}</p>
                                            <p className="captions-12-600">{i.position}</p>
                                        </div>
                                    </a>
                                </Link>
                            ))}
                        </LazyLoadComponent>
                    </div>

                    {isMobileScreen && (
                        <div
                            onClick={handleShowMoreClick}
                            className="team__show-more-btn button button--outline button--secondary button--shadow-secondary"
                        >
                            <span className="button__inner">{isShowingAllMembers ? 'Show less' : 'Show more'}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
