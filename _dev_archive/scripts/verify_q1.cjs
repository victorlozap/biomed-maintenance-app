const xlsx = require('xlsx');
const fs = require('fs');

const months = ['Enero', 'Febrero', 'Marzo', 'Abril'];
console.log('📊 REPORTE DE INDICADORES (ENERO-ABRIL 2026)\n');

months.forEach((m, idx) => {
    try {
        const monthNum = idx + 1;
        const fileName = `../Mantenimientos/${monthNum}. Preventivo ${m} 2026.xlsx`;
        
        if (!fs.existsSync(fileName)) {
            console.log(`❌ ${m}: Archivo no encontrado.`);
            return;
        }

        const workbook = xlsx.readFile(fileName);
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header: 1});

        let total = 0;
        let done = 0;

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length < 1) continue;

            const equipName = String(row[0] || '').trim();
            const equipNameUpper = equipName.toUpperCase();

            // REGLAS MANUALES DE EXCLUSIÓN
            if (equipNameUpper === 'EQUIPO' || equipNameUpper === 'UNDEFINED' || equipName === '') continue;
            
            // Si es una de las filas de resumen al final
            if (equipNameUpper.startsWith('TOTAL DE') || 
                equipNameUpper.startsWith('EQUIPOS ENCONTRADOS') || 
                equipNameUpper.startsWith('EQUIPOS EJECUTADOS') || 
                equipNameUpper.startsWith('EQUIPOS NO ENCONTRADOS') || 
                equipNameUpper.startsWith('EQUIPOS DE BAJA') || 
                equipNameUpper.startsWith('EQUIPOS NO REALIZADOS') || 
                equipNameUpper.startsWith('% DE')) {
                continue;
            }

            // Si llegamos aquí, es un equipo
            total++;
            const statusEjecucion = String(row[9] || '').trim().toUpperCase();
            if (statusEjecucion.includes('EJECUTADO')) {
                done++;
            }
        }

        const percentage = total > 0 ? ((done/total)*100).toFixed(2) : 0;
        console.log(`📌 ${m}:`);
        console.log(`   - Programados (Filas con ID): ${total}`);
        console.log(`   - Ejecutados: ${done}`);
        console.log(`   - Cumplimiento: ${percentage}%\n`);

    } catch (err) {
        console.log(`⚠️ ${m}: Error leyendo archivo - ${err.message}`);
    }
});
