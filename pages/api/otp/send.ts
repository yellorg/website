import { NextApiRequest, NextApiResponse } from 'next';
import { twilioClient } from '../../../lib/TwilioConnector';
import { supabase } from '../../../lib/SupabaseConnector';
import jwt from 'jsonwebtoken';

function generateOTP() {
    let otp = '';
    const characters = '0123456789';

    for ( var i = 0; i < 6; i++ ) {
        otp += characters.charAt(Math.floor(Math.random() * characters.length));
     }
     return otp;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const props = JSON.parse(req.body);
    const recipientPhoneNumber = props.phoneNumber;
    const recipientAddress = props.address;

    const token = jwt.sign({ metamaskAddress: recipientAddress }, process.env.JWT_SECRET || '');
    supabase.auth.setAuth(token);

    const { data } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', recipientPhoneNumber)
        .eq('phone_verified', true)
        .single();

    if (data !== null && data.address !== recipientAddress) {
        return res.status(403).json({ error: 'This phone number is already taken!' });
    }

    const otp = generateOTP();

    const message = `Yellow DUCKZ\nYour verification code is: ${otp.slice(0,3)} ${otp.slice(3)}`;
    try {
        await twilioClient.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: recipientPhoneNumber,
            body: message,
        });

        await supabase.from('users').upsert({
            address: recipientAddress,
            phone_number: recipientPhoneNumber,
        });

        await supabase.from('otp').upsert({
            phone_number: recipientPhoneNumber,
            otp,
        });
    } catch (error) {
        return res.status(400).json(error);
    }

    res.status(200).json({});
}
