import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../../lib/SupabaseConnector';
import jwt from 'jsonwebtoken';
import { withDuckiesSession } from '../../../../../helpers/withDuckiesSession';

async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const userEmail = req.body.email;
    const userAddress = req.body.address;

    const token = jwt.sign({ metamaskAddress: userAddress }, process.env.JWT_SECRET || '');
    supabase.auth.setAuth(token);

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

export default withDuckiesSession(handler);
