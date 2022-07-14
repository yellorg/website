import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/SupabaseConnector';
import jwt from 'jsonwebtoken';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const props = JSON.parse(req.body);
    const userAddress = props.address;

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
