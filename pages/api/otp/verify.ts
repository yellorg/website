import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/SupabaseConnector';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const recipientPhoneNumber = req.body.phoneNumber;
    const recipientOTP = req.body.otp;

    console.log(recipientPhoneNumber, recipientOTP)

    const { count } = await supabase
        .from('otp')
        .select('*', { count: 'exact', head: true })
        .eq('phone_number', recipientPhoneNumber)
        .eq('otp', recipientOTP);


    if (count && count != 0) {
        return res.status(200).json({ success: true });
    }

    res.status(200).json({ success: false });
}
