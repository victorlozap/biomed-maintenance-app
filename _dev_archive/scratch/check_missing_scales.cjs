const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '..', '.env');
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

async function checkMissing() {
    const ids = ['570861', '570863'];
    const { data, error } = await supabase
        .from('equipments')
        .select('id_unico, equipo')
        .in('id_unico', ids);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Found in Supabase:', data);
    const missing = ids.filter(id => !data.find(d => d.id_unico === id));
    console.log('Missing from Supabase:', missing);
}

checkMissing();
