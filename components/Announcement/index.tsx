import Link from 'next/link';
import React from 'react';
import { useSetMobileDevice } from '../../hooks/useMobileDevice';
import IconChevronUp from '../IconChevronUp';
import IconClose from '../IconClose';

export interface AnnouncementProps {
    show: boolean;
    handleToggleShow: () => void;
}

export const Announcement: React.FC<AnnouncementProps> = ({
    show,
    handleToggleShow,
}) => {
    const isMobile = useSetMobileDevice(996);

    return (!isMobile || show) ? (
        <div className="announcement">
            <div className="announcement__content">
                <div className="announcement__content__item">
                    <span>
                        We are creating a new version of Yellow and launching
                        the Yellow token.
                    </span>
                    <Link href="https://docs.yellow.org">
                        <a className="announcement__link-item">Learn more</a>
                    </Link>
                </div>
                <div className="announcement__content__item">
                    <span>You can still use trading app here:</span>
                    <Link href="trade.yellow.com">
                        <a className="announcement__link-item">
                            trade.yellow.com
                        </a>
                    </Link>
                </div>
            </div>
            <div className="announcement__close" onClick={handleToggleShow}>
                <IconClose
                    width={12}
                    height={12}
                    strokeWidth={2}
                    color="var(--neutral-control-layer-color-30)"
                />
            </div>
        </div>
    ) : isMobile ? (
        <div className="announcement-collapse">
            <div className='announcement-collapse__left'></div>
            <div className="announcement-collapse__content" onClick={handleToggleShow}>
                <IconChevronUp color="var(--text-color-100)" />
            </div>
            <div className='announcement-collapse__right'></div>
        </div>
    ) : null;
};
