import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw';
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
