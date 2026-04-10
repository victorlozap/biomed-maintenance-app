export const formatDate = (val: any): string => {
  if (!val || val === 'N/A' || val === 'No Aplica') return 'No Aplica';
  
  try {
    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)) && !val.includes('-') && !val.includes('/'))) {
      const excelDate = parseFloat(val as string);
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      const d = String(date.getUTCDate()).padStart(2, '0');
      const m = String(date.getUTCMonth() + 1).padStart(2, '0');
      const y = date.getUTCFullYear();
      return `${d}/${m}/${y}`;
    }

    // Pure literal string parsing to NEVER accidentally shift timezones
    if (typeof val === 'string') {
      const pureDate = val.split('T')[0].split(' ')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(pureDate)) {
        const parts = pureDate.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    const date = new Date(val);
    if (!isNaN(date.getTime())) {
      const d = String(date.getUTCDate()).padStart(2, '0');
      const m = String(date.getUTCMonth() + 1).padStart(2, '0');
      const y = date.getUTCFullYear();
      return `${d}/${m}/${y}`;
    }
  } catch (e) {
    console.error("Error formatting date:", e);
  }
  
  return String(val);
};

export const formatDateForInput = (val: any): string => {
  if (!val || val === 'N/A' || val === 'No Aplica') return '';
  
  try {
    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)) && !val.includes('-') && !val.includes('/'))) {
      const excelDate = parseFloat(val as string);
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      const d = String(date.getUTCDate()).padStart(2, '0');
      const m = String(date.getUTCMonth() + 1).padStart(2, '0');
      const y = date.getUTCFullYear();
      return `${y}-${m}-${d}`;
    }

    if (typeof val === 'string') {
      const pureDate = val.split('T')[0].split(' ')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(pureDate)) {
        return pureDate;
      }
    }

    const date = new Date(val);
    if (!isNaN(date.getTime())) {
      const d = String(date.getUTCDate()).padStart(2, '0');
      const m = String(date.getUTCMonth() + 1).padStart(2, '0');
      const y = date.getUTCFullYear();
      return `${y}-${m}-${d}`;
    }
  } catch (e) {
    console.error("Error formatting input date:", e);
  }
  
  return '';
};
