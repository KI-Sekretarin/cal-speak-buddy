
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function check() {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (error) {
        console.error(error);
        return;
    }

    if (profiles && profiles.length > 0) {
        console.log('Profile keys:', Object.keys(profiles[0]));
    } else {
        console.log('No profiles found');
    }
}

check();
