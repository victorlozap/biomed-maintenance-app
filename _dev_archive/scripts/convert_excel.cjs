const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const inputFilePath = 'd:\\VICTOR LOPEZ\\CLAUDE CODE\\prueba\\1. INVENTARIO EQUIPOS MÉDICOS HUSJ 2025.xlsx';
const outputPath = path.join(__dirname, '..', 'src', 'data', 'inventory.json');

try {
  const workbook = xlsx.readFile(inputFilePath);
  const sheetName = workbook.SheetNames[1];
  const worksheet = workbook.Sheets[sheetName];
  
  // Read as array of arrays
  const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
  
  // Find the header row (contains 'Id_Unico')
  let headerRowIndex = 0;
  for (let i = 0; i < rawData.length; i++) {
    if (rawData[i].includes('Id_Unico') || rawData[i].includes('Equipo')) {
      headerRowIndex = i;
      break;
    }
  }

  const headers = rawData[headerRowIndex].map(h => h ? h.toString().trim() : 'UNKNOWN');
  
  const formattedData = [];
  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const row = rawData[i];
    // skip empty rows
    if (row.every(cell => cell === "")) continue;

    const rowObj = {};
    for (let j = 0; j < headers.length; j++) {
      if (headers[j] !== 'UNKNOWN') {
        rowObj[headers[j]] = row[j] !== undefined ? row[j] : "";
      }
    }
    // Only add if it has a valid Id_Unico or Equipo
    if (rowObj['Id_Unico'] || rowObj['Equipo']) {
      formattedData.push(rowObj);
    }
  }

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(formattedData, null, 2));
  console.log(`Successfully converted ${formattedData.length} valid rows to ${outputPath}`);
} catch (error) {
  console.error("Error converting Excel file:", error);
  process.exit(1);
}
