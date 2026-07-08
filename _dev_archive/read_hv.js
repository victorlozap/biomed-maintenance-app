import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const xlsx = require('xlsx');

try {
  const filePath = 'd:\\VICTOR LOPEZ\\CLAUDE CODE\\prueba\\formatos\\FLUJÓMETROS - REGULADORES - VACUTRONES - GRF3MAN-FR43 VERSION 6.xlsx';
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const csv = xlsx.utils.sheet_to_csv(worksheet);
  const fs = require('fs');
  fs.writeFileSync('hv_out.txt', csv);
  console.log("Written to hv_out.txt");
  
} catch (e) {
  console.error("Error al leer:", e);
}
