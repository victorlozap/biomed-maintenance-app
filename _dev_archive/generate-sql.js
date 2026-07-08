import XLSX from 'xlsx';
import fs from 'fs';

const EXCEL_PATH = 'd:\\VICTOR LOPEZ\\CLAUDE CODE\\prueba\\Mantenimientos\\1. INVENTARIO EQUIPOS MÉDICOS HUSJ 2025.xlsx';
const OUTPUT_SQL_PATH = 'd:\\VICTOR LOPEZ\\CLAUDE CODE\\prueba\\biomed-maintenance-app\\fix_locations.sql';

async function generateSQL() {
    console.log("📂 Leyendo Excel (Sheet: INVENTARIO HUSJ (2025))...");
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheetName = 'INVENTARIO HUSJ (2025)';
    const sheet = workbook.Sheets[sheetName];
    
    // Fila 1 es donde están "Id_Unico", "Servicio", "UBICACIÓN"
    const rawData = XLSX.utils.sheet_to_json(sheet, { range: 1, defval: '' });

    console.log(`📊 Generando script SQL para ${rawData.length} registros...`);

    let sqlOutput = `-- SCRIPT DE CORRECCIÓN DE SERVICIO Y UBICACIÓN HUSJ\n-- Creado para ejecutar en el SQL Editor de Supabase\n\n`;
    
    // Envolvemos todo en una transacción
    sqlOutput += `BEGIN;\n\n`;

    let count = 0;
    rawData.forEach(item => {
        const id = String(item['Id_Unico'] || '').trim();
        if (!id || id === 'Id_Unico') return;

        const servicio = String(item['Servicio'] || '').trim().replace(/'/g, "''");
        const ubicacion = String(item['UBICACIÓN'] || '').trim().replace(/'/g, "''");

        if (servicio && ubicacion) {
            sqlOutput += `UPDATE public.equipments SET servicio = '${servicio}', ubicacion = '${ubicacion}' WHERE id_unico = '${id}';\n`;
            count++;
        }
    });

    sqlOutput += `\nCOMMIT;\n`;

    fs.writeFileSync(OUTPUT_SQL_PATH, sqlOutput, 'utf8');
    console.log(`✨ Script SQL generado en: ${OUTPUT_SQL_PATH}`);
    console.log(`🚀 Se incluyeron ${count} sentencias UPDATE listas para copiar y pegar en Supabase.`);
}

generateSQL().catch(console.error);
