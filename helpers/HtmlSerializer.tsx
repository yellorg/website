import Link from 'next/link';
import * as React from 'react';

const HtmlSerializer = (
    type: string,
    element: any,
    children: any,
) => {
    if (type === 'paragraph') {
        if (element?.direction === 'rtl') {
            return (
                <div className="flex w-full justify-end">
                    <p className="text-[18px] leading-[26px] font-metro-semibold text-text-color-100">
                        {children}
                    </p>
                </div>
            );
        }
        return (
            <p className="text-[18px] leading-[26px] font-metro-semibold text-text-color-100">
                {children}
            </p>
        );
    }

    if (type === 'hyperlink') {
        return (
            <Link href={element.data.url}>
                <a className="text-[18px] leading-[26px] font-metro-semibold text-text-color-100 hover:text-text-color-100 prevent-default underline">
                    {children}
                </a>
            </Link>
        );
    }

    if (type === 'group-list-item') {
        return (
            <ul
                style={{
                    listStylePosition: 'outside',
                    listStyle: 'disc',
                }}
            >
                {children}
            </ul>
        );
    }

    if (type === 'list-item') {
        return (
            <li
                className="text-[18px] leading-[26px] font-metro-semibold text-text-color-100"
            >
                {children}
            </li>
        );
    }

    if (type == 'group-o-list-item') {
        return <ol style={{listStyle: 'decimal'}}>{children}</ol>;
    }

    if (type === 'o-list-item') {
        return (
            <li className="text-[18px] leading-[26px] font-metro-semibold text-text-color-100">
                {children}
            </li>
        );
    }

    if (type === 'strong') {
        return (
            <strong className="font-metro-bold">{children}</strong>
        );
    }

    if (type === 'em') {
        return <em>{children}</em>;
    }

    if (type === 'image') {
        return <img src={element.url} alt={element.alt} className="mb-4" />;
    }

    if (type === 'preformatted') {
        return <pre>{children}</pre>;
    }

    return null;
}

export default HtmlSerializer;
