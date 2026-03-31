const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const supabase = createClient('https://gzdspkhpxkibjxbfdeuc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODIzNTksImV4cCI6MjA5MDQ1ODM1OX0.gQockW2pLcQiJ4xGX5WL6OL5mWFI9LqBQAEODN1kkZI');

async function syncMaster() {
    console.log('🔄 Sincronizando Inventario Maestro HUSJ 2025...');
    const workbook = xlsx.readFile('../Mantenimientos/1. INVENTARIO EQUIPOS MÉDICOS HUSJ 2025.xlsx');
    const data = xlsx.utils.sheet_to_json(workbook.Sheets['INVENTARIO HUSJ (2025)'], {header: 1});

    const equipments = [];
    // Las filas útiles suelen empezar después de los encabezados (aprox fila 12-13)
    for (let i = 2; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 7) continue;

        const id_unico = String(row[6] || '').trim();
        const name = String(row[1] || '').trim();

        if (!id_unico || id_unico === 'ID' || id_unico === 'undefined' || name === '') continue;

        equipments.push({
            id_unico: id_unico,
            equipo: name,
            marca: String(row[3] || '').trim(),
            modelo: String(row[4] || '').trim(),
            numero_serie: String(row[5] || '').trim(),
            servicio: String(row[11] || '').trim(),
            estado: 'ACTIVO'
        });
    }

    console.log(`📦 Preparados ${equipments.length} equipos para Upsert.`);

    // Upsert en bloques de 100 para evitar errores
    for (let i = 0; i < equipments.length; i += 100) {
        const batch = equipments.slice(i, i + 100);
        const { error } = await supabase
            .from('equipments')
            .upsert(batch, { onConflict: 'id_unico' });

        if (error) console.error('❌ Error batch:', error.message);
        else process.stdout.write('.');
    }

    console.log('\n✅ Inventario Maestro Sincronizado.');
}

syncMaster();
