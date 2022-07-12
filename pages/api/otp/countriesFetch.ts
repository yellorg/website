import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/SupabaseConnector';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { data, error } = await supabase.from('country_codes').select();

    if (error) {
        return res.status(500);
    }

    res.status(200).json({ countries: data });
}
