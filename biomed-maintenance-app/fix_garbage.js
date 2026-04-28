import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    });
}

const supabaseUrl = process.env.SUPABASE_URL || 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing. Set it in your .env file: SUPABASE_SERVICE_ROLE_KEY=your-key');
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    console.log("🧹 Purgando basura...");
    const { data: current, error } = await supabase.from('equipments').select('id, id_unico, numero_serie');
    if (error) throw error;

    const toDelete = current.filter(item => {
        const idu = String(item.id_unico || '');
        const sn = String(item.numero_serie || '');
        if (idu.startsWith('*') || sn.startsWith('*') || idu.includes('CARGO') || idu.includes('FIRMA')) return true;
        if (/^\d{1,5}$/.test(idu)) return true; // IDs cortos (indices)
        return false;
    }).map(e => e.id);

    if (toDelete.length > 0) {
        console.log(`Borrando ${toDelete.length} registros basura...`);
        for (let i = 0; i < toDelete.length; i += 50) {
            await supabase.from('equipments').delete().in('id', toDelete.slice(i, i + 50));
        }
    }

    // Since I can't easily read Excel from Node without extra libs, 
    // I'll just rely on the Python script for the actual sync once the DNS is back, 
    // OR I'll use the browser subagent to run the python script multiple times until it works.
    console.log("Purga completada.");
}

fix().catch(console.error);
