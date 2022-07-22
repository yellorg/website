import React from 'react';
import { DuckiesModalWindow } from '../../DuckiesModalWindow';
import Image from 'next/image';
import { loginWithProvider } from '../../../../lib/SupabaseConnector';
import { analytics } from '../../../../lib/analitics';

interface SocialAuthModalProps {
    isOpenModal: boolean;
    setIsOpenModal: (value: boolean) => void;
}

export const SocialAuthModal: React.FC<SocialAuthModalProps> = ({
    isOpenModal,
    setIsOpenModal,
}: SocialAuthModalProps) => {
    const handleSocialAuth = React.useCallback((provider: string) => {
        loginWithProvider(provider);

        analytics({
            type: 'otherEvent',
            name: 'duckies_modal_connect_social',
            params: {
                social: provider,
            }
        });
    }, []);

    const renderModalBody = React.useMemo(() => {
        return (
            <div className="flex flex-col w-full p-0.5">
                <div className="flex justify-center mb-4">
                    <Image width="156px" height="156px" src="/images/components/duckies/duckiesGroup.svg" alt="duckies-group" />
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex w-full mb-1.5 button socials facebook" onClick={() => handleSocialAuth('facebook')}>
                        <div className="button__inner">
                            <div className="absolute left-3">
                                <svg width="10" height="21" viewBox="0 0 10 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.47229 10.0923H6.64526C6.64526 14.609 6.64526 20.1686 6.64526 20.1686H2.45615C2.45615 20.1686 2.45615 14.6629 2.45615 10.0923H0.464844V6.53108H2.45615V4.2276C2.45615 2.57785 3.24008 0 6.68375 0L9.78796 0.0118993V3.46887C9.78796 3.46887 7.90164 3.46887 7.53487 3.46887C7.16811 3.46887 6.64666 3.65225 6.64666 4.43898V6.53178H9.83835L9.47229 10.0923Z" fill="white"/>
                                </svg>
                            </div>
                            Connect with Facebook
                        </div>
                    </div>
                    <div className="flex w-full my-1.5 button socials twitter" onClick={() => handleSocialAuth('twitter')}>
                        <div className="button__inner">
                            <div className="absolute left-3">
                                <svg width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.8668 4.02629C17.8746 4.20209 17.8789 4.37932 17.8789 4.55655C17.8789 9.95281 13.7726 16.1731 6.25955 16.1731C3.9534 16.1731 1.80661 15.4991 0 14.34C0.319445 14.3779 0.644607 14.3972 0.974056 14.3972C2.88787 14.3972 4.64803 13.744 6.04587 12.6492C4.25926 12.6163 2.75066 11.4357 2.23111 9.81274C2.47981 9.85991 2.73636 9.88635 2.99864 9.88635C3.37096 9.88635 3.73257 9.83776 4.07489 9.74414C2.20681 9.36967 0.799684 7.71956 0.799684 5.74C0.799684 5.72285 0.799684 5.70498 0.800399 5.68855C1.35067 5.9937 1.98027 6.17808 2.64918 6.1988C1.55435 5.46772 0.833272 4.2171 0.833272 2.80068C0.833272 2.05174 1.03409 1.34996 1.38569 0.746801C3.39884 3.21803 6.4089 4.84313 9.80202 5.01464C9.73199 4.7152 9.69697 4.40434 9.69697 4.08346C9.69697 1.82877 11.525 0 13.7797 0C14.9546 0 16.0144 0.495961 16.7605 1.28921C17.6917 1.10627 18.5635 0.767525 19.3546 0.298006C19.0473 1.25205 18.402 2.05174 17.5566 2.5577C18.3834 2.45908 19.1724 2.2404 19.9021 1.91524C19.3575 2.73279 18.665 3.45243 17.8668 4.02629Z" fill="white"/>
                                </svg>
                            </div>
                            Connect with Twitter
                        </div>
                    </div>
                    <div className="flex w-full mt-1.5 button socials google" onClick={() => handleSocialAuth('google')}>
                        <div className="button__inner">
                            <div className="absolute left-3">
                                <svg width="22" height="23" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21.5774 11.2707C21.5774 10.545 21.5131 9.85611 21.4029 9.18555H11.0229V13.3283H16.9661C16.6998 14.6878 15.919 15.8361 14.7616 16.6168V19.3726H18.3073C20.3833 17.4527 21.5774 14.6235 21.5774 11.2707Z" fill="#4285F4"/>
                                    <path d="M11.023 22.0459C13.9992 22.0459 16.4886 21.0538 18.3074 19.3728L14.7616 16.6171C13.7696 17.2784 12.5111 17.6826 11.023 17.6826C8.14788 17.6826 5.71365 15.7444 4.841 13.1265H1.18506V15.9649C2.99466 19.5657 6.7149 22.0459 11.023 22.0459Z" fill="#34A853"/>
                                    <path d="M4.84091 13.1265C4.61126 12.4652 4.49184 11.7579 4.49184 11.023C4.49184 10.2881 4.62045 9.58084 4.84091 8.91946V6.08105H1.18496C0.431731 7.56915 0 9.24096 0 11.023C0 12.805 0.431731 14.4769 1.18496 15.965L4.84091 13.1265Z" fill="#FBBC05"/>
                                    <path d="M11.023 4.36325C12.6489 4.36325 14.1003 4.92358 15.2485 6.01669L18.39 2.87515C16.4886 1.09311 13.9992 0 11.023 0C6.7149 0 2.99466 2.48016 1.18506 6.08099L4.841 8.91939C5.71365 6.30145 8.14788 4.36325 11.023 4.36325Z" fill="#EA4335"/>
                                </svg>
                            </div>
                            Connect with Google
                        </div>
                    </div>
                </div>
            </div>
        );
    }, [handleSocialAuth]);

    return (
        <DuckiesModalWindow
            bodyContent={renderModalBody}
            headerContent="Connect social"
            isOpen={isOpenModal}
            setIsOpen={setIsOpenModal}
        />
    );
};
