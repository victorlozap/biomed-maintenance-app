import { generatePDFWithTemplate, downloadBlob } from './pdfTemplateGenerator';
import type { Correctivo } from '../types/corrective';

/**
 * Generador de Reporte Correctivo HUSJ usando la técnica de STAMPING (Overlay).
 * Utiliza los mappings propuestos por el usuario en su script de Python.
 */
export const generateCorrectiveTemplatePDF = async (item: Correctivo) => {
  const templateUrl = '/formatos/GRF3MAN-FR134_PLANTILLA.pdf';
  
  // Mappings basados en el código Python del usuario
  const mappings = [
    { text: String(item.no_reporte || ''), x: 450, y: 715, size: 10 },
    { text: item.equipo || '', x: 70, y: 600, size: 10 },
    { text: item.descripcion || '', x: 70, y: 450, size: 10 },
  ];

  // Dibujar la "X" en Correctivo (Coordenada 155, 545 del script Python)
  // El usuario asume que 'tipo' == 'Correctivo' siempre en este contexto
  mappings.push({ text: 'X', x: 155, y: 545, size: 12 });

  try {
    const pdfBytes = await generatePDFWithTemplate(templateUrl, mappings);
    downloadBlob(pdfBytes, `Reporte_Correctivo_${item.no_reporte}.pdf`);
  } catch (error) {
    console.error('Error al generar el PDF con plantilla:', error);
    alert('Error al generar el PDF. ¿Subiste la plantilla a public/formatos/GRF3MAN-FR134_PLANTILLA.pdf?');
  }
};
