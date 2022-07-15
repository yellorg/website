import React from 'react';
import { useAppSelector } from '../app/hooks';
import useDuckiesContract from './useDuckiesContract';
import useWallet from './useWallet';

export default function useDuckiesBalance() {
    const duckiesContract = useDuckiesContract();
    const isRewardsClaimProcessing = useAppSelector(state => state.globals.isRewardsClaimProcessing);
    const { account } = useWallet();

    const [balance, setBalance] = React.useState<number | undefined>(undefined);

    const getBalance = React.useCallback(async() => {
        if (account && !isRewardsClaimProcessing) {
            const balance = (await duckiesContract?.balanceOf(account).catch((error: any) => {
                console.error(error);
                return '0';
            })).toString();
            const decimals = await duckiesContract?.decimals().catch((error: any) => {
                console.error(error);
                return '2';
            });
            setBalance(balance / (10 ** decimals));
        }
    }, [account, duckiesContract, isRewardsClaimProcessing]);

    React.useEffect(() => {
        getBalance();
    }, [getBalance]);

    return balance;
}
