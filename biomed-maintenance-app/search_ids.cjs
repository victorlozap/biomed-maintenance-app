const xlsx = require('xlsx');
const filePath = 'd:\\VICTOR LOPEZ\\CLAUDE CODE\\prueba\\Mantenimientos\\1. INVENTARIO EQUIPOS MÉDICOS HUSJ 2025.xlsx';
try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = 'INVENTARIO HUSJ (2025)';
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log('--- HEADERS for INVENTARIO HUSJ ---');
    console.log(JSON.stringify(data[0])); // The real headers.

    console.log('--- SEARCHING FOR IDS FROM IMAGE ---');
    const idsToFind = ['544963', '573306', '573307', '573308', '573309', '573310', '573311', '573313', '573314', '573315', '573316', '573318', '573319', '573312', '573317'];
    
    data.forEach((row, index) => {
        const idUnico = String(row[0] || '').trim();
        if (idsToFind.includes(idUnico)) {
            console.log(`Found row ${index + 1}: ${JSON.stringify(row)}`);
        }
    });
} catch (error) {
    console.error('Error:', error);
}
