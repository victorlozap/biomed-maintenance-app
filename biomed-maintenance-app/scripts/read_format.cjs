const xlsx = require('xlsx');
const fs = require('fs');

const inputFilePath = 'd:\\VICTOR LOPEZ\\CLAUDE CODE\\prueba\\formatos\\MONITORES DE SIGNOS VITALES GRF3MAN-FR35 VERSION 4.xlsx';

try {
  const workbook = xlsx.readFile(inputFilePath);
  const sheetNames = workbook.SheetNames;
  console.log("Sheets available:", sheetNames);
  
  const targetSheet = sheetNames[2]; // Third sheet is likely the FORM
  
  const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[targetSheet], { header: 1, defval: "" });
  
  fs.writeFileSync('format_dump.json', JSON.stringify({ sheet: targetSheet, data: rawData }, null, 2));
  console.log('Dumped format from sheet ' + targetSheet + ' to format_dump.json');
} catch (error) {
  console.error("Error reading format excel file:", error);
}
