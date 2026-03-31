const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const supabaseUrl = 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODIzNTksImV4cCI6MjA5MDQ1ODM1OX0.gQockW2pLcQiJ4xGX5WL6OL5mWFI9LqBQAEODN1kkZI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function synchronize() {
    console.log('🔄 INICIANDO CARGA COMPLETA Y LIMPIA DEL CRONOGRAMA 2025...');
    
    // 0. Limpiar tabla previa para evitar duplicados
    console.log('🗑️ Limpiando datos previos de mantenimiento...');
    const { error: deleteError } = await supabase
        .from('maintenance_plans')
        .delete()
        .neq('id_unico', 'ZZZ_DUMMY_ZZZ'); // Borra todo de forma segura
    
    if (deleteError) console.error('⚠️ Advertencia al limpiar:', deleteError.message);

    const workbook = xlsx.readFile('../formatos/GRF3MAN-FR57 VERSION 10 CRONOGRAMA DE MANTENIMIENTO DE EQUIPO BIOMEDICO 2025.xlsx');
    const sheet = workbook.Sheets['CRONOGRAMA MTTO'];
    const data = xlsx.utils.sheet_to_json(sheet, {header: 1});

    // 1. Obtener TODOS los equipos usando paginación (3000 registros approx)
    console.log('📥 Obteniendo mapa completo de equipos (paginado)...');
    let allEquipments = [];
    let from = 0;
    const pageSize = 1000;
    
    while (true) {
        const { data: page, error } = await supabase
            .from('equipments')
            .select('id, id_unico')
            .range(from, from + pageSize - 1);
        
        if (error) {
            console.error('❌ Error al paginar equipos:', error.message);
            break;
        }
        
        if (!page || page.length === 0) break;
        
        allEquipments = allEquipments.concat(page);
        console.log(`... Cargados ${allEquipments.length} equipos`);
        from += pageSize;
    }

    const equipmentMap = new Map();
    allEquipments.forEach(e => {
        if (e.id_unico) equipmentMap.set(String(e.id_unico).trim(), e.id);
    });

    const tasksToInsert = [];
    let skipCount = 0;
    let emptyRows = 0;

    // 2. Procesar el Excel y preparar el lote
    console.log('⚡ Procesando filas del Excel y cruzando datos...');
    for (let i = 6; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0 || !row[0]) {
            emptyRows++;
            continue;
        }

        const idUnico = String(row[4] || '').trim();
        const periodicidad = row[8] || 'NO ASIGNADA';

        if (!idUnico || idUnico === '' || idUnico === 'undefined' || idUnico === '-') {
            skipCount++;
            continue;
        }

        const equipmentId = equipmentMap.get(idUnico);

        if (equipmentId) {
            for (let mIdx = 0; mIdx < 12; mIdx++) {
                const hasMaintenance = String(row[11 + mIdx] || '').toUpperCase() === 'X';
                
                if (hasMaintenance) {
                    tasksToInsert.push({
                        equipment_id: equipmentId,
                        id_unico: idUnico,
                        year: 2025,
                        month: mIdx + 1,
                        periodicidad: periodicidad,
                        status: 'PENDING'
                    });
                }
            }
        } else {
            skipCount++;
        }
    }

    // 3. Inserción masiva por lotes de 100
    console.log(`📦 Insertando ${tasksToInsert.length} tareas programadas en bloques de 100...`);
    const chunkSize = 100;
    let successCount = 0;

    for (let i = 0; i < tasksToInsert.length; i += chunkSize) {
        const chunk = tasksToInsert.slice(i, i + chunkSize);
        const { error: insertError } = await supabase.from('maintenance_plans').insert(chunk);
        
        if (insertError) {
            console.error(`❌ Error en bloque ${i / chunkSize}:`, insertError.message);
        } else {
            successCount += chunk.length;
            if (successCount % 500 === 0) console.log(`... Insertadas ${successCount} de ${tasksToInsert.length} tareas...`);
        }
    }

    console.log('\n--- ✅ SINCRONIZACIÓN DEFINITIVA COMPLETADA ---');
    console.log(`📊 Tareas totales agendadas: ${successCount}`);
    console.log(`⚠️ Equipos no vinculados (No están en inventario): ${skipCount}`);
    console.log(`🗑️ Filas ignoradas (Vacias/Basura): ${emptyRows}`);
    console.log(`✨ Coincidencia lograda: ${((tasksToInsert.length / (tasksToInsert.length + skipCount)) * 100).toFixed(2)}% del cronograma real.`);
    console.log('-----------------------------------------------\n');
}

synchronize();
