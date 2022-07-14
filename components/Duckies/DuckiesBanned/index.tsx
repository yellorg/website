import React from 'react';
import { useRouter } from 'next/router';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import useMetaMask from '../../../hooks/useMetaMask';

export const DuckiesBanned = () => {
    const { handleDisconnect } = useMetaMask();
    const router = useRouter();

    const handleLogout = React.useCallback(() => {
        handleDisconnect();
        router.reload();
    }, []);

    return(
        <div className="flex bg-primary-cta-color-60 justify-center">
            <div className="flex flex-col w-[35rem] items-center my-20">
                <LazyLoadImage
                    srcSet="/images/components/duckies/duckMafia.png"
                    width={375}
                    height={375}
                />
                <h1 className="text-center text-5xl text-color-100">Your account has been banned..</h1>
                <h3 className="text-center text-base text-color-100">...Due to your activity.</h3>
                <div onClick={handleLogout} className="text-center button button--outline button--secondary button--shadow-secondary">
                    <span className="button__inner !py-[6px] !px-[18px] !justify-center">Logout</span>
                </div>
            </div>
        </div>
    );
}
