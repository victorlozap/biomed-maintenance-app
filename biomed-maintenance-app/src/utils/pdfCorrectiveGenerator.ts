import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generador de PDF para Reportes Correctivos HUSJ — GRF3MAN-FR134
 * Réplica EXACTA del formato oficial (formato_oficial.png)
 */

const loadAndSanitizeImage = async (url: string): Promise<{ data: string; format: string } | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        // Usamos PNG para preservar transparencia si la hay
        const data = canvas.toDataURL('image/png');
        resolve({ data, format: 'PNG' });
      } catch (e) {
        console.error('Canvas error:', e);
        resolve(null);
      }
    };
    img.onerror = () => {
      console.warn('Image load error for:', url);
      resolve(null);
    };
    img.src = url;
  });
};

export const generateCorrectivePDF = async (correctiveData: any, equipment: any, userEmail: string) => {
  try {
    if (!correctiveData) throw new Error("Datos del correctivo no proporcionados");
    if (!equipment) throw new Error("Datos del equipo no proporcionados");

    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'letter' });
    const s = (val: any) => String(val || '');
    const M = 10;
    const LW = 0.4;
    const F = 8;
    const PAD = { top: 0.85, bottom: 0.85, left: 1.5, right: 1.5 };
    const baseStyles = { lineWidth: LW, lineColor: 0, textColor: 0, fontSize: F, cellPadding: PAD };
    const GRAY = [230, 230, 230] as [number, number, number];

  // ---- Logo ----
  let logoData: string | null = null;
  let logoFormat = 'PNG';
  for (const ruta of ['/imagenes/logo-san-jorge.jpg', '/imagenes/logo.png', 'imagenes/logo-san-jorge.jpg']) {
    if (logoData) break;
    const r = await loadAndSanitizeImage(ruta);
    if (r) { logoData = r.data; logoFormat = r.format; }
  }
  console.log('Logo cargado:', !!logoData);

  // ---- Firma ----
  let firmaData: string | null = null;
  let firmaFormat = 'PNG';
  let engineerName = 'VICTOR LOPEZ';
  const emailLower = (userEmail || '').toLowerCase();
  const sigMap = [
    { p: 'leograjales', u: '/imagenes/firma-leonardo.png', n: 'LEONARDO GRAJALES' },
    { p: 'leonardo', u: '/imagenes/firma-leonardo.png', n: 'LEONARDO GRAJALES' },
    { p: 'kmiloramirez', u: '/imagenes/firma-camilo.png', n: 'CAMILO RAMIREZ' },
    { p: 'camilo', u: '/imagenes/firma-camilo.png', n: 'CAMILO RAMIREZ' },
    { p: 'cristiand.hurtado', u: '/imagenes/firma-cristian.png', n: 'CRISTIAN HURTADO' },
    { p: 'cristian', u: '/imagenes/firma-cristian.png', n: 'CRISTIAN HURTADO' },
    { p: 'victor.lopez', u: '/imagenes/firma-victor-lopez.png', n: 'VICTOR LOPEZ' },
    { p: 'victor', u: '/imagenes/firma-victor-lopez.png', n: 'VICTOR LOPEZ' },
  ];
  const matched = sigMap.find(s => emailLower.includes(s.p));
  const sigUrl = matched?.u || '/imagenes/firma-victor-lopez.png';
  engineerName = matched?.n || 'VICTOR LOPEZ';
  
  const pathsToTry = [sigUrl];
  if (sigUrl.startsWith('/')) pathsToTry.push(sigUrl.substring(1));
  if (typeof window !== 'undefined') pathsToTry.push(window.location.origin + sigUrl);

  for (const ruta of pathsToTry) {
    if (firmaData) break;
    const r = await loadAndSanitizeImage(ruta);
    if (r) { firmaData = r.data; firmaFormat = r.format; }
  }

  // Helper: checkbox con checkmark vectorial
  const chk = (condition: boolean) => condition ? '{v}' : '';
  
  const drawCheck = (data: any) => {
    // Solo dibujar si es una celda de ancho 5 (nuestro estándar de check) 
    // y NO es una celda combinada (colSpan) para evitar dibujarlo en los títulos de sección
    const isMerged = data.cell.colSpan && data.cell.colSpan > 1;
    if (data.section === 'body' && data.cell.styles.cellWidth === 5 && !isMerged) {
      const { x, y } = data.cell;
      doc.setDrawColor(0);
      doc.setLineWidth(0.2);
      doc.rect(x + 1, y + 1, 3, 3);
      
      // Dibujamos la V si la celda fue marcada en didParseCell
      if ((data.cell as any)._isCheck) {
        doc.setDrawColor(0);
        doc.setLineWidth(0.4);
        doc.line(x + 1.5, y + 2.5, x + 2.2, y + 3.5);
        doc.line(x + 2.2, y + 3.5, x + 3.5, y + 1.5);
      }
    }
  };

  const didParseCell = (data: any) => {
    const rawVal = data.cell.raw;
    const content = (typeof rawVal === 'object' && rawVal !== null) ? rawVal.content : rawVal;
    
    if (content === '{v}') {
      (data.cell as any)._isCheck = true;
      data.cell.text = [''];
    }
  };

  const metadata = correctiveData.metadata || {};
  const tiempos = metadata.tiempos || {};
  const checklist = metadata.checklist || {};
  const procedure = s(metadata.procedimiento || correctiveData.tipo || 'Correctivo').toLowerCase();
  const contract = s(metadata.contrato || 'Mantenimiento').toLowerCase();

  const reportNo = s(correctiveData.report_id || correctiveData.no_reporte || correctiveData.id || '');
  const fechaI = correctiveData.fecha_creacion ? String(correctiveData.fecha_creacion).split('T')[0] : '';
  const fechaF = correctiveData.fecha_cierre ? String(correctiveData.fecha_cierre).split('T')[0] : '';

  // ==================== 1. ENCABEZADO ====================
  autoTable(doc, {
    startY: 8,
    margin: { left: M, right: M },
    theme: 'grid',
    styles: { ...baseStyles, halign: 'center', valign: 'middle' },
    columnStyles: { 0: { cellWidth: 32 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 42, halign: 'left' } },
    didDrawCell: (data: any) => {
      if (data.row.index === 0 && data.column.index === 0 && logoData) {
        try {
          doc.addImage(logoData, 'PNG', data.cell.x + 2, data.cell.y + 3, 28, 16);
        } catch (e) { console.warn('Logo error:', e); }
      }
      // Dibujar Metadata con negritas específicas
      if (data.column.index === 2 && data.row.index === 0 && data.section === 'body') {
        const { x, y } = data.cell;
        const lineHeight = 4.5;
        const startX = x + 2;
        let currentY = y + 5;

        const drawLine = (label: string, value: string) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, startX, currentY);
          const labelWidth = doc.getTextWidth(label);
          doc.setFont('helvetica', 'normal');
          doc.text(value, startX + labelWidth + 1, currentY);
          currentY += lineHeight;
        };

        drawLine('CÓDIGO:', 'GRF3MAN-FR134');
        drawLine('VERSIÓN:', '1.0');
        drawLine('FECHA:', '06-04-2026');
        drawLine('PÁGINA:', '1 DE 1');
      }
    },
    body: [
      [
        { content: '', rowSpan: 2, styles: { minCellHeight: 22 } },
        { content: 'EMPRESA SOCIAL DEL ESTADO\nHOSPITAL UNIVERSITARIO SAN JORGE DE PEREIRA', styles: { fontStyle: 'bold', fontSize: 9.5, minCellHeight: 11 } },
        { content: '', rowSpan: 2, styles: { cellWidth: 42 } }
      ],
      [{ content: 'REPORTE DE SERVICIO\nEQUIPOS BIOMÉDICOS', styles: { fontStyle: 'bold', fontSize: 8.5, minCellHeight: 11 } }]
    ]
  });

  // ==================== 2. REPORTE No. + FECHAS (TRES TABLAS SEPARADAS) ====================
  const headerY = (doc as any).lastAutoTable.finalY + 1.5;
  const pageWidth = doc.internal.pageSize.getWidth();

  // 2A. REPORTE No. (Izquierda, ancho 32mm igual al logo)
  autoTable(doc, {
    startY: headerY,
    margin: { left: M },
    tableWidth: 32,
    theme: 'grid',
    styles: { ...baseStyles, cellPadding: 1.2 },
    body: [
      [{ content: 'REPORTE No.', styles: { fontStyle: 'bold', fontSize: 6.5, halign: 'center' } }],
      [{ content: reportNo, styles: { fontSize: 11, fontStyle: 'bold', textColor: [0, 102, 51], halign: 'center' } }]
    ]
  });

  // 2B. FECHA INICIO (Centro)
  autoTable(doc, {
    startY: headerY,
    margin: { left: M + 55 },
    tableWidth: 60,
    theme: 'grid',
    styles: { ...baseStyles, cellPadding: 0.8 },
    columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 35 } },
    body: [
      [{ content: 'FECHA INICIO:', styles: { fontStyle: 'bold' } }, { content: fechaI }],
      [{ content: 'HORA:', styles: { fontStyle: 'bold' } }, { content: tiempos.inicio || '' }]
    ]
  });

  // 2C. FECHA FIN (Derecha, ancho 42mm igual a metadata)
  autoTable(doc, {
    startY: headerY,
    margin: { left: pageWidth - M - 42 },
    tableWidth: 42,
    theme: 'grid',
    styles: { ...baseStyles, cellPadding: 0.8 },
    columnStyles: { 0: { cellWidth: 18 }, 1: { cellWidth: 24 } },
    body: [
      [{ content: 'FECHA FIN:', styles: { fontStyle: 'bold' } }, { content: fechaF }],
      [{ content: 'HORA:', styles: { fontStyle: 'bold' } }, { content: tiempos.fin || '' }]
    ]
  });

  // ==================== 3. UBICACIÓN + IDENTIFICACIÓN ====================
  // Determinamos el punto más bajo de las 3 tablas anteriores
  const finalY2 = (doc as any).lastAutoTable.finalY; 
  
  autoTable(doc, {
    startY: finalY2 + 1,
    margin: { left: M, right: M },
    theme: 'grid',
    styles: { ...baseStyles, fontSize: 6.5, cellPadding: 1.2 },
    body: [
      [
        { content: 'UBICACIÓN', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } },
        { content: 'IDENTIFICACIÓN DEL EQUIPO', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }
      ],
      [{ content: 'SERVICIO:', styles: { fontStyle: 'bold', cellWidth: 22 } }, { content: s(correctiveData.servicio || equipment.servicio || equipment.ubicacion), styles: { cellWidth: 55 } }, { content: 'EQUIPO:', styles: { fontStyle: 'bold', cellWidth: 18 } }, s(correctiveData.equipo || equipment.equipo)],
      [{ content: 'UBICACION:', styles: { fontStyle: 'bold' } }, s(correctiveData.ubicacion || equipment.ubicacion), { content: 'MARCA:', styles: { fontStyle: 'bold' } }, s(correctiveData.marca || equipment.marca)],
      [{ content: 'PISO:', styles: { fontStyle: 'bold' } }, s(metadata.piso || ''), { content: 'MODELO:', styles: { fontStyle: 'bold' } }, s(correctiveData.modelo || equipment.modelo)],
      [{ content: '', colSpan: 2 }, { content: 'SERIE:', styles: { fontStyle: 'bold' } }, s(correctiveData.serie || equipment.numero_serie || equipment.serial)],
      [{ content: '', colSpan: 2 }, { content: 'ACTIVO FIJO:', styles: { fontStyle: 'bold' } }, s(correctiveData.activo_fijo || equipment.id_unico)]
    ]
  });

  // ==================== 4. TIPO DE CONTRATO ====================
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 1,
    margin: { left: M, right: M },
    theme: 'grid',
    styles: baseStyles,
    columnStyles: { 0: { cellWidth: 5 }, 1: { cellWidth: 44 }, 2: { cellWidth: 5 }, 3: { cellWidth: 44 }, 4: { cellWidth: 5 }, 5: { cellWidth: 44 }, 6: { cellWidth: 5 }, 7: { cellWidth: 44 } },
    body: [
      [{ content: 'TIPO DE CONTRATO', colSpan: 8, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }],
      [
        chk(contract === 'mantenimiento'), 'Mantenimiento',
        chk(contract === 'arriendo'), 'Arriendo',
        chk(contract === 'comodato'), 'Comodato',
        chk(contract === 'garantia'), 'Garantía'
      ]
    ],
    didParseCell,
    didDrawCell: drawCheck
  });

  // ==================== 5. PROCEDIMIENTO EJECUTADO ====================
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 1,
    margin: { left: M, right: M },
    theme: 'grid',
    styles: baseStyles,
    columnStyles: { 0: { cellWidth: 5 }, 1: { cellWidth: 44 }, 2: { cellWidth: 5 }, 3: { cellWidth: 44 }, 4: { cellWidth: 5 }, 5: { cellWidth: 44 }, 6: { cellWidth: 5 }, 7: { cellWidth: 44 } },
    body: [
      [{ content: 'PROCEDIMIENTO EJECUTADO', colSpan: 8, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }],
      [
        chk(procedure === 'alistamiento'), 'Alistamiento',
        chk(procedure === 'predictivo'), 'Predictivo',
        chk(procedure === 'seguimiento'), 'Seguimiento',
        chk(procedure === 'correctivo'), 'Correctivo'
      ],
      [
        chk(procedure === 'diagnostico'), 'Diagnóstico',
        chk(procedure === 'instalacion'), 'Instalación',
        chk(procedure === 'preventivo'), 'Preventivo',
        chk(procedure === 'preventivo no realizado'), 'Preventivo no realizado'
      ]
    ],
    didParseCell,
    didDrawCell: drawCheck
  });

  // ==================== 6. FALLA REPORTADA ====================
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 1,
    margin: { left: M, right: M },
    theme: 'grid',
    styles: baseStyles,
    body: [
      [{ content: 'FALLA REPORTADA', styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }],
      [{ content: s(correctiveData.descripcion), styles: { minCellHeight: 12, valign: 'top' } }]
    ]
  });

  // ==================== 7. REVISIONES Y TRABAJOS REALIZADOS ====================
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 1,
    margin: { left: M, right: M },
    theme: 'grid',
    styles: baseStyles,
    columnStyles: { 0: { cellWidth: 5 }, 1: { cellWidth: 44 }, 2: { cellWidth: 5 }, 3: { cellWidth: 44 }, 4: { cellWidth: 5 }, 5: { cellWidth: 44 }, 6: { cellWidth: 5 }, 7: { cellWidth: 44 } },
    body: [
      [{ content: 'REVISIONES Y TRABAJOS REALIZADOS', colSpan: 8, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }],
      [chk(checklist.limpieza), 'Limpieza integral', chk(checklist.bateria), 'Batería interna', chk(checklist.optico), 'Sistema óptico', chk(checklist.impresora), 'Impresora'],
      [chk(checklist.operacion), 'Operación General', chk(checklist.neumatico), 'Sistema neumático', chk(checklist.hidraulico), 'Sistema Hidráulico', chk(checklist.alarmas), 'Alarmas'],
      [chk(checklist.autotest), 'Autotest', chk(checklist.electronico), 'Sistema electrónico', chk(checklist.mecanico), 'Sistema mecánico', chk(checklist.accesorios), 'Accesorios'],
      [chk(checklist.pantalla), 'Pantalla (Display)', chk(checklist.electrico), 'Sistema eléctrico', chk(checklist.respaldo), 'Sistema respaldo (Bat.)', chk(checklist.software), 'Software'],
      [chk(checklist.perifericos), 'Periféricos', '', 'Otros:', '', '', '', '']
    ],
    didParseCell,
    didDrawCell: drawCheck
  });

  // ==================== 8. REPUESTOS UTILIZADOS ====================
  const repuestos = Array.isArray(metadata.repuestos) ? metadata.repuestos : [];
  const repRows = repuestos.slice(0, 3).map((r: any) => [s(r.cant), s(r.desc)]);
  while (repRows.length < 2) repRows.push(['', '']);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 1,
    margin: { left: M, right: M },
    theme: 'grid',
    styles: baseStyles,
    columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 'auto' } },
    body: [
      [{ content: 'REPUESTOS UTILIZADOS', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }],
      [{ content: 'CANTIDAD', styles: { halign: 'center', fontSize: 6 } }, { content: 'DESCRIPCIÓN:', styles: { halign: 'center', fontSize: 6 } }],
      ...repRows
    ]
  });

  // ==================== 9. OBSERVACIONES ====================
  const fullObs = [
    correctiveData.accion ? `TRABAJOS REALIZADOS: ${correctiveData.accion}` : null,
    correctiveData.observaciones ? `OBSERVACIONES: ${correctiveData.observaciones}` : null,
    correctiveData.comentarios ? `COMENTARIOS: ${correctiveData.comentarios}` : null,
    correctiveData.causa ? `CAUSA: ${correctiveData.causa}` : null
  ].filter(Boolean).join('\n');

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 1,
    margin: { left: M, right: M },
    theme: 'grid',
    styles: { ...baseStyles, cellPadding: 1.2 }, 
    body: [
      [{ content: 'OBSERVACIONES', styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }],
      [{ content: s(fullObs), styles: { minCellHeight: 35, valign: 'top', fontSize: 7.5 } }]
    ]
  });

  // ==================== 10. CONCEPTO TÉCNICO FINAL ====================
  const concepto = s(correctiveData.estado_equipo).toUpperCase();
  const isNoApto = concepto.includes('FUERA') || concepto.includes('NO APTO') || concepto.includes('MALO');
  const isApto = !isNoApto && (concepto.includes('OPERATIVO') || concepto.includes('APTO') || concepto.includes('BUENO') || concepto === '' || concepto.includes('USO'));

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 1,
    margin: { left: M, right: M },
    theme: 'grid',
    styles: { ...baseStyles, cellPadding: 1.2 },
    body: [
      [{ content: 'CONCEPTO TÉCNICO FINAL', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }],
      [{ content: 'Equipo Apto para Uso' }, { content: chk(isApto), styles: { cellWidth: 5, halign: 'center' } }],
      [{ content: 'Equipo NO Apto para Uso' }, { content: chk(isNoApto), styles: { cellWidth: 5, halign: 'center' } }]
    ],
    didParseCell,
    didDrawCell: drawCheck
  });

  // ==================== 11. FIRMAS ====================
  const tableWidth = doc.internal.pageSize.getWidth() - (M * 2);
  const halfWidth = tableWidth / 2;

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 1,
    margin: { left: M, right: M },
    theme: 'grid',
    styles: baseStyles,
    columnStyles: { 
      0: { cellWidth: halfWidth }, 
      1: { cellWidth: halfWidth } 
    },
    body: [
      [
        { content: 'FIRMA INGENIERO O TÉCNICO', styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } },
        { content: 'FIRMA RECIBIDO SERVICIO', styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }
      ],
      [{ content: '', styles: { minCellHeight: 18 } }, { content: '', styles: { minCellHeight: 18 } }],
      [
        { content: `NOMBRE: ${engineerName}\nCARGO: INGENIERO BIOMEDICO`, styles: { fontSize: 7.5 } },
        { content: 'NOMBRE:\nCARGO:', styles: { fontSize: 7.5 } }
      ]
    ],
    didParseCell,
    didDrawCell: (data: any) => {
      if (data.section === 'body' && data.row.index === 1 && data.column.index === 0 && firmaData) {
        try {
          const imgW = 35;
          const imgH = 14;
          const cellW = data.cell.width;
          const cellH = data.cell.height;
          
          // Coordenadas centradas con fallback de seguridad
          const posX = data.cell.x + (Math.max(0, cellW - imgW) / 2);
          const posY = data.cell.y + (Math.max(0, cellH - imgH) / 2);
          
          doc.addImage(firmaData, firmaFormat, posX, posY, imgW, imgH);
        } catch (e) { 
          console.error('Error al insertar firma en PDF:', e); 
        }
      }
    }
  });

  // ==================== GENERAR ====================
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  
  // Descarga automática como respaldo
  const a = document.createElement('a');
  a.href = url;
  a.download = `Correctivo_${reportNo || 'FR134'}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // No revocamos inmediatamente porque window.open lo necesita
  setTimeout(() => URL.revokeObjectURL(url), 10000);

  } catch (error: any) {
    console.error("CRASH GENERATOR:", error);
    alert("DETALLE DEL ERROR: " + error.message);
    throw error;
  }
};
