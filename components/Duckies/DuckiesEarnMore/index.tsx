import classnames from 'classnames';
import React, { useEffect, useState, useMemo } from 'react';
import { isBrowser } from '../../../helpers/isBrowser';
import {
    TwitterShareButton,
    LinkedinShareButton,
    TelegramShareButton,
    WeiboShareButton,
    FacebookShareButton
} from 'next-share';
import { useEagerConnect } from '../../../hooks/useEagerConnect';
import useWallet from '../../../hooks/useWallet';
import useMetaMask from '../../../hooks/useMetaMask';
import Image from 'next/image';
import * as ga from '../../../lib/ga';

interface DuckiesEarnMoreProps {
    handleOpenModal: () => void;
}

export const DuckiesEarnMore: React.FC<DuckiesEarnMoreProps> = ({
    handleOpenModal,
}: DuckiesEarnMoreProps) => {
    const [shareableLink, setShareableLink] = React.useState<string>('');
    const [shareableLinkPrefix, setShareableLinkPrefix] = React.useState('');
    const [isCopyClicked, setIsCopyClicked] = useState<boolean>(false);

    const isBrowserDefined = isBrowser();

    const { active, account } = useWallet();
    const triedToEagerConnect = useEagerConnect();

    const { supportedChain } = useMetaMask();

    const isReady = useMemo(() => {
        return supportedChain && triedToEagerConnect && active && account;
    }, [supportedChain, triedToEagerConnect, active, account]);

    const getSharableLink = React.useCallback(async (account: string) => {
        const response = await fetch(`/api/link?address=${account}`);

        const data = await response.json();
        setShareableLink(data.token);
    }, []);

    useEffect(() => {
        if (!account) {
            setShareableLink('')
        }
    }, [active, account]);

    useEffect(() => {
        if (!isCopyClicked)
            return;

        setTimeout(() => {
            setIsCopyClicked(false);
        }, 700);
    }, [isCopyClicked]);

    const renderMetamaskButton = React.useCallback(() => (
        <div onClick={handleOpenModal} className="button button--outline button--secondary button--shadow-secondary">
            <span className="button__inner">Connect Metamask</span>
        </div>
    ), [handleOpenModal]);

    const inputLink = classnames('', {
        'login-gradient w-full w-[20rem] absolute h-16': !isReady,
    });

    const inputLinkRef = classnames('flex items-center bg-input-background-color border-2 border-text-color-100 rounded mr-4 py-4 px-4 sm:px-5 w-full max-2-full overflow-x-auto', {
        'border-r-0 rounded-tr-0 rounded-br-0 left-0 w-[20rem] overflow-hidden': !isReady,
    });

    const message = React.useMemo(() => 'Go and claim your DUCKIES tokens (choose Polygon mainnet on your Wallet for tokens minting)!', []);

    const socials = React.useMemo(() => {
        return [
            {
                type: 'weibo',
                icon: (
                    <WeiboShareButton
                        key="weibo"
                        url={`${shareableLinkPrefix}${shareableLink}`}
                        title={message}
                    >
                        <svg width="49" height="48" viewBox="0.5 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24.5 48C37.7548 48 48.5 37.2548 48.5 24C48.5 10.7452 37.7548 0 24.5 0C11.2452 0 0.5 10.7452 0.5 24C0.5 37.2548 11.2452 48 24.5 48Z" fill="white"/>
                            <path d="M12.5 28.3999C12.5 31.714 16.7993 34.3999 22.1 34.3999C27.4007 34.3999 31.7 31.714 31.7 28.3999C31.7 25.0858 27.4007 22.3999 22.1 22.3999C16.7993 22.3999 12.5 25.0858 12.5 28.3999Z" fill="white"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M31.4458 23.9201L31.4559 23.9232C33.0878 24.4348 34.904 25.6722 34.9001 27.8536C34.9001 31.4588 29.7573 36 22.0254 36C16.1295 36 10.1001 33.1087 10.1001 28.3573C10.1001 25.8705 11.6575 22.9951 14.3367 20.2863C17.9183 16.6652 22.096 15.0153 23.6652 16.6057C24.3556 17.3077 24.4223 18.5174 23.979 19.965C23.7436 20.6908 24.6537 20.2902 24.6537 20.2902C27.5487 19.0647 30.075 18.9933 30.9969 20.3259C31.4912 21.0398 31.4441 22.0353 30.9891 23.1895C30.7829 23.7165 31.0512 23.7989 31.4458 23.9201ZM12.9677 29.4916C13.2736 32.6129 17.3377 34.7665 22.045 34.2946C26.7485 33.8266 30.3183 30.9115 30.0083 27.7862C29.7063 24.6649 25.6423 22.5113 20.9349 22.9832C16.2314 23.4552 12.6617 26.3663 12.9677 29.4916Z" fill="#E6162D"/>
                            <path d="M36.8756 15.2383C34.9263 13.205 32.0514 12.431 29.3977 12.9624C28.7834 13.0857 28.3943 13.6556 28.5254 14.2294C28.6564 14.807 29.2584 15.1728 29.8727 15.0496C31.7606 14.6722 33.8042 15.2229 35.1884 16.667C36.5725 18.111 36.9493 20.0788 36.3555 21.804C36.163 22.3662 36.4906 22.967 37.0885 23.1479C37.6865 23.3289 38.3253 23.0209 38.5178 22.4625V22.4586C39.3532 20.0365 38.8249 17.2677 36.8756 15.2383Z" fill="#FF9933"/>
                            <path d="M33.8793 18.0428C32.894 17.0055 31.4414 16.6099 30.1036 16.8844C29.5557 16.9934 29.2075 17.51 29.3221 18.0307C29.441 18.5514 29.9804 18.8824 30.5241 18.7693C31.1781 18.6361 31.8916 18.8299 32.3716 19.3344C32.8515 19.843 32.9831 20.5332 32.775 21.1387C32.6052 21.6432 32.894 22.1881 33.4291 22.3536C33.9642 22.515 34.5333 22.2406 34.7075 21.732C35.1279 20.4928 34.8646 19.0801 33.8793 18.0428Z" fill="#FF9933"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.9149 28.3048C17.9509 26.2994 20.6453 25.1632 23.0305 25.7572C25.4993 26.3672 26.7609 28.5879 25.75 30.7488C24.7265 32.9535 21.7857 34.1336 19.2876 33.3642C16.8815 32.6226 15.8581 30.3501 16.9149 28.3048ZM22.8091 29.0265C22.6337 29.3135 22.2452 29.4491 21.9444 29.3295C21.6437 29.2138 21.5518 28.8909 21.723 28.6118C21.8985 28.3327 22.2703 28.1972 22.5668 28.3088C22.8676 28.4125 22.9762 28.7354 22.8091 29.0265ZM21.2092 30.98C20.7246 31.7176 19.6845 32.0405 18.9033 31.7017C18.1347 31.3668 17.905 30.5096 18.3895 29.788C18.8699 29.0703 19.8725 28.7514 20.6495 29.0623C21.4348 29.3853 21.6854 30.2345 21.2092 30.98Z" fill="black"/>
                        </svg>
                    </WeiboShareButton>

                ),
            },
            {
                type: 'facebook',
                icon: (
                    <FacebookShareButton
                        url={`${shareableLinkPrefix}${shareableLink}`}
                        title={message}
                        key="facebook"
                    >
                        <svg width="49" height="48" viewBox="0.5 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.5 24C0.5 10.7452 11.2452 0 24.5 0C37.7548 0 48.5 10.7452 48.5 24C48.5 37.2548 37.7548 48 24.5 48C11.2452 48 0.5 37.2548 0.5 24Z" fill="#3B5998"/>
                            <path d="M27.0015 38.1115V25.0542H30.6058L31.0835 20.5546H27.0015L27.0076 18.3025C27.0076 17.1289 27.1191 16.5001 28.8047 16.5001H31.058V12H27.4531C23.123 12 21.599 14.1828 21.599 17.8536V20.5551H18.8999V25.0547H21.599V38.1115H27.0015Z" fill="white"/>
                        </svg>
                    </FacebookShareButton>
                ),
            },
            {
                type: 'twitter',
                icon: (
                    <TwitterShareButton
                        url={`${shareableLinkPrefix}${shareableLink}`}
                        title={message}
                        key="twitter"
                    >
                        <svg width="49" height="48" viewBox="0.5 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.5 24C0.5 10.7452 11.2452 0 24.5 0C37.7548 0 48.5 10.7452 48.5 24C48.5 37.2548 37.7548 48 24.5 48C11.2452 48 0.5 37.2548 0.5 24Z" fill="#55ACEE"/>
                            <path d="M23.7812 19.5074L23.8316 20.3379L22.9922 20.2362C19.9369 19.8464 17.2677 18.5244 15.0013 16.3042L13.8934 15.2026L13.608 16.0161C13.0036 17.8295 13.3897 19.7447 14.6488 21.0327C15.3203 21.7445 15.1692 21.8462 14.0109 21.4225C13.608 21.2869 13.2554 21.1853 13.2219 21.2361C13.1044 21.3547 13.5073 22.897 13.8262 23.5071C14.2627 24.3545 15.1524 25.185 16.1261 25.6765L16.9487 26.0663L15.975 26.0832C15.0349 26.0832 15.0013 26.1002 15.1021 26.4561C15.4378 27.5577 16.764 28.7271 18.2413 29.2356L19.2822 29.5915L18.3756 30.1338C17.0326 30.9134 15.4546 31.3541 13.8766 31.388C13.1211 31.4049 12.5 31.4727 12.5 31.5236C12.5 31.693 14.5481 32.6421 15.74 33.015C19.3157 34.1166 23.563 33.6421 26.7526 31.7608C29.0189 30.4219 31.2852 27.7611 32.3428 25.185C32.9136 23.8122 33.4844 21.3039 33.4844 20.1006C33.4844 19.321 33.5347 19.2193 34.4748 18.2871C35.0288 17.7448 35.5492 17.1516 35.65 16.9821C35.8178 16.6601 35.8011 16.6601 34.9449 16.9482C33.518 17.4567 33.3165 17.3889 34.0216 16.6262C34.542 16.0839 35.1631 15.1009 35.1631 14.8128C35.1631 14.762 34.9113 14.8467 34.6259 14.9992C34.3238 15.1687 33.6523 15.4229 33.1486 15.5755L32.2421 15.8636L31.4195 15.3043C30.9663 14.9992 30.3283 14.6603 29.9926 14.5586C29.1364 14.3213 27.827 14.3552 27.0548 14.6264C24.9563 15.389 23.6301 17.355 23.7812 19.5074Z" fill="white"/>
                        </svg>
                    </TwitterShareButton>
                ),
            },
            {
                type: 'linkedin',
                icon: (
                    <LinkedinShareButton
                        url={`${shareableLinkPrefix}${shareableLink}`}
                        key="linkedin"
                        title={message}
                    >
                        <svg width="49" height="48" viewBox="0.5 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.5 24C0.5 10.7452 11.2452 0 24.5 0C37.7548 0 48.5 10.7452 48.5 24C48.5 37.2548 37.7548 48 24.5 48C11.2452 48 0.5 37.2548 0.5 24Z" fill="#0077B5"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M17.819 14.8227C17.819 16.3918 16.6378 17.6473 14.7414 17.6473H14.7066C12.8807 17.6473 11.7002 16.3918 11.7002 14.8227C11.7002 13.2204 12.9166 12 14.7772 12C16.6378 12 17.7837 13.2204 17.819 14.8227ZM17.4607 19.8778V36.2196H12.0218V19.8778H17.4607ZM37.0754 36.2196L37.0756 26.8497C37.0756 21.8303 34.3924 19.4941 30.8133 19.4941C27.9256 19.4941 26.6327 21.0802 25.9109 22.1929V19.8783H20.4713C20.543 21.4117 20.4713 36.22 20.4713 36.22H25.9109V27.0934C25.9109 26.605 25.9462 26.1178 26.09 25.7681C26.4831 24.7924 27.3781 23.7822 28.8807 23.7822C30.8496 23.7822 31.6367 25.2807 31.6367 27.4767V36.2196H37.0754Z" fill="white"/>
                        </svg>
                    </LinkedinShareButton>
                ),
            },
            {
                type: 'telegram',
                icon: (
                    <TelegramShareButton
                        url={`${shareableLinkPrefix}${shareableLink}`}
                        title={message}
                        key="telegram"
                    >
                        <svg width="49" height="48" viewBox="0.5 0 49 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24.5 48C37.7548 48 48.5 37.2548 48.5 24C48.5 10.7452 37.7548 0 24.5 0C11.2452 0 0.5 10.7452 0.5 24C0.5 37.2548 11.2452 48 24.5 48Z" fill="url(#paint0_linear_4132_2355)"/>
                            <path d="M20.0999 35C19.3224 35 19.4545 34.7064 19.1863 33.9661L16.8999 26.4412L34.4999 16" fill="#C8DAEA"/>
                            <path d="M20.1001 34.9999C20.7001 34.9999 20.9652 34.7255 21.3001 34.3999L24.5001 31.2883L20.5085 28.8813" fill="#A9C9DD"/>
                            <path d="M20.5079 28.882L30.1799 36.0278C31.2836 36.6368 32.0802 36.3215 32.3551 35.0031L36.2921 16.4505C36.6952 14.8344 35.6761 14.1015 34.6203 14.5808L11.5023 23.495C9.92424 24.128 9.93344 25.0084 11.2146 25.4006L17.1472 27.2523L30.8818 18.5873C31.5302 18.1941 32.1253 18.4055 31.6369 18.839" fill="url(#paint1_linear_4132_2355)"/>
                            <defs>
                                <linearGradient id="paint0_linear_4132_2355" x1="18.5024" y1="2.0016" x2="6.5024" y2="30" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#37AEE2"/>
                                    <stop offset="1" stopColor="#1E96C8"/>
                                </linearGradient>
                                <linearGradient id="paint1_linear_4132_2355" x1="21.4955" y1="25.4742" x2="24.0599" y2="33.7692" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#EFF7FC"/>
                                    <stop offset="1" stopColor="white"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </TelegramShareButton>
                ),
            },
        ];
    }, [shareableLinkPrefix, shareableLink, message]);

    React.useEffect(() => {
        if (active && account) {
            getSharableLink(account);
        }
    }, [active, account, getSharableLink]);

    React.useEffect(() => {
        if (isBrowserDefined) {
            setShareableLinkPrefix(`${window.location.origin}/link/`);
        }
    }, [isBrowserDefined]);

    const sendGAEvent = React.useCallback((type: string) => {
        ga.event({
            action: "duckies_share_socials_button_click",
            params: {
                social_type: type,
            }
        });
    }, []);

    const renderSocials = React.useMemo(() => {
        return socials.map((social: any, index: number) => {
            return (
                <div
                    className="w-12 h-12 mr-1.5 ml-1.5 last:mr-0 after:!rounded-[50%] after:!bottom-[-7px] sm:after:!bottom-[-3px] before:hidden button button--secondary button--shadow-secondary"
                    key={`social-${index}`}
                >
                    <span className="button__inner !bg-transparent !p-0 !w-12 !h-12 !rounded-[50%]" onClick={() => sendGAEvent(social.type)}>
                        {social.icon}
                    </span>
                </div>
            );
        });
    }, [socials, sendGAEvent]);

    const renderHypnoduck = React.useMemo(() => {
        if (!isReady) {
            return <></>
        }

        return (
            <div className="basis-full w-full sm:max-w-[38.75rem]">
                <div className="relative w-full sm:max-w-[38.75rem] sm:max-h-[38.75rem] pt-[100%]">
                    <div className="absolute top-0 bottom-0 left-0 right-0 w-full h-full object-cover object-center">
                        <Image
                            src="/images/referral_hypnoduck_back.png"
                            layout="fill"
                            alt="hypnoduck-back"
                        />
                    </div>
                    <div className="absolute top-0 bottom-0 left-0 right-0 w-full h-full object-cover object-center">
                        <Image
                            src="/images/referral_hypnoduck.gif"
                            layout="fill"
                            alt="hypnoduck"
                        />
                    </div>
                </div>
            </div>
        );
    }, [isReady]);

    const renderReferrerHeader = React.useMemo(() => {
        if (!isReady) {
            return (
                <div className="flex flex-col items-left justify-center mb-9">
                    <div className="text-6xl text-text-color-100 font-gilmer-bold pb-2 text-center">
                        Quack to your friends
                    </div>
                    <div className="text-2xl text-text-color-100 font-gilmer-medium text-center">
                        Share the link to grow your team and earn more rewards. Invite the friend with your referral link to get 50k DUCKIES
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-left justify-center mb-9">
                <div className="block w-fit bg-primary-cta-color-90 text-primary-cta-layer-color-60 py-1 px-3.5 font-metro-bold rounded-sm mb-2">
                    REFERRAL
                </div>
                <div className="text-6xl text-text-color-100 font-gilmer-bold pb-2 text-left">
                    Quack to your friends
                </div>
                <div className="text-2xl text-text-color-100 font-gilmer-medium text-left">
                    Share the link to grow your team and earn more rewards. Invite the friend with your referral link to get 50k DUCKIES
                </div>
            </div>
        )
    }, [isReady])

    const handleCopy = React.useCallback((value: string) => {
        navigator.clipboard.writeText(value);
        ga.event({
            action: "duckies_share_copy_button_click",
        });
        setIsCopyClicked(true);
    }, []);

    const handleSendGAEvent = React.useCallback(() => {
        ga.event({
            action: "duckies_share_input_click",
        });
    }, []);

    return (
        <div className="mx-auto pt-[6.25rem] px-3.5 max-w-md-layout 2xl:max-w-lg-layout" id="earn-more">
            <div className="flex justify-center items-center gap-9 flex-col sm:flex-row">
                {renderHypnoduck}
                <div className="basis-full">
                    {renderReferrerHeader}
                    <div className={classnames('flex w-full justify-center flex-col', { 'items-center': !isReady, 'items-left': isReady })}>
                        <div className={classnames('flex relative items-center max-w-screen sm:w-auto -mx-3.5 px-3.5 sm:max-w-[43.75rem] mb-6 sm:mb-5', { 'w-screen': isReady })}>
                            <div className={inputLinkRef} onClick={handleSendGAEvent} onFocus={handleSendGAEvent}>
                                <div className={classnames("text-text-color-100 text-base font-metro-regular font-bold whitespace-nowrap", { 'overflow-hidden': !isReady })}>
                                    {`${shareableLinkPrefix}${shareableLink}`}
                                </div>
                                <div className={inputLink} />
                            </div>
                            {isReady ? (
                                <div onClick={() => handleCopy(`${shareableLinkPrefix}${shareableLink}`)} className="button button--outline button--secondary button--shadow-secondary">
                                    <span className={classnames('button__inner !px-6 !py-3.5 relative flex justify-center items-center !w-[4.375rem]', { '!bg-system-green-20': isCopyClicked })}>
                                        {isCopyClicked && (
                                            <div className="absolute bg-text-color-0 border-2 border-text-color-100 rounded text-3.5 leading-6 font-metro-regular font-normal text-text-color-100 py-4 px-5 bottom-[calc(100%+0.313rem)] ml-0.5">
                                                Copied
                                            </div>
                                        )}
                                        {isCopyClicked ? (
                                            <svg width="25" height="19" viewBox="0 0 25 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M24.2374 1.26256C24.9209 1.94598 24.9209 3.05402 24.2374 3.73744L10.2374 17.7374C9.55402 18.4209 8.44598 18.4209 7.76256 17.7374L0.762563 10.7374C0.0791456 10.054 0.0791456 8.94598 0.762563 8.26256C1.44598 7.57915 2.55402 7.57915 3.23744 8.26256L9 14.0251L21.7626 1.26256C22.446 0.579146 23.554 0.579146 24.2374 1.26256Z" fill="#00632B"/>
                                            </svg>
                                        ) : (
                                            <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8.60019 0.800049C7.0538 0.800049 5.8002 2.05365 5.8002 3.60005V14.8C5.8002 16.3464 7.0538 17.6 8.60019 17.6H17.0002C18.5466 17.6 19.8002 16.3464 19.8002 14.8V6.97995C19.8002 6.23734 19.5052 5.52515 18.9801 5.00005L15.6002 1.62015C15.0751 1.09505 14.3629 0.800049 13.6203 0.800049H8.60019Z" fill="black"/>
                                                <path d="M0.200195 9.20005C0.200195 7.65365 1.4538 6.40005 3.0002 6.40005V20.4001H14.2002C14.2002 21.9464 12.9466 23.2001 11.4002 23.2001H3.0002C1.4538 23.2001 0.200195 21.9464 0.200195 20.4001V9.20005Z" fill="black"/>
                                            </svg>
                                        )}
                                    </span>
                                </div>
                            ) : (
                                <div className="absolute right-5">
                                    <img src="/images/components/duckies/login_eyes.png" alt="login" />
                                </div>
                            )}
                        </div>
                        <div className={classnames('flex items-center w-full max-w-full no-scrollbar', { 'justify-center': !isReady, 'justify-start ml-[-0.25rem]': isReady })}>
                            {isReady ? renderSocials : renderMetamaskButton()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
