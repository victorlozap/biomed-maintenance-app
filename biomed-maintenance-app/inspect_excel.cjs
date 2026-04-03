const xlsx = require('xlsx');
const filePath = 'd:\\VICTOR LOPEZ\\CLAUDE CODE\\prueba\\Mantenimientos\\1. INVENTARIO EQUIPOS MÉDICOS HUSJ 2025.xlsx';
try {
    const workbook = xlsx.readFile(filePath);
    console.log('Sheet Names:', workbook.SheetNames);
    const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Or maybe the 2nd one?
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    console.log('Row 0:', data[0]);
    console.log('Row 1:', data[1]);
    console.log('Row 2:', data[2]);
    // Find where the real data starts.
} catch (error) {
    console.error('Error:', error);
}
