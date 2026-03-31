import { useState, useRef, useEffect } from 'react';
import { ClipboardCheck, Download, CheckSquare, Settings2, Activity, Zap, Settings, X, Edit3, Calendar, Stethoscope } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const EQUIPOS = [
  { 
    id: 'anestesia', 
    name: '1. MÁQUINA DE ANESTESIA', 
    icon: Settings,
    items: [
      'Verificación de suministro de gases medicinales (oxígeno, aire comprimido). Comprobar la presión y flujo de aire y oxígeno',
      'Funcionamiento adecuado de los vaporizadores (niveles de anestésico volátil, seguro y acople rápido).',
      'Pruebas de integridad del sistema de ventilación y chequeo de fugas (circuitos, válvulas y sensores).',
      'Alarma y sensores de presión de gases activas y funcionales.',
      'Verificación de la batería de respaldo y fuente de alimentación estable.',
      'La válvula APL y el flush de O2 funcionan adecuadamente',
      'Prueba del absorbedor de CO₂: cal sodada, asegurando que no esté saturada y que el sistema de eliminación de gases anestésicos funcione.'
    ]
  },
  { 
    id: 'monitor', 
    name: '2. MONITOR DE SIGNOS VITALES', 
    icon: Activity,
    items: [
      'Verificación de encendido y autodiagnóstico: asegurarse de que el equipo encienda correctamente y complete su prueba de inicio sin errores.',
      'Comprobar la integridad y conexión de los cables de ECG, sensor de SpO₂, manguito de presión arterial y sensor de temperatura.',
      'Prueba de alarmas y configuraciones: activar alarmas de alta y baja frecuencia cardíaca, presión arterial y SpO₂.',
      'Inspección de la batería y fuente de alimentación: comprobar el estado de la batería, su tiempo de autonomía y la correcta conexión..',
      'Verificar estado de panel de control, membranas teclado, perillas, panel táctil y modos de configuración del equipo.'
    ]
  },
  { 
    id: 'mesa', 
    name: '3. MESA DE CIRUGÍA', 
    icon: Settings2,
    items: [
      'Verificar controles y posiciones: ajuste de altura, inclinación y movimientos.',
      'Revisar estabilidad y frenos: asegurar bloqueo firme y sin deslizamientos.',
      'Inspeccionar acolchados y superficies: evitar daños que afecten asepsia o comodidad.',
      'Evaluar sistema de alimentación: revisar batería o cableado en modelos eléctricos.',
      'Comprobar capacidad de carga: verificar resistencia sin deformaciones.'
    ]
  },
  { 
    id: 'lampara', 
    name: '4. LÁMPARA CIELÍTICA', 
    icon: Zap,
    items: [
      'Verificar encendido y brillo: comprobar intensidad y estabilidad de la luz.',
      'Revisar movilidad y fijación: asegurarse de que gire y se mantenga en posición.',
      'Inspeccionar bombillas o LEDs: detectar fallos o reducción de luminosidad.',
      'Limpiar y desinfectar: retirar polvo y residuos de la superficie óptica, estado de la manija de enfoque y desenfoque',
      'Verificar panel de control y estado de los pulsadores y membrana teclado.'
    ]
  },
  { 
    id: 'electrobisturi', 
    name: '5. ELECTROBISTURÍ', 
    icon: Zap,
    items: [
      'Verificar encendido y displays: asegurarse de que muestren valores correctos.',
      'Revisar cables y electrodos: comprobar integridad y buena conexión.',
      'Probar modos de corte y coagulación: confirmar salida de energía adecuada.',
      'Evaluar pedal y activadores: chequear respuesta rápida y sin fallos.',
      'Medir placa de retorno: garantizar buena adhesión y baja resistencia.',
      'Verificar panel de control, estado de los pulsadores, membrana teclado y alarmas audibles del equipo.'
    ]
  }
];

