import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/SupabaseConnector';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const userAddress = req.query.account;

    try {
        const { data } = await supabase
            .from('users')
            .select('phone_number')
            .eq('address', userAddress)
            .single();

        return res.status(200).json({ phoneNumber: data?.phone_number });
    } catch (error) {
        return res.status(400).json({ error });
    }
}
