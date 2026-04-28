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

const idsToFind = ['544963', '573306', '573307', '573308', '573309', '573310', '573311', '573313', '573314', '573315', '573316', '573318', '573319', '573312', '573317'];

async function checkSupabase() {
    console.log('--- CHECKING SUPABASE ---');
    const { data, error } = await supabase
        .from('equipments')
        .select('id_unico, equipo, marca, modelo')
        .in('id_unico', idsToFind);

    if (error) {
        console.error('Error fetching from Supabase:', error);
        return;
    }

    console.log(`Found ${data.length} out of ${idsToFind.length} in Supabase:`);
    data.forEach(item => {
        console.log(` - ID: ${item.id_unico}, Equipo: ${item.equipo}`);
    });

    const missingIds = idsToFind.filter(id => !data.find(item => item.id_unico === id));
    console.log('Missing IDs:', missingIds);
}

checkSupabase();
