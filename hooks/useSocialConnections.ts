import React from 'react';
import { supabase, supabaseLogout } from '../lib/SupabaseConnector';
import { useEagerConnect } from './useEagerConnect';
import useMetaMask from './useMetaMask';
import useWallet from './useWallet';

const saveAddressToDB = async (address: string) => {
    await supabase.from('users').upsert({
        address,
    });
};

const saveEmailToDB = async (email: string, address: string) => {
    await supabase.from('emails').insert({
        email,
        address,
    });

    const { data, count } = await supabase
        .from('emails')
        .select('address', { count: 'exact' })
        .eq('email', email);

    if (count && count > 1) {
        const bannedUsers = data.map((user: any) => {
            return { ...user, state: 'banned' };
        });
        await supabase.from('users').upsert(bannedUsers);
    }
};

export default function useSocialConnections(supabaseUser: any) {
    const [sessionAccount, setSessionAccount] = React.useState<string>('');

    const { active, account } = useWallet();
    const { supportedChain } = useMetaMask();
    const triedToEagerConnect = useEagerConnect();

    const isReady = React.useMemo(() => {
        return supportedChain && triedToEagerConnect && active && account;
    }, [supportedChain, triedToEagerConnect, active, account]);

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
            setSessionAccount(account || '');
        }
    }, [account]);

    React.useEffect(() => {
        if (supabaseUser?.email && account) {
            saveEmailToDB(supabaseUser.email, account);
        }
    }, [supabaseUser, account]);
}
