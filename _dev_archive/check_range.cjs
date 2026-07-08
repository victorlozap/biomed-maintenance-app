const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    });
}

const supabaseUrl = process.env.SUPABASE_URL || 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!supabaseKey) throw new Error('VITE_SUPABASE_ANON_KEY is missing. Set it in your .env file.');
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRange() {
    const { data: first } = await supabase.from('equipments').select('id_unico').order('id_unico', { ascending: true }).limit(5);
    const { data: last } = await supabase.from('equipments').select('id_unico').order('id_unico', { ascending: false }).limit(5);

    console.log('First 5 IDs in Supabase:', first.map(i => i.id_unico));
    console.log('Last 5 IDs in Supabase:', last.map(i => i.id_unico));
}

checkRange();
