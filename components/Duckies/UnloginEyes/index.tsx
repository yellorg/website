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

    const rootClassName = classnames('relative flex flex-col justify-between h-[89%]', {
        'blur-[5px]': !isReady
    });

    const paginationClassName = classnames('', {
        'blur-[5px]': !isReady
    });

    const reversedClassName = classnames('absolute flex items-center justify-center w-full h-full top-[-50px]', {
        'rotate-y-180': isReversed
    });


    return (
        <div className="relative flex flex-col justify-between h-[89%]">
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
