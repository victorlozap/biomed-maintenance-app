import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateProfilePDF = async (equipment: any) => {
  let logoData: string | null = null;
  let logoFormat = 'PNG';
  const posiblesRutas = [
     '/imagenes/logo-san-jorge.jpg', 
     '/imagenes/logo.png', '/imagenes/logo.jpg', '/imagenes/logo.jpeg',
     '/logo.png', '/logo.jpg', '/logo.jpeg'
  ];

  for (const ruta of posiblesRutas) {
     if (logoData) break;
     try {
        const res = await fetch(ruta);
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.startsWith('image/')) {
           logoFormat = (contentType.includes('jpeg') || contentType.includes('jpg')) ? 'JPEG' : 'PNG';
           const blob = await res.blob();
           logoData = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
           });
        }
     } catch(e) { }
  }

  // Helper to normalize equipment fields from different data sources
  const eq = {
    Equipo: equipment['equipo'] || equipment['Equipo'] || '',
    Marca: equipment['marca'] || equipment['Marca'] || '',
    Modelo: equipment['modelo'] || equipment['Modelo'] || '',
    NumeroSerie: equipment['numero_serie'] || equipment['NumeroSerie'] || equipment['serie'] || '',
    Id_Unico: equipment['id_unico'] || equipment['Id_Unico'] || equipment['activoFijo'] || '',
    Servicio: equipment['servicio'] || equipment['Servicio'] || '',
    Riesgo: equipment['riesgo'] || equipment['Riesgo'] || '',
    Frecuencia: equipment['frecuencia_mantenimiento'] || equipment['Frecuencia'] || '',
    Garantia: equipment['garantia'] || equipment['Garantia'] || '',
    RegistroInvima: equipment['registro_invima'] || equipment['RegistroInvima'] || '',
    RequiereCalibracion: equipment['requiere_calibracion'] || equipment['RequiereCalibracion'] || ''
  };

  const doc = new jsPDF({ format: 'letter' });
  const GRAY = [230, 230, 230] as [number, number, number];

  // --- ENCABEZADO HOSPITAL ---
  autoTable(doc, {
    startY: 10,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: { lineWidth: 0.5, lineColor: 0, textColor: 0, fontSize: 8, halign: 'center', valign: 'middle', cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 'auto', fontStyle: 'bold' },
      2: { cellWidth: 45, halign: 'left' }
    },
    body: [
      [
        { content: '', rowSpan: 2, styles: { minCellHeight: 25 } }, 
        { content: `EMPRESA SOCIAL DEL ESTADO\nHOSPITAL UNIVERSITARIO SAN JORGE DE PEREIRA`, styles: { fontStyle: 'bold', halign: 'center' } },
        { content: `CÓDIGO: GRF3MAN-FR18\nVERSIÓN: 4.0\nFECHA: 16-11-2022\nPÁGINA: 1 DE 1`, rowSpan: 2 }
      ],
      [
        { content: `HOJA DE VIDA EQUIPOS MÉDICOS`, styles: { fontStyle: 'bold', halign: 'center' } }
      ]
    ],
    didDrawCell: (data: any) => {
       if (data.row.index === 0 && data.column.index === 0) {
          if (logoData) {
             doc.addImage(logoData, logoFormat, data.cell.x + 2, data.cell.y + 4, 31, 16);
          } else {
             doc.text("Logo HUSJ", data.cell.x + 17, data.cell.y + 12, { align: "center" });
          }
       }
    }
  });

  const bodyStyles = { lineWidth: 0.5, lineColor: 0, textColor: 0, fontSize: 8, cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 } };

  // --- SECCIÓN 1: INFORMACIÓN GENERAL ---
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 3,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: bodyStyles,
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold', fillColor: GRAY },
      1: { cellWidth: 60 },
      2: { cellWidth: 40, fontStyle: 'bold', fillColor: GRAY },
      3: { cellWidth: 'auto' }
    },
    body: [
      [{ content: 'INFORMACIÓN GENERAL', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }],
      ['NOMBRE', eq.Equipo || '', 'FECHA DE COMPRA', ''],
      ['PLACA (ID ÚNICO)', eq.Id_Unico || '', 'COMPRA DE INSTALACIÓN', ''],
      ['UBICACIÓN (SERVICIO)', eq.Servicio || '', 'FORMA DE ADQUISICIÓN', ''],
      ['MARCA', eq.Marca || '', 'REPRESENTANTE', ''],
      ['MODELO', eq.Modelo || '', 'DIRECCIÓN', ''],
      ['SERIE', eq.NumeroSerie || '', 'CIUDAD', ''],
      ['VALOR ADQUISICIÓN', '', 'TELÉFONO', ''],
      ['', '', 'GARANTÍA HASTA', eq.Garantia || '']
    ]
  });

  // --- SECCIÓN 2: TECNOVIGILANCIA ---
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 3,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: bodyStyles,
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold', fillColor: GRAY },
      1: { cellWidth: 45 },
      2: { cellWidth: 50, fontStyle: 'bold', fillColor: GRAY },
      3: { cellWidth: 'auto' }
    },
    body: [
      [{ content: 'TECNOVIGILANCIA', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }],
      ['CLASIFICACIÓN TECNOVIGILANCIA', '', 'PERMISO COMERCIALIZACIÓN', ''],
      ['REGISTRO SANITARIO', eq.RegistroInvima || '', 'TECNOLOGÍA CONTROLADA', '']
    ]
  });

  // --- SECCIÓN 3: CARACTERISTICAS TÉCNICAS Y CONDICIONES DE CALIDAD ---
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 3,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: bodyStyles,
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold', fillColor: GRAY },
      1: { cellWidth: 40 },
      2: { cellWidth: 60, fontStyle: 'bold', fillColor: GRAY },
      3: { cellWidth: 'auto' }
    },
    body: [
      [{ content: 'CARACTERISTICAS TÉCNICAS Y CONDICIONES DE CALIDAD', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }],
      ['VOLTAJE', '', 'EQUIPO', eq.Equipo || ''],
      ['CORRIENTE', '', 'TECNOLOGÍA', ''],
      ['POTENCIA', '', 'PERIODICIDAD DE MTTO.', eq.Frecuencia || ''],
      ['FRECUENCIA', '', 'CALIBRACIÓN', eq.RequiereCalibracion || ''],
      [{ content: `CLASIFICACIÓN BIOMÉDICA: ${eq.Riesgo || ''}`, colSpan: 4, styles: { fontStyle: 'bold', fillColor: GRAY } }]
    ]
  });

  // --- SECCIÓN 4: PLANOS MANUALES ---
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 3,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: bodyStyles,
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold', fillColor: GRAY },
      1: { cellWidth: 35 },
      2: { cellWidth: 20, fontStyle: 'bold', fillColor: GRAY },
      3: { cellWidth: 35 },
      4: { cellWidth: 20, fontStyle: 'bold', fillColor: GRAY },
      5: { cellWidth: 'auto' }
    },
    body: [
      [{ content: 'PLANOS MANUALES', colSpan: 6, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }],
      ['CÓDIGO MANUAL', '', 'PLANOS', '', 'IDIOMA', ''],
      ['OPERACIÓN', '', 'SERVICIO', '', '', '']
    ]
  });

  // --- SECCIÓN 5: ACCESORIOS ---
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 3,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: bodyStyles,
    body: [
      [{ content: 'ACCESORIOS', styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }],
      [{ content: '', styles: { minCellHeight: 25 } }]
    ]
  });

  // --- SECCIÓN 6: OBSERVACIONES ---
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 3,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: bodyStyles,
    body: [
      [{ content: 'OBSERVACIONES', styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }],
      [{ content: '', styles: { minCellHeight: 25 } }]
    ]
  });

  doc.save(`Hoja_Vida_${equipment.id_unico || 'Equipo'}.pdf`);
};
