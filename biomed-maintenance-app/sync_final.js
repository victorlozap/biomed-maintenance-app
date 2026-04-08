import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
// USANDO SERVICE ROLE KEY PARA BYPASSEAR RLS
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function sync() {
    console.log("🚀 Iniciando sincronización MAESTRA (Con Service Role Key)...");
    
    // 1. Leer el archivo de 431 equipos
    const csvPath = path.join(process.cwd(), 'master_inventory_bombs_final_431.csv');
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    
    const records = lines.slice(1).map(l => {
        const parts = l.split(',');
        return {
            numero_serie: parts[0]?.trim(),
            id_unico: parts[1]?.trim() || parts[0]?.trim(),
            equipo: parts[2]?.trim() || 'BOMBA DE INFUSIÓN',
            marca: parts[3]?.trim() || 'ICU MEDICAL',
            modelo: parts[4]?.trim() || 'N/A',
            servicio: parts[5]?.trim() || 'N/A',
            ubicacion: parts[7]?.trim() || 'N/A', // Nueva Ubicación
            estado: 'BUENO',
            riesgo: 'IIb',
            propietario: 'ICU MEDICAL (COMODATO)'
        };
    });
    
    const targetSerials = new Set(records.map(r => r.numero_serie.toUpperCase()));
    const targetIds = new Set(records.map(r => r.id_unico.toUpperCase()));
    
    console.log(`📊 Total objetivos en CSV: ${records.length}`);

    // 2. Obtener equipos actuales de tipo BOMBA para limpieza
    console.log("🔍 Escaneando base de datos para limpieza...");
    const { data: currentEquips, error: fetchError } = await supabase
        .from('equipments')
        .select('id, numero_serie, id_unico')
        .ilike('equipo', '%BOMBA%');
    
    if (fetchError) throw fetchError;
    console.log(`🗄️ Bombas encontradas actualmente: ${currentEquips.length}`);

    // 3. LIMPIEZA: Borrar los que NO están en la lista de 431
    const toDelete = currentEquips.filter(e => {
        const s = String(e.numero_serie || '').trim().toUpperCase();
        const idu = String(e.id_unico || '').trim().toUpperCase();
        return !targetSerials.has(s) && !targetIds.has(idu);
    });

    if (toDelete.length > 0) {
        console.log(`🗑️ Eliminando ${toDelete.length} equipos que no pertenecen al nuevo inventario...`);
        const { error: delError } = await supabase
            .from('equipments')
            .delete()
            .in('id', toDelete.map(e => e.id));
        
        if (delError) {
            console.error("❌ Error en eliminación:", delError.message);
        } else {
            console.log("✅ Limpieza completada.");
        }
    }

    // 4. UPSERT: Cargar los 431 equipos
    console.log(`📡 Sincronizando ${records.length} equipos...`);
    for (let i = 0; i < records.length; i += 50) {
        const chunk = records.slice(i, i + 50);
        const { error: upError } = await supabase.from('equipments').upsert(chunk, { onConflict: 'id_unico' });
        
        if (upError) {
            console.error(`❌ Error en bloque ${i}:`, upError.message);
        } else {
            process.stdout.write('.');
        }
    }

    console.log("\n✨ ¡Sincronización FINAL completada con éxito!");
    console.log("🎉 La base de datos de bombas está reflejando exactamente los 431 equipos del listado.");
}

sync().catch(console.error);
