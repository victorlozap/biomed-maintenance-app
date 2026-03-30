const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const formatosDir = 'd:\\VICTOR LOPEZ\\CLAUDE CODE\\prueba\\formatos';
const files = fs.readdirSync(formatosDir).filter(f => f.endsWith('.xlsx'));

const protocols = {};

for (const file of files) {
   try {
       const filePath = path.join(formatosDir, file);
       const workbook = xlsx.readFile(filePath);
       
       // Just grab the first standard sheet that is not "busqueda"
       const validSheets = workbook.SheetNames.filter(s => !s.toLowerCase().includes('buscar') && !s.toLowerCase().includes('busqueda'));
       const targetSheet = validSheets.length > 0 ? validSheets[0] : workbook.SheetNames[0];

       const sheet = workbook.Sheets[targetSheet];
       const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
       
       // Clean rows (remove empty ones)
       const cleanedData = data.filter(row => row.some(cell => String(cell).trim() !== ""));
       
       protocols[file] = cleanedData;
       console.log("Parsed:", file);
   } catch(e) {
       console.error("Error parsing", file, e.message);
   }
}

const outPath = path.join(__dirname, '..', 'src', 'data', 'protocols.json');
fs.writeFileSync(outPath, JSON.stringify(protocols, null, 2));
console.log("Wrote protocols to", outPath);
