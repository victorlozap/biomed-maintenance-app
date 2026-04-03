const xlsx = require('xlsx');
const path = require('path');

const filePath = 'd:\\VICTOR LOPEZ\\CLAUDE CODE\\prueba\\Mantenimientos\\1. INVENTARIO EQUIPOS MÉDICOS HUSJ 2025.xlsx';
try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    console.log('--- EXCEL HEADERS ---');
    console.log(data[0]);
    console.log('--- SAMPLE DATA (Rows 2230 onwards as per image) ---');
    // The image shows row 2230, 2255-2266, 2270-2271. 
    // Excel rows are usually 1-indexed in UI, but sheet_to_json header: 1 gives 0-indexed array.
    // Row 2230 in UI might be index 2229 if there is a header.
    for (let i = 2220; i < 2280; i++) {
        if (data[i]) {
            const idUnico = data[i][0];
            const equipo = data[i][1];
            if (idUnico == '544963' || (idUnico >= 573306 && idUnico <= 573319)) {
                console.log(`Row ${i + 1}:`, data[i]);
            }
        }
    }
} catch (error) {
    console.error('Error reading Excel:', error);
}
