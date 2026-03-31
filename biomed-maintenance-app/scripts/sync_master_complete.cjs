const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const supabase = createClient('https://gzdspkhpxkibjxbfdeuc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODIzNTksImV4cCI6MjA5MDQ1ODM1OX0.gQockW2pLcQiJ4xGX5WL6OL5mWFI9LqBQAEODN1kkZI');

const filePath = '../Mantenimientos/1. INVENTARIO EQUIPOS MÉDICOS HUSJ 2025.xlsx';

async function syncMaster() {
    console.log('🔄 Sincronizando Inventario Maestro HUSJ 2025 (Corregido)...');
    
    try {
        const workbook = xlsx.readFile(filePath);
        const data = xlsx.utils.sheet_to_json(workbook.Sheets['INVENTARIO HUSJ (2025)'], {header: 1});

        const equipments = [];
        console.log(`Total filas en el archivo: ${data.length}`);

        // Iterar todas las filas (empezando desde la 2 para saltar encabezados de arriba)
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length < 6) continue;

            // Filtro para detectar solo filas de equipos reales (ID numérico de 5-6 dígitos)
            const id_unico = String(row[0] || '').trim();
            const name = String(row[1] || '').trim();

            if (!id_unico || isNaN(id_unico) || id_unico.length < 5 || name === '') continue;

            equipments.push({
                id_unico: id_unico,
                equipo: name,
                marca: String(row[3] || '').trim(),
                modelo: String(row[4] || '').trim(),
                numero_serie: String(row[5] || '').trim(),
                servicio: String(row[12] || 'SIN SERVICIO').trim(), // Columna 13 (M) según inspección visual
                estado: 'ACTIVO'
            });
        }

        console.log(`📦 Preparados ${equipments.length} equipos para Upsert.`);

        if (equipments.length === 0) {
            console.error('❌ No se encontraron equipos válidos.');
            return;
        }

        // Upsert en bloques de 100
        for (let i = 0; i < equipments.length; i += 100) {
            const batch = equipments.slice(i, i + 100);
            const { error } = await supabase
                .from('equipments')
                .upsert(batch, { onConflict: 'id_unico' });

            if (error) {
                console.error('\n❌ Error batch:', error.message);
            } else {
                process.stdout.write('.');
            }
        }

        console.log('\n✅ Inventario Maestro Sincronizado Completamente.');
        
        // Verificación rápida de los targets
        const targets = ['544963', '573306', '573307', '573308'];
        const { data: verifyData } = await supabase
            .from('equipments')
            .select('id_unico, equipo')
            .in('id_unico', targets);
            
        console.log('\nResultados de verificación en Supabase:');
        console.table(verifyData);

    } catch (err) {
        console.error('Error crítico:', err.message);
    }
}

syncMaster();
