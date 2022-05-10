export const FOOTER_ITEMS = {
    logo: {
        alt: 'Yellow Chain',
        src: '/images/logo-white.svg',
    },
    socials: [
        { src: '/images/icons/reddit.svg', to: 'https://www.reddit.com/r/YellowDeFi/' },
        { src: '/images/icons/twitter-white.svg', to: 'https://twitter.com/Yellow' },
        { src: '/images/icons/medium.svg', to: 'https://medium.com/yellow-blog' },
        { src: '/images/icons/telegram-white.svg', to: 'https://t.me/yellow_org' },
        { src: '/images/icons/discord.svg', to: 'https://discord.com/invite/DKBjCg6rmT' },
    ],
    links: [
        {
            title: 'Docs',
            items: [
                {
                    label: 'Introduction',
                    to: 'https://docs.yellow.org',
                },
                {
                    label: 'Vision',
                    to: 'https://docs.yellow.org',
                },
                {
                    label: 'Architecture',
                    to: 'https://docs.yellow.org',
                },
                {
                    label: 'Tokenomics',
                    to: 'https://docs.yellow.org',
                },
            ],
        },
        {
            title: 'Community',
            items: [
                {
                    label: 'Twitter',
                    href: 'https://twitter.com/Yellow',
                },
                {
                    label: 'Telegram',
                    href: 'https://t.me/yellow_org',
                },
                {
                    label: 'Stack Overflow',
                    href: 'https://stackoverflow.com/questions/tagged/yellow',
                },
            ],
        },
        {
            title: 'More',
            items: [
                {
                    label: 'Blog',
                    to: '/blog',
                },
                {
                    label: 'GitHub',
                    href: 'https://github.com/openware/opendax',
                },
            ],
        },
    ],
    copyright: `Copyright © ${new Date().getFullYear()} Yellow, Inc.`,
};
