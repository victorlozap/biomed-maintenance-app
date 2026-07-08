const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const supabaseUrl = 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODIzNTksImV4cCI6MjA5MDQ1ODM1OX0.gQockW2pLcQiJ4xGX5WL6OL5mWFI9LqBQAEODN1kkZI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function sync2026() {
    console.log('🔄 INICIANDO CARGA CRONOGRAMA 2026...');
    const workbook = xlsx.readFile('../Mantenimientos/CRONOGRAMA MTTO 2026.xlsx');
    const sheet = workbook.Sheets['PREVENTIVO 2026'];
    const data = xlsx.utils.sheet_to_json(sheet, {header: 1});

    // 1. Mapa de equipos (Paginado)
    let allEquipments = [];
    let from = 0;
    while (true) {
        const { data: page, error } = await supabase.from('equipments').select('id, id_unico').range(from, from + 999);
        if (error || !page || page.length === 0) break;
        allEquipments = allEquipments.concat(page);
        from += 1000;
    }
    const equipmentMap = new Map();
    allEquipments.forEach(e => {
        if (e.id_unico) equipmentMap.set(String(e.id_unico).trim(), e.id);
    });

    const tasks = [];
    console.log(`🗺️ Iniciando cruce de ${data.length} filas con ${equipmentMap.size} equipos en mapa...`);
    
    // 2. Procesar (Datos reales desde fila 2)
    for (let i = 2; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[0]) continue;

        const idUnico = String(row[4] || '').trim();
        const periodicidad = row[9] || 'ANUAL';
        if (!idUnico || idUnico === 'undefined' || idUnico === '') continue;

        const eqId = equipmentMap.get(idUnico);
        
        if (i < 10) console.log(`Fila ${i}: ID ${idUnico} -> Encontrado: ${!!eqId}`);

        if (eqId) {
            for (let mIdx = 0; mIdx < 12; mIdx++) {
                // Mes m está en columna 11 + (mIdx*2)
                const colIdx = 11 + (mIdx * 2);
                const val = String(row[colIdx] || '').toUpperCase();
                const hasMaintenance = val.includes('X');
                
                if (hasMaintenance) {
                    tasks.push({
                        equipment_id: eqId,
                        id_unico: idUnico,
                        year: 2026,
                        month: mIdx + 1,
                        periodicidad: periodicidad,
                        status: 'PENDING'
                    });
                }
            }
        }
    }

    console.log(`📦 Insertando ${tasks.length} tareas para el 2026...`);
    const chunkSize = 100;
    for (let i = 0; i < tasks.length; i += chunkSize) {
        await supabase.from('maintenance_plans').insert(tasks.slice(i, i + chunkSize));
    }
    console.log('✅ Cronograma 2026 sincronizado.');
}

sync2026();
