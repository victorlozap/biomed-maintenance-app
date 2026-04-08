import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function clean() {
    console.log("🔥 INICIANDO PURGA AGRESIVA (CON QUERY)...");
    
    // 1. Borrar por patrón de texto
    const { data: b1, error: e1 } = await supabase.from('equipments').select('id').or('id_unico.ilike.*Cargo*,id_unico.ilike.*Firma*,numero_serie.ilike.*Cargo*,numero_serie.ilike.*Firma*,id_unico.ilike.*%*,id_unico.ilike.**%*');
    // Nota: el filtro de wildcard en Supabase es %
    
    const b1_ids = b1?.map(x => x.id) || [];
    console.log(`Detectados ${b1_ids.length} registros con texto de firma/asterisco.`);

    // 2. Borrar por ID corto (fuerza bruta: traemos todo y filtramos localmente con paginación)
    let allIds = [];
    let from = 0;
    let step = 1000;
    let finished = false;
    
    while (!finished) {
        const { data, error } = await supabase.from('equipments').select('id, id_unico').range(from, from + step - 1);
        if (error) break;
        if (data.length < step) finished = true;
        allIds = allIds.concat(data);
        from += step;
    }
    
    const b2_ids = allIds.filter(e => {
        const idu = String(e.id_unico || '');
        // Si es un número de menos de 6 dígitos
        return /^\d{1,5}$/.test(idu);
    }).map(e => e.id);
    
    console.log(`Detectados ${b2_ids.length} registros con ID numérico corto (basura).`);

    const finalDelete = Array.from(new Set([...b1_ids, ...b2_ids]));
    
    if (finalDelete.length > 0) {
        console.log(`🧨 Eliminando ${finalDelete.length} registros en total...`);
        for (let i = 0; i < finalDelete.length; i += 50) {
            await supabase.from('equipments').delete().in('id', finalDelete.slice(i, i + 50));
        }
        console.log("✅ Limpieza completada.");
    } else {
        console.log("✅ Nada para borrar.");
    }
}

clean().catch(console.error);
