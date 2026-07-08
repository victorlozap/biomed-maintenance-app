const xlsx = require('xlsx');
const filePath = 'd:\\VICTOR LOPEZ\\CLAUDE CODE\\prueba\\Mantenimientos\\1. INVENTARIO EQUIPOS MÉDICOS HUSJ 2025.xlsx';
try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets['INVENTARIO HUSJ (2025)'];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    const targetRows = [2229, 2254, 2255, 2256]; // correspond to 2230, 2255, 2256, 2257 in UI
    targetRows.forEach(idx => {
        if (data[idx]) {
            console.log(`Row ${idx+1}:`, JSON.stringify(data[idx]));
        }
    });
} catch (error) { console.error(error); }
