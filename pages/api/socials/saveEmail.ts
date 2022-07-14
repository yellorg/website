import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/SupabaseConnector';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const props = JSON.parse(req.body);
    const userEmail = props.email;
    const userAddress = props.address;

    try {
        await supabase.from('emails').insert({
            email: userEmail,
            address: userAddress,
        });

        const { data, count } = await supabase
            .from('emails')
            .select('address', { count: 'exact' })
            .eq('email', userEmail);

        if (count && count > 1) {
            const bannedUsers = data.map((user: any) => {
                return { ...user, state: 'banned' };
            });
            await supabase.from('users').upsert(bannedUsers);
        }

        res.status(200).json({});
    } catch (error) {
        res.status(400).json({ error });
    }
}
