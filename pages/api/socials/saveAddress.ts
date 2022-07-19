import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/SupabaseConnector';
import jwt from 'jsonwebtoken';
import { withDuckiesSession } from '../../../helpers/withDuckiesSession';

async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const userAddress = req.body.address;

    const token = jwt.sign({ metamaskAddress: userAddress }, process.env.JWT_SECRET || '');
    supabase.auth.setAuth(token);

    try {
        await supabase.from('users').upsert({
            address: userAddress,
        });
        res.status(200).json({});
    } catch (error) {
        res.status(400).json({ error });
    }
}

export default withDuckiesSession(handler);
