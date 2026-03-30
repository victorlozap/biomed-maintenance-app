const xlsx = require('xlsx');

const extractFormato = (file) => {
  const wb = xlsx.readFile(file);
  const sheet = wb.Sheets['FORMATO'];
  if (!sheet) return;
  const json = xlsx.utils.sheet_to_json(sheet, {header: 1, defval: ""});
  
  let items = [];
  json.forEach(row => {
    // Collect non-empty columns from the row
    const texts = row.filter(c => typeof c === 'string' && c.trim().length > 3);
    if (texts.length > 0) {
       items.push(texts.join(' | '));
    }
  });
  
  console.log(`\n=== FORMATO FROM ${file.split(/[\\/]/).pop()} ===`);
  items.forEach(i => console.log(i));
};

extractFormato('../formatos/MONITORES DE SIGNOS VITALES GRF3MAN-FR35 VERSION 4.xlsx');
extractFormato('../formatos/DESFIBRILADORES GRF3MAN-FR55 VERSION 4.xlsx');
