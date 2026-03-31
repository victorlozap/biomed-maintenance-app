const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const supabaseUrl = 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODIzNTksImV4cCI6MjA5MDQ1ODM1OX0.gQockW2pLcQiJ4xGX5WL6OL5mWFI9LqBQAEODN1kkZI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const monthsNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

async function updateRealExecution() {
    console.log('📈 INICIANDO CONCILIACIÓN DE EJECUCIÓN REAL 2026...');

    for (let mIdx = 0; mIdx < 12; mIdx++) {
        const monthNum = mIdx + 1;
        const fileName = `../Mantenimientos/${monthNum}. Preventivo ${monthsNames[mIdx]} 2026.xlsx`;
        
        try {
            console.log(`\n📂 Procesando: ${fileName}...`);
            const workbook = xlsx.readFile(fileName);
            // La mayoría tienen una sola hoja, o se llaman como el mes
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = xlsx.utils.sheet_to_json(sheet, {header: 1});

            let monthlyCompletions = 0;
            const updateIDs = [];

            // Empezar desde fila 10 (donde vimos los datos antes)
            for (let i = 1; i < data.length; i++) {
                const row = data[i];
                if (!row || row.length < 9) continue;

                const idUnico = String(row[4] || '').trim();
                const status = String(row[8] || '').trim().toUpperCase();

                if (idUnico && status.includes('EJECUTADO')) {
                    updateIDs.push(idUnico);
                }
            }

            if (updateIDs.length > 0) {
                console.log(`⚡ Marcando ${updateIDs.length} equipos como EJECUTADOS en el mes ${monthNum}...`);
                
                // Actualizar en Supabase en lotes
                const chunkSize = 50;
                for (let i = 0; i < updateIDs.length; i += chunkSize) {
                    const chunk = updateIDs.slice(i, i + chunkSize);
                    const { error } = await supabase
                        .from('maintenance_plans')
                        .update({ status: 'COMPLETED' })
                        .eq('year', 2026)
                        .eq('month', monthNum)
                        .in('id_unico', chunk);
                    
                    if (!error) monthlyCompletions += chunk.length;
                }
                console.log(`✅ Mes ${monthNum} finalizado con ${monthlyCompletions} tareas completadas.`);
            }

        } catch (err) {
            console.error(`⚠️ No se pudo procesar el archivo del mes ${monthNum}:`, err.message);
        }
    }
    console.log('\n🌟 CONCILIACIÓN COMPLETA FINALIZADA.');
}

updateRealExecution();
