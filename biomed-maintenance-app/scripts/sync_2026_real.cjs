const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const supabaseUrl = 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODIzNTksImV4cCI6MjA5MDQ1ODM1OX0.gQockW2pLcQiJ4xGX5WL6OL5mWFI9LqBQAEODN1kkZI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const monthsNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

async function updateFromMonthlyReports() {
    console.log('🔄 REFRESCANDO CRONOGRAMA 2026 DESDE REPORTES MENSUALES...');

    // 1. Obtener todos los equipos (Paginado)
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

    for (let mIdx = 0; mIdx < 12; mIdx++) {
        const monthNum = mIdx + 1;
        const fileName = `../Mantenimientos/${monthNum}. Preventivo ${monthsNames[mIdx]} 2026.xlsx`;
        
        try {
            console.log(`\n📂 Procesando: ${fileName} (Limpiando base anterior)...`);
            
            // Borrar lo previo de este mes para evitar duplicados y desajustes de base
            await supabase.from('maintenance_plans').delete().eq('year', 2026).eq('month', monthNum);

            const workbook = xlsx.readFile(fileName);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = xlsx.utils.sheet_to_json(sheet, {header: 1});

            const tasksToInsert = [];

            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                if (!row || !row[4]) continue;

                const idUnico = String(row[4]).trim();
                if (idUnico === 'CODIGO EQUIPO' || idUnico === 'undefined' || idUnico === 'CODIGO') continue;

                const eqId = equipmentMap.get(idUnico);
                if (eqId) {
                    const statusEjecucion = String(row[9] || '').trim().toUpperCase();
                    const isDone = statusEjecucion === 'EJECUTADO' || statusEjecucion === 'EJECUTADO ';
                    
                    tasksToInsert.push({
                        equipment_id: eqId,
                        id_unico: idUnico,
                        year: 2026,
                        month: monthNum,
                        periodicidad: 'ANUAL',
                        status: isDone ? 'COMPLETED' : 'PENDING'
                    });
                }
            }

            if (tasksToInsert.length > 0) {
                console.log(`📊 Mes ${monthNum}: ${tasksToInsert.length} totales detectados.`);
                const chunkSize = 100;
                for (let i = 0; i < tasksToInsert.length; i += chunkSize) {
                    await supabase.from('maintenance_plans').insert(tasksToInsert.slice(i, i + chunkSize));
                }
                const doneCount = tasksToInsert.filter(t => t.status === 'COMPLETED').length;
                console.log(`✅ Mes ${monthNum}: ${doneCount} / ${tasksToInsert.length} (${((doneCount/tasksToInsert.length)*100).toFixed(2)}%)`);
            }

        } catch (err) {
            console.error(`⚠️ No se pudo procesar el mes ${monthNum}:`, err.message);
        }
    }
    console.log('\n🌟 SINCRONIZACIÓN DEFINITIVA 2026 COMPLETADA.');
}

updateFromMonthlyReports();
