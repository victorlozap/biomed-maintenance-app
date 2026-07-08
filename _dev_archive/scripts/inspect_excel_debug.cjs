const xlsx = require('xlsx');
const path = require('path');

const filePath = 'd:\\VICTOR LOPEZ\\CLAUDE CODE\\prueba\\Mantenimientos\\1. INVENTARIO EQUIPOS MÉDICOS HUSJ 2025.xlsx';

function inspectExcel() {
    console.log('--- Inspeccionando Excel ---');
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetNames = workbook.SheetNames;
        console.log('Hojas disponibles:', sheetNames);

        const sheetName = sheetNames.find(s => s.includes('INVENTARIO') || s.includes('2025'));
        if (!sheetName) {
            console.error('No se encontró la hoja de inventario');
            return;
        }

        const worksheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        console.log('Total filas:', rows.length);
        
        // Buscar los equipos de la imagen (Draeger Infinity Vista XL 544963, Vista 120 S 573306, etc)
        const targets = ['544963', '573306', '573307', '573308'];
        
        console.log('\n--- Buscando targets en el archivo ---');
        rows.forEach((row, index) => {
            if (!row || row.length === 0) return;
            
            const cellValue = String(row[0] || '').trim();
            if (targets.includes(cellValue)) {
                console.log(`Fila ${index + 1} match! ID: ${cellValue}, Equipo: ${row[1]}, Marca: ${row[3]}, Serie: ${row[5]}`);
            }
        });

        // Ver encabezados (probablemente fila 1 o algo similar)
        console.log('\n--- Primeras 5 filas del archivo ---');
        rows.slice(0, 5).forEach((row, i) => console.log(`Fila ${i+1}:`, row));

    } catch (error) {
        console.error('Error leyendo el archivo:', error.message);
    }
}

inspectExcel();
