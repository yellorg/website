import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/SupabaseConnector';
import jwt from 'jsonwebtoken';

const hidePhoneNumber = (phone: string) => {
    return phone.replace(phone.slice(2, -3), (match) => {
        return '*'.repeat(match.length);
    });
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const userAddress = req.query.account;

    const token = jwt.sign({ metamaskAddress: userAddress }, process.env.JWT_SECRET || '');
    supabase.auth.setAuth(token);

    try {
        const { data } = await supabase
            .from('users')
            .select('phone_number')
            .eq('address', userAddress)
            .single();

        return res.status(200).json({ phoneNumber: hidePhoneNumber(data?.phone_number) });
    } catch (error) {
        return res.status(400).json({ error });
    }
}
