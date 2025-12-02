
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function setupStorage() {
    const bucketName = 'logos';

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('Error listing buckets:', listError);
        return;
    }

    const bucketExists = buckets?.find(b => b.name === bucketName);

    if (bucketExists) {
        console.log(`Bucket '${bucketName}' already exists.`);

        // Update to public if not already (though createBucket has public option, update might be needed)
        const { data, error } = await supabase.storage.updateBucket(bucketName, {
            public: true,
            fileSizeLimit: 2097152, // 2MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
        });

        if (error) console.error('Error updating bucket:', error);
        else console.log(`Bucket '${bucketName}' updated to be public.`);

    } else {
        console.log(`Creating bucket '${bucketName}'...`);
        const { data, error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 2097152, // 2MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
        });

        if (error) {
            console.error('Error creating bucket:', error);
        } else {
            console.log(`Bucket '${bucketName}' created successfully.`);
        }
    }
}

setupStorage();
