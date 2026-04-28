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

async function checkIndex() {
    // Fetch all IDs, ordered by id_unico ascending
    let allIds = [];
    let from = 0;
    while (true) {
        const { data, error } = await supabase.from('equipments').select('id_unico').order('id_unico', { ascending: true }).range(from, from + 999);
        if (error || !data || data.length === 0) break;
        allIds = allIds.concat(data.map(i => i.id_unico));
        from += 1000;
    }

    const testId = '573317';
    const index = allIds.indexOf(testId);
    console.log(`Index of ${testId} in sorted list: ${index}`);
    console.log(`Total IDs: ${allIds.length}`);
}

checkIndex();
