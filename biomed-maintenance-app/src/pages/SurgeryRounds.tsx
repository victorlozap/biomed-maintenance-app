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
      <header className="mb-12 flex justify-between items-end backdrop-blur-sm">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-500 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] tracking-wide">
            Rondas Quirófanos
          </h2>
          <p className="text-white/60 font-light mt-3 text-lg tracking-wide">
            Lista de chequeo verificación y parámetros técnicos
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
          <div 
            className="bg-black/40 border border-teal-500/30 rounded-2xl px-4 py-3 flex items-center gap-3 hover:border-teal-400 transition-all cursor-pointer"
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
               className="bg-transparent text-white focus:outline-none w-32 text-sm font-mono tracking-wide [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 cursor-pointer"
             />
          </div>
          <button 
            onClick={generatePDF}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium hover:scale-105 transition-all shadow-[0_0_20px_rgba(20,184,166,0.4)] border border-teal-300/50 flex items-center gap-2 cursor-pointer"
          >
            <Download size={18} /> Exportar Formato HUSJ
          </button>
        </div>
      </header>

      {/* Grid de Salas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6 mb-12">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(sala => (
          <button
            key={sala}
            onClick={() => setSelectedSala(sala)}
            className={`p-3 md:p-4 lg:p-6 rounded-3xl border transition-all text-left relative overflow-hidden group ${
              selectedSala === sala 
                ? 'bg-teal-500/20 border-teal-400 shadow-[0_0_25px_rgba(45,212,191,0.2)]' 
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
            }`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] transition-all opacity-50 ${selectedSala === sala ? 'bg-teal-500' : 'bg-zinc-600 group-hover:bg-teal-500/30'}`}></div>
            <div className="relative z-10 flex justify-between items-start mb-2">
               <h3 className={`text-2xl font-bold ${selectedSala === sala ? 'text-teal-300' : 'text-white'}`}>SALA #{sala}</h3>
               <Stethoscope size={28} className={`transition-all ${selectedSala === sala ? 'text-teal-400 scale-110 drop-shadow-[0_0_10px_rgba(45,212,191,0.6)]' : 'text-white/20 group-hover:text-white/40 group-hover:scale-110'}`} />
            </div>
            <p className="text-white/40 font-light mt-2 relative z-10 flex items-center gap-2">
              <ClipboardCheck size={14} /> Seleccionar quirófano
            </p>
          </button>
        ))}
      </div>

      {/* Editor de la Sala Seleccionada */}
      {selectedSala && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 md:p-6 lg:p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl md:text-2xl lg:text-3xl text-teal-300 font-bold mb-8 flex items-center gap-3 border-b border-white/10 pb-4">
            <CheckSquare size={28} /> Auditando SALA #{selectedSala}
          </h3>

          <div className="space-y-8">
            {EQUIPOS.map((eq) => {
              const eqData = data[selectedSala]?.[eq.id] || {};
              const Icon = eq.icon;
              return (
                <div key={eq.id} className="bg-black/20 rounded-2xl p-3 md:p-4 lg:p-6 border border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg text-white font-medium flex items-center gap-3">
                      <div className="p-2 bg-teal-500/20 rounded-lg text-teal-400 border border-teal-500/20">
                        <Icon size={18} />
                      </div>
                      <span className="tracking-wide">{eq.name}</span>
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Activo Fijo:</span>
                      <input 
                        type="text" 
                        value={eqData.activoFijo || ''} 
                        onChange={e => updateActivo(selectedSala, eq.id, e.target.value)}
                        placeholder="Ej: 541392"
                        className="bg-black/40 border border-teal-500/30 rounded-lg px-4 py-2 text-teal-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-[#111827] border-b border-white/10">
                        <tr>
                          <th className="py-3 px-5 text-white/50 text-[10px] font-bold uppercase tracking-widest w-2/3">Requerimiento HUSJ</th>
                          <th className="py-3 px-5 text-emerald-400/80 text-[10px] font-bold uppercase tracking-widest text-center">CUMPLE</th>
                          <th className="py-3 px-5 text-orange-400/80 text-[10px] font-bold uppercase tracking-widest text-center">NC</th>
                          <th className="py-3 px-5 text-white/40 text-[10px] font-bold uppercase tracking-widest text-center">N/A</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {eq.items.map((item, idx) => {
                          const val = eqData.checks?.[idx];
                          return (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                              <td className="py-4 px-5 text-white/80 text-xs font-light tracking-wide leading-relaxed">{item}</td>
                              <td className="py-4 px-5 text-center align-middle">
                                <button onClick={() => updateCheck(selectedSala, eq.id, idx, 'C')} className={`w-7 h-7 rounded-md flex items-center justify-center border transition-all mx-auto ${val === 'C' ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'border-white/10 bg-black/20 text-transparent hover:border-emerald-400/50'}`}>
                                  {val === 'C' && <CheckSquare size={16} />}
                                </button>
                              </td>
                              <td className="py-4 px-5 text-center align-middle">
                                <button onClick={() => updateCheck(selectedSala, eq.id, idx, 'NC')} className={`w-7 h-7 rounded-md flex items-center justify-center border transition-all mx-auto ${val === 'NC' ? 'bg-orange-500 border-orange-400 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'border-white/10 bg-black/20 text-transparent hover:border-orange-400/50'}`}>
                                  {val === 'NC' && <X size={16} />}
                                </button>
                              </td>
                              <td className="py-4 px-5 text-center align-middle">
                                <button onClick={() => updateCheck(selectedSala, eq.id, idx, 'NA')} className={`w-7 h-7 rounded-md flex items-center justify-center border transition-all mx-auto ${val === 'NA' ? 'bg-slate-600 border-slate-400 text-white shadow-[0_0_15px_rgba(71,85,105,0.4)]' : 'border-white/10 bg-black/20 text-transparent hover:border-slate-400/50'}`}>
                                  {val === 'NA' && <span className="text-[10px] font-bold">NA</span>}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Observaciones extra box por equipo */}
                  <div className="mt-4 flex items-start gap-4 p-4 border border-white/10 border-dashed rounded-xl bg-white/[0.02]">
                     <Edit3 size={16} className="text-white/30 mt-1" />
                     <textarea 
                        className="w-full bg-transparent border-none outline-none text-white/70 text-sm font-light resize-none h-10 custom-scrollbar placeholder:text-white/20"
                        placeholder="Observaciones de esta sala..."
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
  );
}
