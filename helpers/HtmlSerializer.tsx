import Link from 'next/link';
import * as React from 'react';

const HtmlSerializer = {
    paragraph: ({ children }: any) => {
        return (
            <p className="text-[18px] leading-[26px] font-metro-semibold text-text-color-100">
                {children}
            </p>
        );
    },
    preformatted: ({ children }: any) => (
        <pre
            className="cursor-pointer"
            onClick={(e: any) => {
                navigator.clipboard.writeText(e.target.innerText);
            }}
        >
            {children}
        </pre>
    ),
    strong: ({ children }: any) => <strong>{children}</strong>,
    em: ({ children }: any) => <em>{children}</em>,
    listItem: ({ children }: any) => (
        <li className="text-[18px] leading-[26px] font-metro-semibold text-text-color-100">
            {children}
        </li>
    ),
    oListItem: ({ children }: any) => (
        <li className="text-[18px] leading-[26px] font-metro-semibold text-text-color-100">
            {children}
        </li>
    ),
    hyperlink: ({ node, children }: any) => {
        return (
            <Link href={node.data.url}>
                <a className="text-[18px] leading-[26px] font-metro-semibold text-text-color-100 hover:text-text-color-100 prevent-default underline">
                    {children}
                </a>
            </Link>
        );
    },
    image: ({ node }: any) => {
        return <img src={node.url} alt={node.alt} className="mb-4" />;
    },
};

export default HtmlSerializer;
