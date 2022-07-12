import { NextApiRequest } from 'next';
import { twilioClient } from '../../../lib/TwilioConnector';
import { supabase } from '../../../lib/SupabaseConnector';

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
) {
    const recipientPhoneNumber = req.body.phoneNumber;
    const recipientAddress = req.body.address;

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
    } catch {}
}
