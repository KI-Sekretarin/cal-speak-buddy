
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function fixStoragePolicy() {
    const bucketName = 'logos';

    // 1. Create a policy to allow authenticated uploads
    const { error: uploadPolicyError } = await supabase.rpc('sql', {
        q: `
        CREATE POLICY "Allow authenticated uploads"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK ( bucket_id = '${bucketName}' );
        `
    });

    if (uploadPolicyError) console.log('Upload policy might already exist or RPC failed:', uploadPolicyError.message);
    else console.log('Upload policy created.');

    // 2. Create a policy to allow public read access
    const { error: selectPolicyError } = await supabase.rpc('sql', {
        q: `
        CREATE POLICY "Allow public select"
        ON storage.objects FOR SELECT
        TO public
        USING ( bucket_id = '${bucketName}' );
        `
    });

    if (selectPolicyError) console.log('Select policy might already exist or RPC failed:', selectPolicyError.message);
    else console.log('Select policy created.');

    // 3. Create a policy to allow owners to update/delete
    const { error: updatePolicyError } = await supabase.rpc('sql', {
        q: `
        CREATE POLICY "Allow owner update"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING ( bucket_id = '${bucketName}' AND owner = auth.uid() );

        CREATE POLICY "Allow owner delete"
        ON storage.objects FOR DELETE
        TO authenticated
        USING ( bucket_id = '${bucketName}' AND owner = auth.uid() );
        `
    });

    if (updatePolicyError) console.log('Update/Delete policy might already exist or RPC failed:', updatePolicyError.message);
    else console.log('Update/Delete policy created.');
}

fixStoragePolicy();
