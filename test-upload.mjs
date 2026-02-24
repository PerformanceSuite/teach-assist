import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const fileContent = fs.readFileSync('package.json');

console.log("Attempting upload to 'teacher-photos' bucket...");
const { data, error } = await supabase.storage
    .from('teacher-photos')
    .upload('test_upload.txt', fileContent, { upsert: true });

console.log('Error:', error);
console.log('Data:', data);
