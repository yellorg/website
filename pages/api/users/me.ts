import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/SupabaseConnector';
import jwt from 'jsonwebtoken';
import { withDuckiesSession } from '../../../helpers/withDuckiesSession';

async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const userAddress = req.body.account;

    const token = jwt.sign({ metamaskAddress: userAddress }, process.env.JWT_SECRET || '');
    supabase.auth.setAuth(token);

    try {
        let { data } = await supabase
            .from('users')
            .select('state')
            .eq('address', userAddress)
            .single();

        return res.status(200).json({ userStatus: data?.state });
    } catch (error) {
        return res.status(400).json({ error });
    }
}

export default withDuckiesSession(handler);
