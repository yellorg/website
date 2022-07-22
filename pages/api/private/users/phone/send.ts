import { NextApiRequest, NextApiResponse } from 'next';
import { twilioClient } from '../../../../../lib/TwilioConnector';
import { supabase } from '../../../../../lib/SupabaseConnector';
import jwt from 'jsonwebtoken';
import { withDuckiesSession } from '../../../../../helpers/withDuckiesSession';
import { appConfig } from '../../../../../config/app';

function generateOTP() {
    let otp = '';
    const characters = '0123456789';

    for ( var i = 0; i < 6; i++ ) {
        otp += characters.charAt(Math.floor(Math.random() * characters.length));
     }
     return otp;
}

async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const recipientPhoneNumber = req.body.phoneNumber;
    const recipientAddress = req.body.address;

    const token = jwt.sign({ metamaskAddress: recipientAddress }, process.env.JWT_SECRET || '');
    supabase.auth.setAuth(token);

    const { data: sendedOTP } = await supabase
        .from('otp')
        .select('resendAt')
        .eq('phone_number', recipientPhoneNumber)
        .eq('address', recipientAddress)
        .single();

    if (sendedOTP && new Date(`${sendedOTP.resendAt}Z`) > new Date()) {
        return res.status(406).json({
            error: 'Please wait a bit before resending otp',
            timeLeft: Math.ceil((+new Date(`${sendedOTP.resendAt}Z`) - +new Date()) / 1000),
        });
    }

    const { data } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', recipientPhoneNumber)
        .eq('phone_verified', true)
        .single();

    if (data !== null && data.address !== recipientAddress) {
        return res.status(403).json({ error: 'This phone number is already taken!' });
    }

    const { data: confirmedAddress } = await supabase
        .from('users')
        .select('*')
        .eq('address', recipientAddress)
        .eq('phone_verified', true);

    if (confirmedAddress?.length) {
        return res.status(403).json({ error: 'You have already verified your phone number!' });
    }

    const otp = generateOTP();

    const message = `Yellow DUCKIES\nYour verification code is: ${otp.slice(0,3)} ${otp.slice(3)}`;
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
            address: recipientAddress,
            resendAt: (new Date(Date.now() + appConfig.sendOtpDelay * 1000)).toISOString(),
        }).match({
            phone_number: recipientPhoneNumber,
            address: recipientAddress,
        });
    } catch (error) {
        return res.status(400).json(error);
    }

    res.status(200).json({});
}

export default withDuckiesSession(handler);
