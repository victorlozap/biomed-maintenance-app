export const formatDate = (val: any): string => {
  if (!val || val === 'N/A' || val === 'No Aplica') return 'No Aplica';
  
  try {
    // Exact match format YYYY-MM-DD ensures no timezone shift
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const parts = val.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    // Pure date with time zeroed out
    if (typeof val === 'string' && val.includes('T00:00:00.000Z')) {
      const pureDate = val.split('T')[0];
      const parts = pureDate.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)) && !val.includes('-') && !val.includes('/'))) {
      const excelDate = parseFloat(val as string);
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      const d = String(date.getUTCDate()).padStart(2, '0');
      const m = String(date.getUTCMonth() + 1).padStart(2, '0');
      const y = date.getUTCFullYear();
      return `${d}/${m}/${y}`;
    }

    const date = new Date(val);
    if (!isNaN(date.getTime())) {
      const formatter = new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      return formatter.format(date);
    }
  } catch (e) {
    console.error("Error formatting date:", e);
  }
  
  return String(val);
};

export const formatDateForInput = (val: any): string => {
  if (!val || val === 'N/A' || val === 'No Aplica') return '';
  
  try {
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return val;
    }

    if (typeof val === 'string' && val.includes('T00:00:00.000Z')) {
      return val.split('T')[0];
    }

    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)) && !val.includes('-') && !val.includes('/'))) {
      const excelDate = parseFloat(val as string);
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      const d = String(date.getUTCDate()).padStart(2, '0');
      const m = String(date.getUTCMonth() + 1).padStart(2, '0');
      const y = date.getUTCFullYear();
      return `${y}-${m}-${d}`;
    }

    const date = new Date(val);
    if (!isNaN(date.getTime())) {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      return formatter.format(date);
    }
  } catch (e) {
    console.error("Error formatting input date:", e);
  }
  
  return '';
};
