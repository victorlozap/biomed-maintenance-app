import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to normalize equipment fields from different data sources
const normalizeEquipment = (equipment: any) => ({
  Equipo: equipment['equipo'] || equipment['Equipo'] || '',
  Marca: equipment['marca'] || equipment['Marca'] || '',
  Modelo: equipment['modelo'] || equipment['Modelo'] || '',
  NumeroSerie: equipment['numero_serie'] || equipment['NumeroSerie'] || equipment['serie'] || '',
  Id_Unico: equipment['id_unico'] || equipment['Id_Unico'] || equipment['activoFijo'] || '',
  Servicio: equipment['Servicio'] || equipment['servicio'] || '',
  Ubicacion: equipment['ubicacion'] || equipment['UBICACIÓN'] || ''
});

export const generateProtocolPDF = async (
  protocol: any,
  equipment: any,
  checks: Record<string, string>,
  numerics: Record<string, string>,
  notes: string,
  reportId: string,
  maintenanceDate: string = ''
) => {
  // Normalizar nombres de campos del equipo (compatibilidad con distintas bases de datos)
  const eq = normalizeEquipment(equipment);

  const fixSymbols = (text: string) => {
    if (!text || typeof text !== 'string') return text;
    let t = text;
    
    // 1. Limpiar artefactos conocidos de codificación en Excel/PDF
    t = t.split('"d').join('<='); 
    t = t.split('!&').join(' Ohms');
    
    // 2. Reemplazos universales para símbolos no soportados por Helvetica estándar
    t = t.split('≤').join('<=');
    t = t.split('<=').join('<=');
    t = t.split('Ohms').join('Ohms');
    t = t.split('Ω').join(' Ohms');
    t = t.split('Ω').join(' Ohms');
    t = t.split('\u2264').join('<=');
    t = t.split('\u2126').join(' Ohms');
    
    return t;
  };
  // Buscar logo dinámicamente en varias rutas posibles y formatos
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
        // Asegurarnos de que no es la página de Fallback de React (text/html)
        if (res.ok && contentType && contentType.startsWith('image/')) {
           logoFormat = (contentType.includes('jpeg') || contentType.includes('jpg')) ? 'JPEG' : 'PNG';
           const blob = await res.blob();
           logoData = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
           });
        }
     } catch(e) { /* silent fail for next URL */ }
  }

  // Cargar Firma Victor
  let firmaData: string | null = null;
  let firmaFormat = 'PNG';
  const urlFirma = '/imagenes/firma-victor-lopez.png';
  try {
     const resF = await fetch(urlFirma);
     const contentTypeF = resF.headers.get('content-type');
     if (resF.ok && contentTypeF && contentTypeF.startsWith('image/')) {
        firmaFormat = (contentTypeF.includes('jpeg') || contentTypeF.includes('jpg')) ? 'JPEG' : 'PNG';
        const blob = await resF.blob();
        firmaData = await new Promise((resolve) => {
           const reader = new FileReader();
           reader.onloadend = () => resolve(reader.result as string);
           reader.readAsDataURL(blob);
        });
     }
  } catch(e) { }

  const doc = new jsPDF({ format: 'letter' });
  const GRAY = [230, 230, 230] as [number, number, number];
  
  const isDesfibrilador = protocol.code.includes('FR55') || protocol.title.toLowerCase().includes('desfibrilador');
  
  // Pad estirado para Desfibrilador para que ocupe hermosamente el largo de la hoja carta
  const dPad = isDesfibrilador ? { top: 1.9, bottom: 1.9, left: 1, right: 1 } : { top: 1.2, bottom: 1.2, left: 1, right: 1 };
  const dFont = 8;
  const dDateH = 11;
  const logoH = 25;

  const drawHeader = () => {
    const pageNum = doc.getNumberOfPages();
    const totalPages = 2; 
    
    autoTable(doc, {
      startY: 10,
      margin: { left: 10, right: 10 },
      theme: 'grid',
      styles: { lineWidth: 0.5, lineColor: 0, textColor: 0, fontSize: dFont, halign: 'center', valign: 'middle', cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 'auto', fontStyle: 'bold' },
        2: { cellWidth: 45, halign: 'left' }
      },
      body: [
        [
          { content: '', rowSpan: 2, styles: { minCellHeight: logoH } }, 
          { content: `EMPRESA SOCIAL DEL ESTADO\nHOSPITAL UNIVERSITARIO SAN JORGE DE PEREIRA`, styles: { fontStyle: 'bold', halign: 'center' } },
          { content: `CÓDIGO: ${protocol.code}\nVERSIÓN: ${protocol.version}\nFECHA: ${protocol.date}\nPÁGINA: ${pageNum} DE ${totalPages}`, rowSpan: 2 }
        ],
        [
          { content: protocol.title, styles: { fontStyle: 'bold', halign: 'center' } }
        ]
      ],
      didDrawCell: (d: any) => {
         if (d.row.index === 0 && d.column.index === 0) {
            if (logoData) {
               const logoYOffset = isDesfibrilador ? 1 : 4;
               const logoHeight = isDesfibrilador ? 14 : 16;
               doc.addImage(logoData, logoFormat, d.cell.x + 2, d.cell.y + logoYOffset, 31, logoHeight);
            }
         }
      }
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      margin: { left: 10, right: 10 },
      theme: 'grid',
      styles: { lineWidth: 0.5, lineColor: 0, textColor: 0, fontSize: dFont, valign: 'middle', cellPadding: {top: 1, bottom:1, left:2, right:2} },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: 'bold', fillColor: GRAY },
        1: { cellWidth: 'auto', halign: 'center' },
        2: { cellWidth: 25, fontStyle: 'bold', fillColor: GRAY },
        3: { cellWidth: 55, halign: 'center' }
      },
      body: [
        [
          { content: 'EQUIPO', styles: { fillColor: GRAY } }, 
          String(eq.Equipo || '').substring(0,40), 
          { content: 'MARCA', styles: { fillColor: GRAY } }, 
          String(eq.Marca || '')
        ],
        [
          { content: 'MODELO', styles: { fillColor: GRAY } }, 
          String(eq.Modelo || ''), 
          { content: 'SERIE', styles: { fillColor: GRAY } }, 
          String(eq.NumeroSerie || '')
        ],
        [
          { content: 'ACTIVO FIJO', styles: { fillColor: GRAY } }, 
          String(eq.Id_Unico || ''), 
          { content: 'UBICACIÓN', styles: { fillColor: GRAY } }, 
          String(eq.Servicio || eq.Ubicacion || '')
        ]
      ]
    });
  };

  // ----- HOJA 1 -----
  drawHeader();

  const checkBody: any[] = [];
  
  // Encabezados con columna invisible separadora
  checkBody.push([
    { content: 'ACTIVIDADES REALIZADAS', colSpan: 2, rowSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: GRAY } },
    { content: '', rowSpan: 3, styles: { lineWidth: 0, fillColor: [255,255,255] } }, 
    { content: 'FECHA', colSpan: 3, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }
  ]);
  const formattedMaintDate = maintenanceDate ? maintenanceDate.substring(0, 10).split('-').reverse().join('/') : '';

  checkBody.push([
    { content: formattedMaintDate, colSpan: 3, styles: { minCellHeight: dDateH, halign: 'center', valign: 'middle', fontSize: 10, fontStyle: 'bold' } } 
  ]);
  checkBody.push([
    { content: '', colSpan: 2, styles: { lineWidth: 0, minCellHeight: 4 } }, 
    { content: 'C', styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY, cellWidth: 15 } },
    { content: 'NC', styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY, cellWidth: 15 } },
    { content: 'NA', styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY, cellWidth: 15 } }
  ]);

  protocol.items.forEach((item: any) => {
     const catItems = protocol.items.filter((i:any) => i.category === item.category);
     const isFirstOfCategory = catItems[0].id === item.id;
     
     let cMark = '', ncMark = '', naMark = '';
     if (checks[item.id] === 'cumple') cMark = '{v}';
     else if (checks[item.id] === 'nc') ncMark = '{v}';
     else if (checks[item.id] === 'na') naMark = '{v}';

     const row: any[] = [];
     
     if (isFirstOfCategory) {
       row.push({ 
         content: item.category || 'INSPECCIÓN', 
         rowSpan: catItems.length, 
         styles: { valign: 'middle', halign: 'center', cellWidth: isDesfibrilador ? 18 : 35 } 
       });
     }
     
     row.push({ content: fixSymbols(item.label) }); 
     row.push({ content: '', styles: { lineWidth: 0 } }); 
     row.push({ content: cMark, styles: { halign: 'center' }});
     row.push({ content: ncMark, styles: { halign: 'center' }});
     row.push({ content: naMark, styles: { halign: 'center' }});

     checkBody.push(row);
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 3,
    margin: { left: 10, right: 10, bottom: 10, top: 58 },
    didDrawPage: drawHeader,
    theme: 'grid',
    styles: { lineWidth: 0.5, lineColor: 0, textColor: 0, fontSize: dFont, cellPadding: dPad },
    columnStyles: {
       2: { cellWidth: 4 } 
    },
    body: checkBody,
    didParseCell: (hookData: any) => {
       if (hookData.column.index === 2) {
          hookData.cell.styles.lineWidth = 0;
       }
       if (hookData.cell.raw && hookData.cell.raw.content === '{v}') {
          hookData.cell.text = [''];
       }
    },
    didDrawCell: (data: any) => {
       if (data.cell.raw && data.cell.raw.content === '{v}') {
          doc.setDrawColor(15, 20, 25); 
          doc.setLineWidth(0.8);
          const rx = data.cell.x + (data.cell.width / 2) - 1;
          const ry = data.cell.y + (data.cell.height / 2);
          doc.line(rx - 1.5, ry - 0.5, rx, ry + 1.5);
          doc.line(rx, ry + 1.5, rx + 3, ry - 2.5);
       }
    }
  });

  const numericItemsPage1 = protocol.numeric_items?.filter((i:any) => i.category !== 'SEGURIDAD ELECTRICA') || [];
  const numericItemsPage2 = protocol.numeric_items?.filter((i:any) => i.category === 'SEGURIDAD ELECTRICA') || [];

  if (numericItemsPage1.length > 0) {
     const numBody1: any[] = [];
     let activeCategory = '';

     numericItemsPage1.forEach((item: any) => {
        if (item.category !== activeCategory) {
           activeCategory = item.category || 'MEDICIONES';
           numBody1.push([
             { content: activeCategory, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } },
             { content: 'VALOR', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY, cellWidth: 50 } }
           ]);
        }

        const val = numerics[item.id];
        numBody1.push([
           fixSymbols(item.label),
           { content: val ? String(val) : '', colSpan: 2, styles: { halign: 'center' } }
        ]);
     });

     autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 2,
        margin: { left: 10, right: 10, bottom: 10, top: 58 },
        didDrawPage: drawHeader,
        theme: 'grid',
        styles: { lineWidth: 0.5, lineColor: 0, textColor: 0, fontSize: dFont, cellPadding: dPad },
        columnStyles: { 0: { halign: 'center' } },
        body: numBody1
     });
  }

  // ----- SECCIÓN: SEGURIDAD ELECTRICA -----
  if (protocol.layout?.forceSecondPageBeforeElectric && doc.getNumberOfPages() === 1) {
     doc.addPage();
     drawHeader();
  }

  if (numericItemsPage2.length > 0) {
     const numBody2: any[] = [];
     let activeCategory = '';

     numericItemsPage2.forEach((item: any) => {
        if (item.category !== activeCategory) {
           activeCategory = item.category || 'MEDICIONES';
           numBody2.push([
             { content: activeCategory, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } },
             { content: 'VALOR', styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY, cellWidth: 35 } },
             { content: 'NA', styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY, cellWidth: 15 } }
           ]);
        }

        const val = numerics[item.id];
        numBody2.push([
           fixSymbols(item.label),
           { content: val ? String(val) : '', styles: { halign: 'center' } },
           { content: '', styles: { halign: 'center' } }
        ]);
     });

     autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 3,
        margin: { left: 10, right: 10, top: 58 },
        didDrawPage: drawHeader,
        theme: 'grid',
        styles: { lineWidth: 0.5, lineColor: 0, textColor: 0, fontSize: 8, cellPadding: { top: 1.2, bottom: 1.2, left: 1, right: 1 } },
        body: numBody2
     });
  }

  // ----- SECCIÓN 2: OBSERVACIONES Y FIRMAS -----
  // Forzar salto a nueva hoja para observaciones si el layout lo pide y aún no hemos saltado
  if (protocol.layout?.forceObservationsToNextPage !== false && doc.getNumberOfPages() === 1) {
    doc.addPage();
    drawHeader();
  }

  // Cuadro de Observaciones
  const obsY = Math.max((doc as any).lastAutoTable.finalY + 3, 62);
  autoTable(doc, {
    startY: obsY,
    margin: { left: 10, right: 10, top: 58 },
    didDrawPage: drawHeader,
    theme: 'grid',
    styles: { lineWidth: 0.5, lineColor: 0, textColor: 0, fontSize: 8, cellPadding: 2 },
    body: [
      [{ content: 'OBSERVACIONES', styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }],
      [{ content: notes || '\n\n\n\n\n\n\n', styles: { minCellHeight: 60 } }]
    ]
  });

  // ----- TABLAS FINALES DE FIRMAS Y CONVENCIONES -----
  const finalY = (doc as any).lastAutoTable.finalY + 5;
  
  autoTable(doc, {
    startY: finalY,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: { lineWidth: 0.5, lineColor: 0, textColor: 0, fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: '50%' as any },
      1: { cellWidth: '50%' as any }
    },
    body: [
      [
        { content: 'REALIZADO POR', styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } },
        { content: 'RECIBIDO POR', styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }
      ],
      [
        { content: '', styles: { minCellHeight: 25 } },
        { content: '', styles: { minCellHeight: 25 } }
      ]
    ],
    didDrawCell: (data: any) => {
      if (data.row.index === 1 && data.column.index === 0 && firmaData && reportId !== 'BLANK') {
        const sigW = 32;
        const sigH = 12;
        doc.addImage(firmaData, firmaFormat, data.cell.x + (data.cell.width - sigW) / 2, data.cell.y + 4, sigW, sigH);
        // Renderizar el nombre debajo
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("VICTOR LOPEZ", data.cell.x + (data.cell.width / 2), data.cell.y + 21, { align: 'center' });
        doc.setFont("helvetica", "normal");
        doc.text("Biomédico HUSJ", data.cell.x + (data.cell.width / 2), data.cell.y + 24, { align: 'center' });
      }
    }
  });

  const convBody: any[] = [
    [
      { content: 'TABLA DE CONVENCIONES', colSpan: 6, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }
    ],
    [
      'C', 'CUMPLE', 'NC', 'NO CUMPLE', 'NA', 'NO APLICA'
    ]
  ];

  if (protocol.code.includes('FR55') || protocol.title.toLowerCase().includes('desfibrilador')) {
     convBody.push([
        { content: 'AC', styles: { fontStyle: 'bold', halign: 'center' } },
        { content: 'CORRIENTE ALTERNA', colSpan: 2, styles: { halign: 'center' } },
        { content: 'BPM', styles: { fontStyle: 'bold', halign: 'center' } },
        { content: 'LATIDOS POR MINUTO', colSpan: 2, styles: { halign: 'center' } }
     ]);
  }

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 2,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    styles: { lineWidth: 0.5, lineColor: 0, textColor: 0, fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'center' },
      1: { halign: 'center' },
      2: { fontStyle: 'bold', halign: 'center' },
      3: { halign: 'center' },
      4: { fontStyle: 'bold', halign: 'center' },
      5: { halign: 'center' }
    },
    body: convBody
  });

  const filename = `Preventivo_${protocol.code}_${eq.Id_Unico || 'S-N'}.pdf`;
   // Manual download with fallback: open PDF in new tab and trigger download
   const blob = doc.output('blob');
   const url = URL.createObjectURL(blob);
   // Open in new tab for user to manually save if automatic download blocked
   window.open(url, '_blank');
   const a = document.createElement('a');
   a.href = url;
   a.download = filename;
   document.body.appendChild(a);
   a.click();
   document.body.removeChild(a);
   URL.revokeObjectURL(url);
};
