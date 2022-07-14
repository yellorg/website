import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/SupabaseConnector';
import jwt from 'jsonwebtoken';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const props = JSON.parse(req.body);
    const recipientPhoneNumber = props.phoneNumber;
    const recipientOTP = props.otp;
    const recipientAddress = props.address;

    const token = jwt.sign({ metamaskAddress: recipientAddress }, process.env.JWT_SECRET);
    supabase.auth.setAuth(token);

    const { count } = await supabase
        .from('otp')
        .select('*', { count: 'exact', head: true })
        .eq('phone_number', recipientPhoneNumber)
        .eq('otp', recipientOTP);

    if (count && count != 0) {
        await supabase.from('otp').delete()
            .match({
                phone_number: recipientPhoneNumber,
                otp: recipientOTP,
            });
        
        await supabase.from('users')
            .update({
                phone_verified: true,
            })
            .match({
                address: recipientAddress,
                phone_number: recipientPhoneNumber,
            });

        return res.status(200).json({ success: true });
    }

    res.status(200).json({ success: false });
}