export default function SurgeryRounds() {
  const [data, setData] = useState<Record<number, Record<string, any>>>({
    1: { lampara: { activoFijo: '541392' } },
    2: { lampara: { activoFijo: '543829' } },
    3: { lampara: { activoFijo: '546332' } },
    4: { lampara: { activoFijo: '541393' } },
    5: { lampara: { activoFijo: '546335' } },
    6: { lampara: { activoFijo: '548669' } },
    7: { lampara: { activoFijo: '541395' } },
    8: { lampara: { activoFijo: '541702' } },
  });
  const [selectedSala, setSelectedSala] = useState<number | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  // State to cache logo and signature data for PDF generation
  const [logoData, setLogoData] = useState<string | null>(null);
  // Preload logo and signature on component mount
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const resLogo = await fetch('/imagenes/logo-san-jorge.jpg');
        if (resLogo.ok) {
          const blob = await resLogo.blob();
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          setLogoData(dataUrl);
          const ct = resLogo.headers.get('content-type');
          setLogoFormat(ct && ct.includes('jpeg') ? 'JPEG' : 'PNG');
        }
      } catch (e) { /* ignore */ }
      try {
        const resFirma = await fetch('/imagenes/firma-victor-lopez.png');
        if (resFirma.ok) {
          const blob = await resFirma.blob();
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          setFirmaData(dataUrl);
          const ct = resFirma.headers.get('content-type');
          setFirmaFormat(ct && ct.includes('jpeg') ? 'JPEG' : 'PNG');
        }
      } catch (e) { /* ignore */ }
    };
    loadAssets();
  }, []);
  const [logoFormat, setLogoFormat] = useState<'PNG' | 'JPEG'>('PNG');
  const [firmaData, setFirmaData] = useState<string | null>(null);
  const [firmaFormat, setFirmaFormat] = useState<'PNG' | 'JPEG'>('PNG');
  
  // Encabezado Global de la ronda
  const [globalData, setGlobalData] = useState({
      ubicacion: 'BLOQUE QUIRÚRGICO',
      responsable: 'VICTOR LOPEZ',
      cargo: 'BIOMÉDICO HUSJ',
      fecha: new Date().toISOString().split('T')[0]
  });

  const updateActivo = (sala: number, equipo: string, value: string) => {
    setData(prev => ({ ...prev, [sala]: { ...(prev[sala] || {}), [equipo]: { ...((prev[sala] || {})[equipo] || {}), activoFijo: value } } }));
  };

  const updateCheck = (sala: number, equipo: string, itemIdx: number, value: 'C' | 'NC' | 'NA') => {
    setData(prev => ({ ...prev, [sala]: { ...(prev[sala] || {}), [equipo]: { ...((prev[sala] || {})[equipo] || {}), checks: { ...(((prev[sala] || {})[equipo] || {}).checks || {}), [itemIdx]: value } } } }));
  };

  const updateObs = (sala: number, equipo: string, value: string) => {
    setData(prev => ({ ...prev, [sala]: { ...(prev[sala] || {}), [equipo]: { ...((prev[sala] || {})[equipo] || {}), observaciones: value } } }));
  };

  const generatePDF = () => {
    // Logo and signature are preloaded in useEffect; no need to fetch here.

    const doc = new jsPDF({ format: 'letter', orientation: 'landscape' });
    const GRAY = [230, 230, 230] as [number, number, number];
    
    // ----------- CABECERAS -----------
    const drawHospitalHeader = (docObj: jsPDF, pageNum: number, totalPages: number) => {
      docObj.setFontSize(8);
      docObj.setTextColor(0);
      docObj.setFont('helvetica', 'bold');
      
      docObj.rect(10, 10, 45, 18);
      if (logoData) {
        docObj.addImage(logoData, logoFormat, 15, 12, 30, 14);
      }
      
      docObj.rect(55, 10, 160, 18);
      docObj.setFontSize(10);
      docObj.text('EMPRESA SOCIAL DEL ESTADO', 135, 15, { align: 'center' });
      docObj.text('HOSPITAL UNIVERSITARIO SAN JORGE DE PEREIRA', 135, 20, { align: 'center' });
      docObj.text('VERIFICACIÓN DIARIA DE SALAS DE CIRUGIA', 135, 25, { align: 'center' });
      
      // La suma de anchos de rectangulos: 45 + 160 = 205.
      // El origen es 10 + 205 = 215. Queremos llegar a 10+259.4 = 269.4. Asi que el ancho es 54.4
      docObj.rect(215, 10, 54.4, 18);
      docObj.setFont('helvetica', 'normal');
      docObj.setFontSize(7);
      docObj.text('CÓDIGO: GRF3MAN-FR25', 217, 14);
      docObj.text('VERSIÓN: 1.0', 217, 18);
      docObj.text(`FECHA: 02-05-2025`, 217, 22);
      docObj.text(`PÁGINA: ${pageNum} DE ${totalPages}`, 217, 26);
    };

    const buildEqRows = (eqIdxStart: number, eqIdxEnd: number) => {
       const bodyRows: any[] = [];
       EQUIPOS.slice(eqIdxStart, eqIdxEnd).forEach((eq, relativeIdx) => {
         const absoluteIdx = eqIdxStart + relativeIdx;

         // Repeating Encabezado Salas
         if (absoluteIdx > 0) {
            const rowSalasRep: any[] = [{ content: '', colSpan: 1, styles: { fillColor: GRAY } }];
            for(let s=1; s<=8; s++) {
               rowSalasRep.push({ content: `SALA #${s}`, colSpan: 3, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } });
            }
            rowSalasRep.push({ content: 'OBSERVACIONES', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: GRAY } });
            bodyRows.push(rowSalasRep);
         }

         // Activo Fijo Fila
         const rowActivo: any[] = [
            { content: 'Activo Fijo', colSpan: 1, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }
         ];
         for(let s=1; s<=8; s++) {
            rowActivo.push({ 
               content: data[s]?.[eq.id]?.activoFijo || '', 
               colSpan: 3, 
               styles: { halign: 'center', fontStyle: 'bold', fontSize: 7 } 
            });
         }
         bodyRows.push(rowActivo);

         // Fila Titulo Equipo + C NC N/A
         const rowEqHeader: any[] = [
            { content: eq.name, colSpan: 1, styles: { fontStyle: 'bold', fillColor: GRAY } }
         ];
         for(let s=1; s<=8; s++) {
            rowEqHeader.push(
               { content: 'C', colSpan: 1, styles: { halign: 'center', fillColor: GRAY, fontStyle: 'bold' } },
               { content: 'NC', colSpan: 1, styles: { halign: 'center', fillColor: GRAY, fontStyle: 'bold' } },
               { content: 'N/A', colSpan: 1, styles: { halign: 'center', fillColor: GRAY, fontStyle: 'bold' } }
            );
         }
         rowEqHeader.push({ content: '', colSpan: 1, styles: { fillColor: GRAY } }); 
         bodyRows.push(rowEqHeader);

         // Extraer Observaciones combinadas
         const obs = [];
         for(let s=1; s<=8; s++) {
            const o = data[s]?.[eq.id]?.observaciones;
            if(o) obs.push(`S${s}: ${o}`);
         }
         const obsText = obs.join('\n');

         // Filas de Items
         eq.items.forEach((checkLabel, i) => {
           const rowItem: any[] = [
              { content: checkLabel, colSpan: 1, styles: { fontSize: 6 } }
           ];
           for(let s=1; s<=8; s++) {
              const val = data[s]?.[eq.id]?.checks?.[i];
              // Use interceptor token to manually draw checkmark
              const mark = '{v}'; 
              rowItem.push(
                 { content: val === 'C' ? mark : '', styles: { halign: 'center' as const, fontStyle: 'bold' } },
                 { content: val === 'NC' ? mark : '', styles: { halign: 'center' as const, fontStyle: 'bold' } },
                 { content: val === 'N/A' ? mark : '', styles: { halign: 'center' as const, fontStyle: 'bold' } }
              );
           }
           if (i === 0) {
              rowItem.push({ content: obsText, rowSpan: eq.items.length, styles: { fontSize: 6, valign: 'top' as const } });
           }
           bodyRows.push(rowItem);
         });
       });
       return bodyRows;
    };

    const parseCellHook = (hookData: any) => {
       if (hookData.cell.raw && hookData.cell.raw.content === '{v}') {
          hookData.cell.text = [''];
       }
    };

    const drawCellHook = (data: any) => {
       if (data.row.index === 1 && data.column.index === 0 && firmaData) {
         const sigW = 32;
         const sigH = 12;
         doc.addImage(firmaData, firmaFormat, data.cell.x + (data.cell.width - sigW) / 2, data.cell.y + 4, sigW, sigH);
       }
       if (data.cell.raw && data.cell.raw.content === '{v}') {
          doc.setDrawColor(15, 20, 25);
          doc.setLineWidth(0.6);
          const rx = data.cell.x + (data.cell.width / 2) - 1;
          const ry = data.cell.y + (data.cell.height / 2);
          doc.line(rx - 1.5, ry - 0.5, rx, ry + 1.5);
          doc.line(rx, ry + 1.5, rx + 3, ry - 2.5);
       }
    };

    // --- PÁGINA 1 ---
    drawHospitalHeader(doc, 1, 2);
    const bodyDataPage1: any[] = [];
    
    // Convertir de YYYY-MM-DD a DD-MM-YYYY
    const formattedDate = globalData.fecha.split('-').reverse().join('-');
    
    // Fila 1: Ubicación y Fecha combinados
    bodyDataPage1.push([
      { content: `UBICACIÓN:     ${globalData.ubicacion}`, colSpan: 13, styles: { fontStyle: 'bold' } },
      { content: `FECHA:     ${formattedDate}`, colSpan: 12, styles: { fontStyle: 'bold', halign: 'right' } },
      { content: '', colSpan: 1 } // Observaciones column space
    ]);
    // Fila 2: Responsable
    bodyDataPage1.push([
      { content: `RESPONSABLE:   ${globalData.responsable}`, colSpan: 1, styles: { fontStyle: 'bold' } },
      { content: 'VERIFICACIÓN DIARIA', colSpan: 24, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } },
      { content: '', colSpan: 1 }
    ]);
    // Fila 3: Cargo y Salas (Sólo para el primer equipo)
    const rowCargo: any[] = [
      { content: `CARGO:         ${globalData.cargo}`, colSpan: 1, styles: { fontStyle: 'bold' } }
    ];
    for(let s=1; s<=8; s++) {
      rowCargo.push({ content: `SALA #${s}`, colSpan: 3, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } });
    }
    rowCargo.push({ content: 'OBSERVACIONES', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: GRAY } });
    bodyDataPage1.push(rowCargo);

    bodyDataPage1.push(...buildEqRows(0, 3)); // 0 = Maquina, 1 = Monitor, 2 = Mesa

    autoTable(doc, {
      startY: 32, // Just below the hospital header rects
      margin: { left: 10, right: 10 },
      tableWidth: 259.4,
      body: bodyDataPage1,
      theme: 'grid',
      styles: { fontSize: 6, cellPadding: 0.8, textColor: 0, lineColor: 0, lineWidth: 0.1 },
      columnStyles: {
         0: { cellWidth: 70 }, // Texto items / Cabeceras Izquierdas
         25: { cellWidth: 35 } // Observaciones
      },
      didParseCell: parseCellHook,
      didDrawCell: drawCellHook
    });

    // --- PÁGINA 2 ---
    doc.addPage('a4', 'landscape');
    drawHospitalHeader(doc, 2, 2);
    
    const bodyDataPage2: any[] = buildEqRows(3, EQUIPOS.length); // 3 = Lampara, 4 = Electrobisturi
    
    // --- OBSERVACIONES GENERALES FINAL ---
    bodyDataPage2.push([
       { content: 'OBSERVACIONES', colSpan: 26, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }
    ]);
    for(let i=0; i<6; i++) {
       bodyDataPage2.push([
          { content: '', colSpan: 26, styles: { minCellHeight: 6 } }
       ]);
    }

    autoTable(doc, {
      startY: 32,
      margin: { left: 10, right: 10 },
      tableWidth: 259.4,
      body: bodyDataPage2,
      theme: 'grid',
      styles: { fontSize: 6, cellPadding: 0.8, textColor: 0, lineColor: 0, lineWidth: 0.1 },
      columnStyles: {
         0: { cellWidth: 70 },
         25: { cellWidth: 35 }
      },
      didParseCell: parseCellHook,
      didDrawCell: drawCellHook
    });

    const lastYPage2 = (doc as any).lastAutoTable.finalY + 5;

    // --- PIE DE PÁGINA FIX ---
    autoTable(doc, {
      startY: lastYPage2,
      margin: { left: 10, right: 10 },
      tableWidth: 259.4,
      body: [
          [
             { content: 'RESPONSABLE DEL SERVICIO', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fillColor: GRAY } }
          ],
          [
             { content: 'NOMBRE', styles: { fontStyle: 'bold', fillColor: GRAY } },
             { content: '' }, // Firma space
             { content: 'CARGO', styles: { fontStyle: 'bold', fillColor: GRAY } },
             { content: '' }
          ],
          [
             { content: 'FECHA', styles: { fontStyle: 'bold', fillColor: GRAY } },
             { content: '' },
             { content: 'CONVENCIONES', styles: { fontStyle: 'bold', fillColor: GRAY } },
             { content: 'C = CUMPLE      NC = NO CUMPLE      N/A = NO APLICA', styles: { fontStyle: 'bold', halign: 'center' } }
          ]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1.5, textColor: 0, lineColor: 0, lineWidth: 0.1 },
      columnStyles: {
         0: { cellWidth: 35 }, // Header column 1
         1: { cellWidth: 90 }, // Spacer column for signature
         2: { cellWidth: 35 }, // Header column 2
         3: { cellWidth: 99.4 } // Spacer column 2
      }
    });

      // Manual download with fallback: open PDF in a new tab first to ensure permission, then trigger download
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      // Open in new tab (user can manually save if automatic download is blocked)
      window.open(url, '_blank');
      // Trigger automatic download as before
      const a = document.createElement('a');
      a.href = url;
      a.download = `Formato_Rondas_Cirugia_HUSJ_${formattedDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto h-screen relative z-10 custom-scrollbar">
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 backdrop-blur-sm">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-500 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] tracking-wide">
            Rondas Quirófanos
          </h2>
          <p className="text-white/60 font-light mt-2 md:mt-3 text-base md:text-lg tracking-wide">
            Lista de chequeo verificación y parámetros técnicos
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 w-full md:w-auto">
          <div 
            className="bg-black/40 border border-teal-500/30 rounded-2xl px-4 py-3 flex items-center gap-3 hover:border-teal-400 transition-all cursor-pointer flex-1 md:flex-none"
            onClick={() => {
               try { dateInputRef.current?.showPicker(); } catch(e) { dateInputRef.current?.focus(); }
            }}
          >
             <Calendar size={18} className="text-teal-400" />
             <input 
               ref={dateInputRef}
               type="date"
               value={globalData.fecha}
               onChange={(e) => setGlobalData(prev => ({ ...prev, fecha: e.target.value }))}
               className="bg-transparent text-white focus:outline-none w-full md:w-32 text-sm font-mono tracking-wide [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 cursor-pointer"
             />
          </div>
          <button 
            onClick={generatePDF}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium hover:scale-105 transition-all shadow-[0_0_20px_rgba(20,184,166,0.4)] border border-teal-300/50 flex items-center justify-center gap-2 cursor-pointer flex-1 md:flex-none"
          >
            <Download size={18} /> <span className="text-sm md:text-base">Exportar Acta</span>
          </button>
        </div>
      </header>

      {/* Accordion de Salas */}
      <div className="space-y-4 md:space-y-6 mb-12 max-w-5xl mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(sala => (
          <div key={sala} className="overflow-hidden">
            <button
              onClick={() => setSelectedSala(selectedSala === sala ? null : sala)}
              className={`w-full p-4 md:p-6 lg:p-8 rounded-[2rem] border transition-all text-left relative overflow-hidden group flex items-center justify-between ${
                selectedSala === sala 
                  ? 'bg-teal-500/20 border-teal-400 shadow-[0_0_40px_rgba(45,212,191,0.15)] ring-1 ring-teal-400/30' 
                  : 'bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20'
              }`}
            >
              <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] transition-all duration-700 opacity-40 ${selectedSala === sala ? 'bg-teal-500/60' : 'bg-transparent group-hover:bg-teal-500/20'}`}></div>
              
              <div className="relative z-10 flex items-center gap-6 md:gap-8">
                 <div className={`w-14 h-14 md:w-16 md:h-16 rounded-3xl flex items-center justify-center transition-all duration-500 ${selectedSala === sala ? 'bg-teal-500 text-white shadow-lg' : 'bg-white/5 text-white/40 group-hover:bg-teal-500/20 group-hover:text-teal-400'}`}>
                    <Stethoscope size={selectedSala === sala ? 32 : 28} className="transition-transform duration-500" />
                 </div>
                 <div>
                    <h3 className={`text-2xl md:text-3xl font-black tracking-tight ${selectedSala === sala ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>SALA #{sala}</h3>
                    <p className="text-white/40 text-[10px] md:text-xs uppercase font-bold tracking-widest mt-1 flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${selectedSala === sala ? 'bg-teal-400 animate-pulse' : 'bg-white/20'}`}></div>
                      {selectedSala === sala ? 'Auditando ahora' : 'Quirófano disponible'}
                    </p>
                 </div>
              </div>
              
              <div className="relative z-10 hidden sm:flex flex-col items-end gap-2 pr-2">
                 <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${selectedSala === sala ? 'bg-teal-500/40 border-teal-400 text-white rotate-180' : 'bg-white/5 border-white/10 text-white/30 group-hover:border-white/30'}`}>
                   <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                 </div>
              </div>
            </button>

            {/* Contenido de la Sala (Toggle Inline) */}
            {selectedSala === sala && (
              <div className="mt-4 md:mt-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-4 md:p-8 lg:p-10 backdrop-blur-3xl animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl relative">
                  <div className="absolute top-0 left-10 w-px h-10 bg-gradient-to-b from-teal-500/50 to-transparent"></div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 border-b border-white/5 pb-8">
                    <h3 className="text-2xl md:text-3xl text-teal-300 font-bold flex items-center gap-4">
                      <CheckSquare size={32} className="text-teal-400" />
                      Auditoría Quirúrgica
                    </h3>
                    <div className="px-5 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-[10px] font-black uppercase tracking-[0.2em] shadow-inner">
                      SALA #{sala} - BioMed HUSJ
                    </div>
                  </div>

                  <div className="space-y-12 md:space-y-16">
                    {EQUIPOS.map((eq) => {
                      const eqData = data[selectedSala]?.[eq.id] || {};
                      const Icon = eq.icon;
                      return (
                        <div key={eq.id} className="relative group/eq">
                          {/* Header Equipo - Responsive Refactor */}
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6 mb-8 bg-white/[0.03] p-4 md:p-6 rounded-3xl border border-white/5 transition-all group-hover/eq:border-teal-500/20 shadow-md">
                            <h4 className="text-xl md:text-2xl text-white font-bold flex items-center gap-4">
                              <div className="p-3 md:p-4 bg-teal-500/15 rounded-2xl text-teal-400 border border-teal-500/20 group-hover/eq:scale-110 transition-transform shadow-lg">
                                <Icon size={24} />
                              </div>
                              <span className="tracking-tight">{eq.name}</span>
                            </h4>
                            <div className="flex items-center gap-4 w-full lg:w-auto bg-black/40 p-2 pl-4 rounded-2xl border border-white/5">
                              <span className="text-white/30 text-[9px] md:text-[10px] uppercase font-black tracking-widest whitespace-nowrap">Activo Fijo:</span>
                              <input 
                                type="text" 
                                value={eqData.activoFijo || ''} 
                                onChange={e => updateActivo(selectedSala, eq.id, e.target.value)}
                                placeholder="Ej: 541392"
                                className="bg-transparent border-none text-teal-200 text-base md:text-lg focus:outline-none w-full lg:w-32 font-bold font-mono placeholder:text-white/10"
                              />
                            </div>
                          </div>

                          {/* Desktop Tablet Table */}
                          <div className="hidden md:block bg-black/30 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                            <table className="w-full text-left">
                              <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                  <th className="py-5 px-8 text-white/50 text-[10px] font-black uppercase tracking-[0.2em] w-3/5">Parámetro de Verificación</th>
                                  <th className="py-5 px-4 text-emerald-400/80 text-[10px] font-black uppercase tracking-[0.2em] text-center">CUMPLE</th>
                                  <th className="py-5 px-4 text-orange-400/80 text-[10px] font-black uppercase tracking-[0.2em] text-center">NO CUMPLE</th>
                                  <th className="py-5 px-4 text-white/30 text-[10px] font-black uppercase tracking-[0.2em] text-center">N/A</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {eq.items.map((item, idx) => {
                                  const val = eqData.checks?.[idx];
                                  return (
                                    <tr key={idx} className="hover:bg-white/[0.04] transition-colors group/row">
                                      <td className="py-6 px-8 text-white/80 text-sm font-light tracking-wide leading-relaxed pr-10">{item}</td>
                                      <td className="py-6 px-4 text-center align-middle">
                                        <button onClick={() => updateCheck(selectedSala, eq.id, idx, 'C')} className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all mx-auto ${val === 'C' ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg scale-110' : 'border-white/10 bg-black/20 text-transparent hover:border-emerald-400/50 hover:bg-emerald-500/10'}`}>
                                          <CheckSquare size={20} className={val === 'C' ? 'opacity-100' : 'opacity-0'} />
                                        </button>
                                      </td>
                                      <td className="py-6 px-4 text-center align-middle">
                                        <button onClick={() => updateCheck(selectedSala, eq.id, idx, 'NC')} className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all mx-auto ${val === 'NC' ? 'bg-orange-600 border-orange-400 text-white shadow-lg scale-110' : 'border-white/10 bg-black/20 text-transparent hover:border-orange-400/50 hover:bg-orange-500/10'}`}>
                                          <X size={20} className={val === 'NC' ? 'opacity-100' : 'opacity-0'} />
                                        </button>
                                      </td>
                                      <td className="py-6 px-4 text-center align-middle">
                                        <button onClick={() => updateCheck(selectedSala, eq.id, idx, 'NA')} className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all mx-auto ${val === 'NA' ? 'bg-slate-600 border-slate-400 text-white shadow-lg scale-110' : 'border-white/10 bg-black/20 text-transparent hover:border-slate-400/50'}`}>
                                          <span className={`text-[11px] font-black ${val === 'NA' ? 'opacity-100' : 'opacity-0'}`}>NA</span>
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile View - Card based checklist */}
                          <div className="md:hidden space-y-4">
                             {eq.items.map((item, idx) => {
                               const val = eqData.checks?.[idx];
                               return (
                                 <div key={idx} className="bg-black/30 p-5 rounded-3xl border border-white/10 space-y-5">
                                    <p className="text-white/80 text-sm font-light leading-relaxed">{item}</p>
                                    <div className="grid grid-cols-3 gap-3">
                                       <button 
                                          onClick={() => updateCheck(selectedSala, eq.id, idx, 'C')}
                                          className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${val === 'C' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-inner' : 'bg-white/5 border-white/10 text-white/30'}`}
                                       >
                                          <CheckSquare size={20} />
                                          <span className="text-[10px] font-black uppercase">Cumple</span>
                                       </button>
                                       <button 
                                          onClick={() => updateCheck(selectedSala, eq.id, idx, 'NC')}
                                          className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${val === 'NC' ? 'bg-orange-500/20 border-orange-400 text-orange-400 shadow-inner' : 'bg-white/5 border-white/10 text-white/30'}`}
                                       >
                                          <X size={20} />
                                          <span className="text-[10px] font-black uppercase">No NC</span>
                                       </button>
                                       <button 
                                          onClick={() => updateCheck(selectedSala, eq.id, idx, 'NA')}
                                          className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${val === 'NA' ? 'bg-slate-500/20 border-slate-400 text-slate-300 shadow-inner' : 'bg-white/5 border-white/10 text-white/30'}`}
                                       >
                                          <span className="text-sm font-black">NA</span>
                                          <span className="text-[10px] font-black uppercase">N/A</span>
                                       </button>
                                    </div>
                                 </div>
                               );
                             })}
                          </div>
                          
                          {/* Observaciones extra box por equipo */}
                          <div className="mt-6 flex flex-col md:flex-row items-start gap-4 p-5 border border-white/10 border-dashed rounded-[2rem] bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                             <div className="flex items-center gap-3 text-teal-400">
                                <Edit3 size={18} />
                                <span className="text-[11px] font-black uppercase tracking-widest">Observaciones</span>
                             </div>
                             <textarea 
                                className="w-full bg-transparent border-none outline-none text-white/70 text-base font-light resize-none h-16 custom-scrollbar placeholder:text-white/10 mt-1"
                                placeholder="..."
                                value={eqData.observaciones || ''}
                                onChange={e => updateObs(selectedSala, eq.id, e.target.value)}
                             />
                          </div>
                        </div>
                      );
                    })}
                  </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
