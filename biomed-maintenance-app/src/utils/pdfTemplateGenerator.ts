import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Utilidad genérica para "estampar" datos sobre una plantilla PDF.
 * Origin (0,0) es la esquina INFERIOR IZQUIERDA (mismo sistema que ReportLab).
 */
export const generatePDFWithTemplate = async (
  templateUrl: string,
  mappings: { text: string, x: number, y: number, size?: number, color?: any }[]
) => {
  try {
    console.log('Cargando plantilla desde:', templateUrl);
    const existingPdfBytes = await fetch(templateUrl).then(res => {
      if (!res.ok) throw new Error(`No se pudo cargar la plantilla: ${res.statusText}`);
      return res.arrayBuffer();
    });
    
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const mapping of mappings) {
      if (!mapping.text) continue;
      
      firstPage.drawText(mapping.text, {
        x: mapping.x,
        y: mapping.y,
        size: mapping.size || 10,
        font: font,
        color: mapping.color || rgb(0, 0, 0),
      });
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Error en generatePDFWithTemplate:', error);
    throw error;
  }
};

export const downloadBlob = (data: Uint8Array, fileName: string) => {
  const blob = new Blob([data as any], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
};
