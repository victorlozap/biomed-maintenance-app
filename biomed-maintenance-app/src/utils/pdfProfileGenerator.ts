import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getEnrichedEquipmentSpecs } from './equipmentCatalogSpecs';

/**
 * Generador oficial de Hoja de Vida en PDF
 * Cumple estrictamente con el formato institucional GRF3MAN-FR18 VERSIÓN 5.0 (06-04-2026)
 * Hospital Universitario San Jorge de Pereira
 */
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

  // Enriquecer datos con catálogo técnico oficial y entregas contrastadas (AS-12248)
  const eq = getEnrichedEquipmentSpecs(equipment);

  const calibracionVal = String(eq.RequiereCalibracion || '').toLowerCase();
  const calibracionSI = (calibracionVal === 'si' || calibracionVal === 'sí' || calibracionVal === 'yes' || calibracionVal === '1' || calibracionVal === 'true' || Boolean(eq.FechaCalibracion));

  const tecControladaVal = String(eq.TecnologiaControlada || '').toLowerCase();
  const tecControladaSI = (tecControladaVal === 'si' || tecControladaVal === 'sí' || tecControladaVal === 'true' || tecControladaVal === '1');

  const esLegal = String(eq.CalibracionTipo || '').toLowerCase().includes('legal');

  const doc = new jsPDF({ format: 'letter', unit: 'mm' });
  const GRAY: [number, number, number] = [230, 235, 240];
  const DARK: [number, number, number] = [20, 20, 20];
  const LINE_COLOR: [number, number, number] = [60, 60, 60];

  // --- ENCABEZADO INSTITUCIONAL HUSJ ---
  autoTable(doc, {
    startY: 8,
    margin: { left: 8, right: 8 },
    theme: 'grid',
    styles: { lineWidth: 0.3, lineColor: LINE_COLOR, textColor: DARK, fontSize: 7.5, halign: 'center', valign: 'middle', cellPadding: 1.5 },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 'auto', fontStyle: 'bold' },
      2: { cellWidth: 46, halign: 'left', fontSize: 6.8 }
    },
    body: [
      [
        { content: '', rowSpan: 2, styles: { minCellHeight: 18 } },
        { content: `EMPRESA SOCIAL DEL ESTADO\nHOSPITAL UNIVERSITARIO SAN JORGE DE PEREIRA`, styles: { fontStyle: 'bold', halign: 'center', fontSize: 8.5 } },
        { content: `CÓDIGO: GRF3MAN-FR18\nVERSIÓN: 5.0\nFECHA: 06-04-2026\nPÁGINA: 1 DE 1`, rowSpan: 2 }
      ],
      [
        { content: `HOJA DE VIDA EQUIPOS MÉDICOS`, styles: { fontStyle: 'bold', halign: 'center', fontSize: 9 } }
      ]
    ],
    didDrawCell: (data: any) => {
       if (data.row.index === 0 && data.column.index === 0) {
          if (logoData) {
             doc.addImage(logoData, logoFormat, data.cell.x + 2, data.cell.y + 2, 28, 14);
          } else {
             doc.setFontSize(7);
             doc.text("Logo HUSJ", data.cell.x + 16, data.cell.y + 10, { align: "center" });
          }
       }
    }
  });

  const bodyStyles = { lineWidth: 0.3, lineColor: LINE_COLOR, textColor: DARK, fontSize: 7, cellPadding: { top: 1.2, bottom: 1.2, left: 1.5, right: 1.5 } };

  // --- SECCIÓN 1: IDENTIFICACION DEL EQUIPO ---
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 1.5,
    margin: { left: 8, right: 8 },
    theme: 'grid',
    styles: bodyStyles,
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold', fillColor: GRAY },
      1: { cellWidth: 68 },
      2: { cellWidth: 42, fontStyle: 'bold', fillColor: GRAY },
      3: { cellWidth: 'auto' }
    },
    body: [
      [{ content: 'IDENTIFICACION DEL EQUIPO', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY, fontSize: 7.5 } }],
      ['EQUIPO', String(eq.Equipo || '').toUpperCase(), 'FECHA DE COMPRA', eq.FechaCompra || ''],
      ['MARCA:', String(eq.Marca || '').toUpperCase(), 'FECHA DE INSTALACION', eq.FechaInstalacion || ''],
      ['MODELO:', String(eq.Modelo || '').toUpperCase(), 'FORMA DE ADQUISICION', String(eq.FormaAdquisicion || '').toUpperCase()],
      ['SERIE:', String(eq.NumeroSerie || '').toUpperCase(), 'PROVEEDOR', String(eq.Proveedor || '').toUpperCase()],
      ['ACTIVO FIJO', String(eq.Id_Unico || '').toUpperCase(), 'DIRECCIÓN', eq.Direccion || ''],
      ['SERVICIO:', String(eq.Servicio || '').toUpperCase(), 'CIUDAD:', String(eq.Ciudad || '').toUpperCase()],
      ['UBICACIÓN', String(eq.Ubicacion || '').toUpperCase(), 'TELÉFONO:', eq.Telefono || ''],
      ['VALOR DE ADQUISICION', eq.ValorAdquisicion ? `$ ${eq.ValorAdquisicion}` : '', 'GARANTIA', eq.Garantia || '']
    ]
  });

  // --- SECCIÓN 2: USO PREVISTO DE LA TECNOLOGIA BIOMEDICA ---
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 1.5,
    margin: { left: 8, right: 8 },
    theme: 'grid',
    styles: bodyStyles,
    body: [
      [{ content: 'USO PREVISTO DE LA TECNOLOGIA BIOMEDICA', styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY, fontSize: 7.5 } }],
      [{
        content: eq.UsoPrevisto || 'EQUIPO DESTINADO PARA LA ATENCIÓN, MONITOREO O SOPORTE CLÍNICO ASISTENCIAL DE PACIENTES SEGÚN ESPECIFICACIONES TÉCNICAS DEL FABRICANTE Y PROTOCOLOS ASISTENCIALES DEL HOSPITAL UNIVERSITARIO SAN JORGE.',
        styles: { minCellHeight: 11, valign: 'middle' }
      }]
    ]
  });

  // --- SECCIÓN 3: CLASIFICACION Y RIESGO ---
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 1.5,
    margin: { left: 8, right: 8 },
    theme: 'grid',
    styles: bodyStyles,
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold', fillColor: GRAY },
      1: { cellWidth: 58 },
      2: { cellWidth: 48, fontStyle: 'bold', fillColor: GRAY },
      3: { cellWidth: 'auto' }
    },
    body: [
      [{ content: 'CLASIFICACION Y RIESGO', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY, fontSize: 7.5 } }],
      ['CALSIFICACION BIOMEDICA', String(eq.ClasificacionBiomedica || '').toUpperCase(), 'PERMISO DE COMERCIALIZACIÓN', String(eq.PermisoComercializacion || '').toUpperCase()],
      ['CLASIFICACIÓN DE RIESGO :', String(eq.Riesgo || '').toUpperCase(), 'FUENTE DE ENERGIA', String(eq.FuenteEnergia || '').toUpperCase()],
      ['REGISTRO SANITARIO:', String(eq.RegistroInvima || '').toUpperCase(), 'TECNOLOGÍA CONTROLADA', tecControladaSI ? '[X] SI    [  ] NO' : '[  ] SI    [X] NO']
    ]
  });

  // --- SECCIÓN 4: CARACTERISTICAS TÉCNICAS Y CONDICIONES DE CALIDAD ---
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 1.5,
    margin: { left: 8, right: 8 },
    theme: 'grid',
    styles: bodyStyles,
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold', fillColor: GRAY },
      1: { cellWidth: 68 },
      2: { cellWidth: 48, fontStyle: 'bold', fillColor: GRAY },
      3: { cellWidth: 'auto' }
    },
    body: [
      [{ content: 'CARACTERISTICAS TÉCNICAS Y CONDICIONES DE CALIDAD', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY, fontSize: 7.5 } }],
      ['VOLTAJE:', eq.Voltaje || '110 - 120 VAC', 'FRECUENCIA DE MANTENIMIENTO', String(eq.Frecuencia || 'SEMESTRAL').toUpperCase()],
      ['CORRIENTE:', eq.Corriente || 'N/A', 'CALIBRACIÓN:', calibracionSI ? '[X] SI    [  ] NO' : '[  ] SI    [X] NO'],
      ['POTENCIA:', eq.Potencia || 'N/A', 'TIPO DE CALIBRACIÓN:', calibracionSI ? (esLegal ? '[  ] TRAZABLE    [X] LEGAL' : '[X] TRAZABLE    [  ] LEGAL') : '[  ] TRAZABLE    [  ] LEGAL'],
      ['FRECUENCIA:', eq.FrecuenciaElectrica || '60 Hz', 'VARIABLES A MEDIR', String(eq.VariablesMedir || 'N/A').toUpperCase()]
    ]
  });

  // --- SECCIÓN 5: PLANOS MANUALES ---
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 1.5,
    margin: { left: 8, right: 8 },
    theme: 'grid',
    styles: bodyStyles,
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold', fillColor: GRAY },
      1: { cellWidth: 38 },
      2: { cellWidth: 20, fontStyle: 'bold', fillColor: GRAY },
      3: { cellWidth: 35 },
      4: { cellWidth: 25, fontStyle: 'bold', fillColor: GRAY },
      5: { cellWidth: 'auto' }
    },
    body: [
      [{ content: 'PLANOS MANUALES', colSpan: 6, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY, fontSize: 7.5 } }],
      ['CÓDIGO MANUAL:', eq.CodigoManual || 'N/A', 'PLANOS:', eq.Planos || 'ELECTRÓNICOS', 'OPERACIÓN:', eq.Operacion || 'DISPONIBLE'],
      ['IDIOMA:', eq.Idioma || 'ESPAÑOL', 'SERVICIO:', eq.ServicioManual || 'DISPONIBLE', '', '']
    ]
  });

  // --- SECCIÓN 6: ACCESORIOS ---
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 1.5,
    margin: { left: 8, right: 8 },
    theme: 'grid',
    styles: bodyStyles,
    body: [
      [{ content: 'ACCESORIOS', styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY, fontSize: 7.5 } }],
      [{
        content: eq.Accesorios || 'Cables de alimentación eléctrica grado médico, sensores o transductores según configuración, y manuales operativos correspondientes.',
        styles: { minCellHeight: 9, valign: 'middle' }
      }]
    ]
  });

  // --- SECCIÓN 7: CONDICIONES DE USO ---
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 1.5,
    margin: { left: 8, right: 8 },
    theme: 'grid',
    styles: bodyStyles,
    body: [
      [{ content: 'CONDICIONES DE USO', styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY, fontSize: 7.5 } }],
      [{
        content: eq.CondicionesUso || 'Operación por personal asistencial capacitado, verificar conexión a tierra y red regulada, cumplir estrictamente con los protocolos de limpieza y desinfección institucional y no manipular sellos de calibración/mantenimiento.',
        styles: { minCellHeight: 10, valign: 'middle' }
      }]
    ]
  });

  const filename = `HV_GRF3MAN-FR18_v5_${eq.Id_Unico || 'Equipo'}.pdf`;
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
