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
    console.log("🔍 Buscando fantasmas con .0...");
    const { data, error } = await supabase
        .from('equipments')
        .select('id, id_unico, numero_serie');
    
    if (error) throw error;

    const toDelete = data.filter(e => 
        String(e.id_unico || '').endsWith('.0') || 
        String(e.numero_serie || '').endsWith('.0')
    ).map(e => e.id);

    if (toDelete.length > 0) {
        console.log(`🗑️ Purgando ${toDelete.length} registros con formato .0...`);
        for (let i = 0; i < toDelete.length; i += 50) {
            await supabase.from('equipments').delete().in('id', toDelete.slice(i, i + 50));
        }
        console.log("✅ Purga completa.");
    }

    // RE-SYNC with Deduplication
    console.log("📡 Resincronizando datos limpios...");
    const csvContent = fs.readFileSync('master_inventory_bombs_final_431.csv', 'utf8');
    const lines = csvContent.split('\n').filter(l => l.trim());
    
    const uniqueMap = new Map();
    lines.slice(1).forEach(l => {
        const p = l.split(',');
        const s = String(p[0] || '').trim();
        const idu = String(p[1] || '').trim() || s;
        if (!idu) return;

        uniqueMap.set(idu, {
            numero_serie: s,
            id_unico: idu,
            equipo: p[2] || 'BOMBA DE INFUSIÓN',
            marca: p[3] || 'ICU MEDICAL',
            modelo: p[4] || 'N/A',
            servicio: p[5] || 'N/A',
            ubicacion: p[7] || 'N/A',
            estado: 'BUENO',
            riesgo: 'IIb',
            propietario: 'HUSJ (COMODATO)'
        });
    });

    const records = Array.from(uniqueMap.values());
    console.log(`📊 Registros únicos para subir: ${records.length}`);

    for (let i = 0; i < records.length; i += 50) {
        const chunk = records.slice(i, i + 50);
        const { error: upError } = await supabase.from('equipments').upsert(chunk, { onConflict: 'id_unico' });
        if (upError) {
            console.error(`❌ Error upsert en bloque ${i}:`, upError.message);
        } else {
            process.stdout.write('.');
        }
    }
    console.log("\n✨ Sincronización final COMPLETADA sin duplicados ni .0.");
}

fix().catch(console.error);
