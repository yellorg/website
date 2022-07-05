import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jptvfzirhwhjglpmncxu.supabase.co';
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwdHZmemlyaHdoamdscG1uY3h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTYzMTg2MjEsImV4cCI6MTk3MTg5NDYyMX0.8I6K5nQ2wPvw3-RqbrXovNrMYiKfCxYNUFLaB4Oe8bg';

console.log('process.env.NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// @ts-ignore
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const loginWithProvider = async (provider: string) => {
    await supabase.auth.signIn({
        provider: provider as any,
    }, {
        redirectTo: 'https://www.yellow-org.uat.opendax.app/duckies',
    });
};

export const supabaseLogout = async () => {
    const { error } = await supabase.auth.signOut();

    console.log(error);
};
