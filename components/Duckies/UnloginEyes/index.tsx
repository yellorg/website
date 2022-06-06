import classnames from 'classnames';
import React, { useMemo } from 'react';
import { appConfig } from '../../../config/app';
import { useEagerConnect } from '../../../hooks/useEagerConnect';
import useWallet from '../../../hooks/useWallet';

interface UnloginEyes {
    children: React.ReactNode
    paginationComponent?: React.ReactNode
    isReversed?: boolean
}

const UnloginEyes: React.FC<UnloginEyes> = ({ children, paginationComponent, isReversed }: UnloginEyes) => {
    const { active, account, chain } = useWallet();
    const triedToEagerConnect = useEagerConnect();

    const supportedChain = useMemo(() => {
        return appConfig.blockchain.supportedChainIds.includes(chain?.chainId ?? -1);
    }, [chain]);

    const isReady = useMemo(() => {
        return supportedChain && triedToEagerConnect && active && account;
    }, [supportedChain, triedToEagerConnect, active, account]);

    const rootClassName = classnames('cr-unlogin-content', {
        'cr-unlogin-content--blur': !isReady
    });

    const paginationClassName = classnames('', {
        'cr-unlogin-content--blur': !isReady
    });

    const reversedClassName = classnames('cr-unlogin-eyes', {
        'cr-unlogin-eyes--reversed': isReversed
    });


    return (
        <div className="cr-unlogin">
            <div className={rootClassName}>
                {children}
            </div>
            <div className={paginationClassName}>
                {paginationComponent}
            </div>
            {!isReady ?
                <div className={reversedClassName}>
                    <img src="/images/components/duckies/login_eyes_2.png" alt="login" />
                </div> : <></>
            }
        </div>
    )
};

export default UnloginEyes;
