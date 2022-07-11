import { NextApiRequest } from 'next';
import { twilioClient } from '../../../lib/TwilioConnector';
import { supabase } from '../../../lib/SupabaseConnector';

function generateOTP() {
    let otp = '';
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz123456789';

    for ( var i = 0; i < 6; i++ ) {
        otp += characters.charAt(Math.floor(Math.random() * characters.length));
     }
     return otp;
}


export default async function handler(
    req: NextApiRequest,
) {
    const recipientPhoneNumber = '+' + req.body.phoneNumber;
    const otp = generateOTP();
  
    const message = `Yellow DUCKZ\nYour verification code is: ${otp}`;

    try {
        await twilioClient.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: recipientPhoneNumber,
            body: message,
        });
        await supabase.from('otp').upsert({
            phone_number: recipientPhoneNumber,
            otp,
        });
    } catch {}
}
