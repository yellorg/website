import React from 'react';
import { supabaseLogout } from '../lib/SupabaseConnector';
import { useEagerConnect } from './useEagerConnect';
import useMetaMask from './useMetaMask';
import useWallet from './useWallet';
import jwt from 'jsonwebtoken';

const saveAddressToDB = async (address: string) => {
    await fetch('/api/private/users/socials/saveAddress', {
        method: 'POST',
        body: jwt.sign({
            address,
        }, process.env.NEXT_PUBLIC_JWT_PRIVATE_KEY || ''),
    });
};

const saveEmailToDB = async (email: string, address: string) => {
    await fetch('/api/private/users/socials/saveEmail', {
        method: 'POST',
        body: jwt.sign({
            email,
            address,
        }, process.env.NEXT_PUBLIC_JWT_PRIVATE_KEY || ''),
    });
};

export default function useSocialConnections(supabaseUser: any) {
    const [sessionAccount, setSessionAccount] = React.useState<string>('');
    const [userEmail, setUserEmail] = React.useState<string>(supabaseUser?.email || '');

    const { active, account } = useWallet();
    const { supportedChain } = useMetaMask();
    const triedToEagerConnect = useEagerConnect();

    const isReady = React.useMemo(() => {
        return supportedChain && triedToEagerConnect && active && account;
    }, [supportedChain, triedToEagerConnect, active, account]);

    React.useEffect(() => {
        setUserEmail(supabaseUser?.email);
    }, [supabaseUser?.email]);

    React.useEffect(() => {
        if (isReady && account) {
            saveAddressToDB(account);
        }
    }, [isReady, account]);

    React.useEffect(() => {
        if (!sessionAccount) {
            setSessionAccount(account || '');
        } else {
            supabaseLogout();
            setUserEmail('');
            setSessionAccount(account || '');
        }
    }, [account]);

    React.useEffect(() => {
        if (userEmail && sessionAccount) {
            saveEmailToDB(supabaseUser.email, sessionAccount);
        }
    }, [userEmail, sessionAccount]);
}
