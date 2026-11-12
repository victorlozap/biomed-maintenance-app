/**
 * Catálogo Autorizado de Especificaciones Técnicas y Hojas de Vida
 * Derivado de los expedientes oficiales de entrega:
 * - Carpeta AS-12248 (Cotización No. AS-12248 / Sociedad de Mejoras de Pereira / Electromédica Equipos Médicos S.A.S.)
 * - Resoluciones INVIMA, Fichas Técnicas del Fabricante y Actas de Entrega Técnica y Administrativa.
 */

export interface ModelSpec {
  equipoOficial: string;
  marca: string;
  modelo: string;
  clasificacionBiomedica: string;
  riesgo: string;
  permisoComercializacion: string;
  registroInvima: string;
  fuenteEnergia: string;
  tecnologiaControlada: string;
  voltaje: string;
  corriente: string;
  potencia: string;
  frecuenciaElectrica: string;
  frecuenciaMantenimiento: string;
  requiereCalibracion: string;
  calibracionTipo: string;
  variablesMedir: string;
  codigoManual: string;
  planos: string;
  operacion: string;
  idioma: string;
  servicioManual: string;
  proveedor: string;
  direccionProveedor: string;
  ciudadProveedor: string;
  telefonoProveedor: string;
  formaAdquisicion: string;
  garantia: string;
  usoPrevisto: string;
  accesorios: string;
  condicionesUso: string;
}

export const AS12248_CATALOG: Record<string, ModelSpec> = {
  // 1. MONITOR DE SIGNOS VITALES EDAN X8
  'X8': {
    equipoOficial: 'MONITOR DE SIGNOS VITALES',
    marca: 'EDAN',
    modelo: 'X8',
    clasificacionBiomedica: 'DIAGNÓSTICO Y MONITOREO FISIOLÓGICO',
    riesgo: 'IIB',
    permisoComercializacion: 'PERMISO DE COMERCIALIZACIÓN',
    registroInvima: 'INVIMA 2019EBC-0002816-R1',
    fuenteEnergia: 'ELÉCTRICA 100 - 240 VAC / BATERÍA RECARGABLE LI-ION',
    tecnologiaControlada: 'NO',
    voltaje: '100 - 240 VAC (50/60 Hz)',
    corriente: '1.4 - 0.7 A',
    potencia: '70 VA',
    frecuenciaElectrica: '50 / 60 Hz',
    frecuenciaMantenimiento: 'SEMESTRAL',
    requiereCalibracion: 'SI',
    calibracionTipo: 'TRAZABLE',
    variablesMedir: 'PRESIÓN NO INVASIVA (PNI/NIBP en mmHg), SATURACIÓN DE OXÍGENO (SpO2 en %), FRECUENCIA CARDÍACA (lpm), TEMPERATURA (°C)',
    codigoManual: '01.54.458176 (MU) / 01.54.459182 (MS)',
    planos: 'ELECTRÓNICOS DISPONIBLES',
    operacion: 'USUARIO ASISTENCIAL / CLÍNICO',
    idioma: 'ESPAÑOL (LATINOAMÉRICA)',
    servicioManual: 'DISPONIBLE EN SERVICIO BIOMÉDICO',
    proveedor: 'ELECTROMEDICA EQUIPOS MEDICOS S.A.S. (NIT 900.585.549-6)',
    direccionProveedor: 'CRA 9 # 2-17',
    ciudadProveedor: 'PEREIRA - RISARALDA',
    telefonoProveedor: '322 3273282 / 314 7496161',
    formaAdquisicion: 'DONACIÓN / ADQUISICIÓN SOCIEDAD DE MEJORAS DE PEREIRA (COT. AS-12248)',
    garantia: '12 MESES EQUIPO / 3 MESES ACCESORIOS (HASTA 01/09/2027)',
    usoPrevisto: 'Equipo médico destinado a la monitorización continua en tiempo real de parámetros fisiológicos múltiples (ECG de 3/5 derivaciones, saturación funcional de oxígeno SpO2, presión arterial no invasiva PNI, frecuencia respiratoria por impedancia torácica y temperatura dual) en pacientes adultos, pediátricos y neonatales en áreas críticas, salas de cirugía, urgencias y hospitalización.',
    accesorios: 'Sensor de SpO2 adulto reutilizable EDAN SH1, brazalete NIBP adulto con manguera de acople rápido, cable troncal de paciente ECG de 3/5 derivadas con latiguillos tipo botón, sensor de temperatura de superficie cutánea, cable de alimentación eléctrica grado hospitalario con polo a tierra.',
    condicionesUso: 'Instalar en soporte de pared o rodable debidamente nivelado. Conectar a toma eléctrica grado médico con polo a tierra certificado en red regulada. Limpiar y desinfectar periódicamente con paño suave libre de pelusa y alcohol isopropílico al 70% o solución de amonio cuaternario. No esterilizar por inmersión ni autoclave.'
  },

  // 2. DESFIBRILADOR BIFÁSICO AMOUL i2 / i6
  'AMOUL': {
    equipoOficial: 'DESFIBRILADOR BIFÁSICO CON MONITOREO',
    marca: 'AMOUL',
    modelo: 'i2 / i6',
    clasificacionBiomedica: 'TRATAMIENTO, REANIMACIÓN Y SOPORTE VITAL',
    riesgo: 'III',
    permisoComercializacion: 'PERMISO DE COMERCIALIZACIÓN',
    registroInvima: '2024EBC-0028718',
    fuenteEnergia: 'ELÉCTRICA 100 - 240 VAC / BATERÍA RECARGABLE LI-ION ALTA CAPACIDAD',
    tecnologiaControlada: 'SI',
    voltaje: '100 - 240 VAC (50/60 Hz)',
    corriente: '1.8 A',
    potencia: '120 VA',
    frecuenciaElectrica: '50 / 60 Hz',
    frecuenciaMantenimiento: 'SEMESTRAL',
    requiereCalibracion: 'SI',
    calibracionTipo: 'LEGAL',
    variablesMedir: 'ENERGÍA DESCARGADA (1 a 360 Joules), TIEMPO DE CARGA (segundos), FRECUENCIA DE DESCARGA Y RITMO ECG, IMPEDANCIA TRANSTORÁCICA (Ohms)',
    codigoManual: 'MAN-AMOUL-i2-ES / MS-AMOUL-2024',
    planos: 'ELECTRÓNICOS Y DE CIRCUITO',
    operacion: 'PERSONAL MÉDICO / ASISTENCIAL ENTRENADO (ACLS / BLS)',
    idioma: 'ESPAÑOL',
    servicioManual: 'DISPONIBLE EN DEPARTAMENTO BIOMÉDICO',
    proveedor: 'ELECTROMEDICA EQUIPOS MEDICOS S.A.S. (NIT 900.585.549-6)',
    direccionProveedor: 'CRA 9 # 2-17',
    ciudadProveedor: 'PEREIRA - RISARALDA',
    telefonoProveedor: '322 3273282 / 314 7496161',
    formaAdquisicion: 'DONACIÓN / ADQUISICIÓN SOCIEDAD DE MEJORAS DE PEREIRA (COT. AS-12248)',
    garantia: '12 MESES EQUIPO / 3 MESES ACCESORIOS (HASTA 01/09/2027)',
    usoPrevisto: 'Dispositivo médico de soporte vital avanzado para desfibrilación eléctrica externa manual, cardioversión sincronizada de arritmias ventriculares/auriculares y monitorización continua del ritmo cardíaco durante protocolos de reanimación cardiopulmonar en pacientes adultos y pediátricos en paro cardiorrespiratorio o inestabilidad hemodinámica severa.',
    accesorios: 'Juego de palas externas reusables integradas para adulto y pediátrico, cable de paciente ECG de 3/5 terminales, cable de alimentación AC grado médico, electrodos desechables multifunción de desfibrilación, frasco de gel conductor electrocardiógrafo.',
    condicionesUso: 'Mantener permanentemente conectado a red eléctrica regulada para garantizar carga al 100% de la batería. Realizar autotest diario de descarga de prueba (50J/palas). Mantener en carro de paro con acceso expedito. Limpiar palas y superficies inmediatamente después de cada intervención retirando residuos de gel con compresa húmeda.'
  },

  // 3. ELECTROCARDIÓGRAFO EDAN SE-3
  'SE-3': {
    equipoOficial: 'ELECTROCARDIÓGRAFO MULTICANAL',
    marca: 'EDAN',
    modelo: 'SE-3',
    clasificacionBiomedica: 'DIAGNÓSTICO ELECTROFISIOLÓGICO CARDÍACO',
    riesgo: 'IIA',
    permisoComercializacion: 'REGISTRO SANITARIO',
    registroInvima: 'INVIMA 2020DM-0021425',
    fuenteEnergia: 'ELÉCTRICA 100 - 240 VAC / BATERÍA RECARGABLE LI-ION (AUTONOMÍA > 6.5 HORAS)',
    tecnologiaControlada: 'NO',
    voltaje: '100 - 240 VAC (50/60 Hz)',
    corriente: '0.8 - 0.4 A',
    potencia: '35 VA',
    frecuenciaElectrica: '50 / 60 Hz',
    frecuenciaMantenimiento: 'SEMESTRAL',
    requiereCalibracion: 'SI',
    calibracionTipo: 'TRAZABLE',
    variablesMedir: 'AMPLITUD DE VOLTAJE (mV: 2.5, 5, 10, 20 mm/mV), BASE DE TIEMPO / VELOCIDAD (mm/s: 5, 6.25, 10, 12.5, 25, 50), FRECUENCIA CARDÍACA (lpm)',
    codigoManual: '01.54.455337 (MU) / 01.54.455338 (MS v1.2)',
    planos: 'ELECTRÓNICOS ESQUEMÁTICOS',
    operacion: 'ENFERMERÍA / PERSONAL MÉDICO',
    idioma: 'ESPAÑOL',
    servicioManual: 'DISPONIBLE EN TALLER BIOMÉDICO',
    proveedor: 'ELECTROMEDICA EQUIPOS MEDICOS S.A.S. (NIT 900.585.549-6)',
    direccionProveedor: 'CRA 9 # 2-17',
    ciudadProveedor: 'PEREIRA - RISARALDA',
    telefonoProveedor: '322 3273282 / 314 7496161',
    formaAdquisicion: 'DONACIÓN / ADQUISICIÓN SOCIEDAD DE MEJORAS DE PEREIRA (COT. AS-12248)',
    garantia: '12 MESES EQUIPO / 3 MESES ACCESORIOS (HASTA 01/09/2027)',
    usoPrevisto: 'Equipo médico electrofisiológico diseñado para la captación, amplificación, filtrado, visualización en pantalla e impresión térmica simultánea de las 12 derivaciones estándar del electrocardiograma humano, con cálculo e interpretación automática de intervalos cardíacos para el diagnóstico clínico de arritmias, hipertrofia ventricular, isquemia e infarto agudo de miocardio.',
    accesorios: 'Cable de paciente de 10 latiguillos con terminación tipo banana/broche, juego de 4 electrodos de pinza para extremidades (R-L-F-N), juego de 6 electrodos precordiales de pera con copa metálica (V1 a V6), cable de alimentación grado médico, rollo de papel térmico de 80 mm.',
    condicionesUso: 'Utilizar siempre en ambientes protegidos de interferencias electromagnéticas severas. Asegurar contacto íntimo piel-electrodo con gel electroconductor. Evitar tensiones o torsiones pronunciadas en el cable de paciente. Proteger el cabezal de impresión térmica de la acumulación de polvo y no usar solventes agresivos sobre el rodillo.'
  },

  // 4. DETECTOR FETAL DOPPLER EDAN SONOTRAX II PRO
  'SONOTRAX': {
    equipoOficial: 'DETECTOR DE LATIDOS FETALES (DOPPLER FETAL)',
    marca: 'EDAN',
    modelo: 'SONOTRAX II PRO',
    clasificacionBiomedica: 'DIAGNÓSTICO OBSTÉTRICO FETAL',
    riesgo: 'IIA',
    permisoComercializacion: 'REGISTRO SANITARIO',
    registroInvima: 'INVIMA 2017DM-0001107-R1',
    fuenteEnergia: 'BATERÍA RECARGABLE NI-MH 9V / ADAPTADOR AC-DC UE8WCP-050100SPA',
    tecnologiaControlada: 'NO',
    voltaje: '100 - 240 VAC (Adaptador) / 9 VDC Batería',
    corriente: '0.2 A',
    potencia: '5 W',
    frecuenciaElectrica: '50 / 60 Hz',
    frecuenciaMantenimiento: 'SEMESTRAL',
    requiereCalibracion: 'SI',
    calibracionTipo: 'TRAZABLE',
    variablesMedir: 'FRECUENCIA CARDÍACA FETAL (FCF en latidos por minuto: rango 50 a 210 bpm), PRECISIÓN ± 3 bpm, FRECUENCIA ACÚSTICA DEL TRANSDUCTOR (2.0 MHz ± 10%)',
    codigoManual: '01.54.455562 (Manual de Usuario y Operación)',
    planos: 'DISPONIBLES EN MANUAL DE SERVICIO',
    operacion: 'MÉDICO GINECÓLOGO / OBSTETRA / ENFERMERÍA JEFE',
    idioma: 'ESPAÑOL',
    servicioManual: 'DISPONIBLE EN ÁREA BIOMÉDICA',
    proveedor: 'ELECTROMEDICA EQUIPOS MEDICOS S.A.S. (NIT 900.585.549-6)',
    direccionProveedor: 'CRA 9 # 2-17',
    ciudadProveedor: 'PEREIRA - RISARALDA',
    telefonoProveedor: '322 3273282 / 314 7496161',
    formaAdquisicion: 'DONACIÓN / ADQUISICIÓN SOCIEDAD DE MEJORAS DE PEREIRA (COT. AS-12248)',
    garantia: '12 MESES EQUIPO / 3 MESES ACCESORIOS (HASTA 01/09/2027)',
    usoPrevisto: 'Dispositivo médico portátil no invasivo basado en el principio Doppler de ultrasonido pulsado para la localización acústica y conteo digital instantáneo de la frecuencia cardíaca fetal (FCF) a partir de la semana 10 a 12 de gestación, durante controles prenatales, monitorización intraparto y urgencias gineco-obstétricas.',
    accesorios: 'Transductor ultrasónico obstétrico impermeable de 2.0 MHz, cargador y adaptador de pared UE8WCP-050100SPA, batería recargable interna, auriculares de audio estéreo, estuche rígido de transporte con cierre.',
    condicionesUso: 'Aplicar cantidad suficiente de gel de acoplamiento acústico en la membrana del transductor antes de cada examen. Limpiar inmediatamente el transductor con paño suave luego del uso; no sumergir el conector ni el cuerpo principal del detector. Almacenar en su estuche original protegido de caídas e impactos mecánicos.'
  },

  // 5. RESUCITADOR NEONATAL CON PIEZA EN T FISHER & PAYKEL RD900ASU (NEOPUFF)
  'RD900': {
    equipoOficial: 'REANIMADOR NEONATAL CON PIEZA EN T (NEOPUFF)',
    marca: 'FISHER & PAYKEL',
    modelo: 'RD900ASU (Serie 900)',
    clasificacionBiomedica: 'SOPORTE VITAL, ASISTENCIA RESPIRATORIA Y REANIMACIÓN',
    riesgo: 'IIB',
    permisoComercializacion: 'REGISTRO SANITARIO',
    registroInvima: 'INVIMA 2019DM-0004158-R1',
    fuenteEnergia: 'NEUMÁTICA (GAS MEDICINAL: OXÍGENO / AIRE MEDICINAL DESDE FUENTE REGULADA)',
    tecnologiaControlada: 'NO',
    voltaje: 'NO APLICA (OPERACIÓN NEUMÁTICA 100%)',
    corriente: 'NO APLICA',
    potencia: 'NO APLICA',
    frecuenciaElectrica: 'NO APLICA',
    frecuenciaMantenimiento: 'SEMESTRAL',
    requiereCalibracion: 'SI',
    calibracionTipo: 'TRAZABLE',
    variablesMedir: 'PRESIÓN INSPIRATORIA MÁXIMA (PIP: 5 a 70 cmH2O), PRESIÓN POSITIVA AL FINAL DE LA ESPIRACIÓN (PEEP: 1 a 15 cmH2O), PRESIÓN DE ALIVIO DE SEGURIDAD (cmH2O), PRESIÓN EN MANÓMETRO ANEROIDE (-10 a 80 cmH2O)',
    codigoManual: '620930 REV B / RD900 Manual Técnico y de Operación',
    planos: 'DIAGRAMAS NEUMÁTICOS EN MANUAL DE SERVICIO',
    operacion: 'MÉDICO PEDIATRA / NEONATÓLOGO / TERAPEUTA RESPIRATORIO',
    idioma: 'ESPAÑOL',
    servicioManual: 'DISPONIBLE EN SERVICIO BIOMÉDICO',
    proveedor: 'ELECTROMEDICA EQUIPOS MEDICOS S.A.S. (NIT 900.585.549-6)',
    direccionProveedor: 'CRA 9 # 2-17',
    ciudadProveedor: 'PEREIRA - RISARALDA',
    telefonoProveedor: '322 3273282 / 314 7496161',
    formaAdquisicion: 'DONACIÓN / ADQUISICIÓN SOCIEDAD DE MEJORAS DE PEREIRA (COT. AS-12248)',
    garantia: '12 MESES EQUIPO / 3 MESES ACCESORIOS (HASTA 01/09/2027)',
    usoPrevisto: 'Dispositivo médico neumático de precisión para la reanimación pulmonar neonatal y pediátrica hasta 10 kg mediante pieza en T. Permite la administración exacta, controlada y reproducible de Presión Inspiratoria Pico (PIP) y Presión Positiva al Final de la Espiración (PEEP) para reclutar volumen alveolar, mantener la capacidad residual funcional (CRF) y proteger el parénquima pulmonar inmaduro contra el barotrauma y volutrauma.',
    accesorios: 'Línea de suministro de gas verde/blanco con conectores DISS, adaptador de entrada de gas, pulmón de prueba neonatal para calibración rápida previa al uso, tapa de liberación de presión máxima de repuesto, circuitos desechables con pieza en T para paciente.',
    condicionesUso: 'Requiere alimentación neumática limpia, seca y libre de aceite de 5 a 15 L/min desde mezclador de gases (blender). Realizar prueba de fugas y verificación obligatoria de PIP y PEEP con el pulmón de prueba antes de cada procedimiento clínico. Proteger el manómetro frontal de impactos. Limpiar la superficie externa con soluciones germicidas no cloradas.'
  },

  // 6. REGULADORES DE OXÍGENO TIPO DIAL GENTEC 284MA-15LDS
  'GENTEC': {
    equipoOficial: 'REGULADOR DE OXÍGENO TIPO DIAL CON FLUJÓMETRO INTEGRADO',
    marca: 'GENTEC',
    modelo: '284MA-15LDS',
    clasificacionBiomedica: 'ADMINISTRACIÓN Y REGULACIÓN DE GASES MEDICINALES',
    riesgo: 'IIA',
    permisoComercializacion: 'REGISTRO SANITARIO',
    registroInvima: 'INVIMA 2018DM-0018593',
    fuenteEnergia: 'NEUMÁTICA (ALTA PRESIÓN DE CILINDRO HASTA 3000 PSI)',
    tecnologiaControlada: 'NO',
    voltaje: 'NO APLICA (MECÁNICO)',
    corriente: 'NO APLICA',
    potencia: 'NO APLICA',
    frecuenciaElectrica: 'NO APLICA',
    frecuenciaMantenimiento: 'SEMESTRAL',
    requiereCalibracion: 'SI',
    calibracionTipo: 'TRAZABLE',
    variablesMedir: 'PRESIÓN DE ENTRADA / CONTENIDO (PSI: 0 a 4000), PRESIÓN DE SALIDA (50 PSIG / 345 kPa), FLUJO REGULADO EN LPM (0, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 10, 15 LPM)',
    codigoManual: 'MAN-GENTEC-284MA / FT-GENTEC-O2',
    planos: 'DESPIECE MECÁNICO EN FICHA TÉCNICA',
    operacion: 'PERSONAL MÉDICO / ASISTENCIAL / TERAPIA RESPIRATORIA',
    idioma: 'ESPAÑOL',
    servicioManual: 'DISPONIBLE EN TALLER BIOMÉDICO',
    proveedor: 'ELECTROMEDICA EQUIPOS MEDICOS S.A.S. (NIT 900.585.549-6)',
    direccionProveedor: 'CRA 9 # 2-17',
    ciudadProveedor: 'PEREIRA - RISARALDA',
    telefonoProveedor: '322 3273282 / 314 7496161',
    formaAdquisicion: 'DONACIÓN / ADQUISICIÓN SOCIEDAD DE MEJORAS DE PEREIRA (COT. AS-12248)',
    garantia: '12 MESES (HASTA 25/08/2027)',
    usoPrevisto: 'Dispositivo médico para la reducción de alta presión (hasta 3000 PSI) proveniente de cilindros de oxígeno medicinal y dosificación volumétrica precisa y graduada mediante selector tipo click dial de 0 a 15 LPM para administración terapéutica a pacientes en oxigenoterapia hospitalaria o traslados.',
    accesorios: 'Manómetro integrado con carátula de lectura y protector de goma antichoque, conexión de entrada CGA 540 con tuerca y niple de latón, salida con conector niple estriado tipo espiga para cánula o manguera de oxígeno, empaque de sello de repuesto.',
    condicionesUso: 'Prohibido terminantemente el uso de aceites, grasas lubricantes u otros hidrocarburos en roscas o conexiones por riesgo severo de ignición/explosión espontánea en presencia de oxígeno. Abrir la válvula del cilindro lentamente con el dial en posición OFF. Verificar hermeticidad con detector de fugas compatible o solución jabonosa neutra.'
  }
};

/**
 * Función que inspecciona el equipo y enriquece sus metadatos contrastando
 * con el catálogo autorizado de la entrega AS-12248 y modelos institucionales.
 */
export const getEnrichedEquipmentSpecs = (equipment: any) => {
  const eq = { ...equipment };
  const rawModel = String(eq.modelo || eq.Modelo || '').toUpperCase();
  const rawBrand = String(eq.marca || eq.Marca || '').toUpperCase();
  const rawName = String(eq.equipo || eq.Equipo || '').toUpperCase();

  let matchedSpec: ModelSpec | null = null;

  if (rawModel.includes('X8') || (rawBrand.includes('EDAN') && rawName.includes('MONITOR'))) {
    matchedSpec = AS12248_CATALOG['X8'];
  } else if (rawBrand.includes('AMOUL') || rawModel.includes('I2') || rawModel.includes('I6') || (rawName.includes('DESFIBRILADOR') && rawBrand.includes('AMOUL'))) {
    matchedSpec = AS12248_CATALOG['AMOUL'];
  } else if (rawModel.includes('SE-3') || (rawBrand.includes('EDAN') && rawName.includes('ELECTROCARDI'))) {
    matchedSpec = AS12248_CATALOG['SE-3'];
  } else if (rawModel.includes('SONOTRAX') || rawName.includes('DOPPLER') || rawName.includes('LATIDOS FETALES')) {
    matchedSpec = AS12248_CATALOG['SONOTRAX'];
  } else if (rawModel.includes('RD900') || rawModel.includes('NEOPUFF') || rawName.includes('REANIMADOR NEONATAL') || rawName.includes('RESUCITADOR')) {
    matchedSpec = AS12248_CATALOG['RD900'];
  } else if (rawBrand.includes('GENTEC') || rawModel.includes('284MA') || (rawName.includes('REGULADOR') && rawName.includes('OX'))) {
    matchedSpec = AS12248_CATALOG['GENTEC'];
  }

  if (matchedSpec) {
    return {
      Equipo: eq.equipo || eq.Equipo || matchedSpec.equipoOficial,
      Marca: eq.marca || eq.Marca || matchedSpec.marca,
      Modelo: eq.modelo || eq.Modelo || matchedSpec.modelo,
      NumeroSerie: eq.numero_serie || eq.NumeroSerie || eq.serie || '',
      Id_Unico: eq.id_unico || eq.Id_Unico || eq.activoFijo || '',
      Servicio: eq.servicio || eq.Servicio || 'HOSPITAL UNIVERSITARIO SAN JORGE',
      Ubicacion: eq.ubicacion || eq.UBICACIÓN || 'ÁREA ASISTENCIAL',
      Riesgo: eq.riesgo || eq.Riesgo || matchedSpec.riesgo,
      Frecuencia: eq.frecuencia_mantenimiento || eq.Frecuencia || matchedSpec.frecuenciaMantenimiento,
      Garantia: eq.garantia || eq.Garantia || matchedSpec.garantia,
      RegistroInvima: eq.reg_invima || eq.registro_invima || eq.RegistroInvima || matchedSpec.registroInvima,
      RequiereCalibracion: eq.requiere_calibracion || eq.RequiereCalibracion || matchedSpec.requiereCalibracion,
      FechaCalibracion: eq.fecha_calibracion || eq.FechaCalibracion || '',
      FechaCompra: eq.fecha_compra || eq.FechaCompra || '25/08/2026',
      FechaInstalacion: eq.fecha_instalacion || eq.FechaInstalacion || '01/09/2026',
      FormaAdquisicion: eq.forma_adquisicion || eq.FormaAdquisicion || matchedSpec.formaAdquisicion,
      Proveedor: eq.proveedor || eq.Proveedor || matchedSpec.proveedor,
      Direccion: eq.direccion || eq.Direccion || matchedSpec.direccionProveedor,
      Ciudad: eq.ciudad || eq.Ciudad || matchedSpec.ciudadProveedor,
      Telefono: eq.telefono || eq.Telefono || matchedSpec.telefonoProveedor,
      ValorAdquisicion: eq.valor_adquisicion || eq.ValorAdquisicion || '',
      UsoPrevisto: eq.uso_previsto || eq.UsoPrevisto || matchedSpec.usoPrevisto,
      ClasificacionBiomedica: eq.clasificacion_biomedica || eq.ClasificacionBiomedica || matchedSpec.clasificacionBiomedica,
      PermisoComercializacion: eq.permiso_comercializacion || eq.PermisoComercializacion || matchedSpec.permisoComercializacion,
      FuenteEnergia: eq.fuente_energia || eq.FuenteEnergia || matchedSpec.fuenteEnergia,
      TecnologiaControlada: eq.tecnologia_controlada || eq.TecnologiaControlada || matchedSpec.tecnologiaControlada,
      Voltaje: eq.voltaje || eq.Voltaje || matchedSpec.voltaje,
      Corriente: eq.corriente || eq.Corriente || matchedSpec.corriente,
      Potencia: eq.potencia || eq.Potencia || matchedSpec.potencia,
      FrecuenciaElectrica: eq.frecuencia_electrica || eq.FrecuenciaElectrica || matchedSpec.frecuenciaElectrica,
      CalibracionTipo: eq.calibracion_tipo || matchedSpec.calibracionTipo,
      VariablesMedir: eq.variables_medir || eq.VariablesMedir || matchedSpec.variablesMedir,
      CodigoManual: eq.codigo_manual || eq.CodigoManual || matchedSpec.codigoManual,
      Planos: eq.planos || eq.Planos || matchedSpec.planos,
      Operacion: eq.operacion || eq.Operacion || matchedSpec.operacion,
      Idioma: eq.idioma || eq.Idioma || matchedSpec.idioma,
      ServicioManual: eq.servicio_manual || eq.ServicioManual || matchedSpec.servicioManual,
      Accesorios: eq.accesorios || eq.Accesorios || matchedSpec.accesorios,
      CondicionesUso: eq.condiciones_uso || eq.CondicionesUso || matchedSpec.condicionesUso
    };
  }

  // Fallback si no está en el catálogo AS-12248
  return {
    Equipo: eq.equipo || eq.Equipo || '',
    Marca: eq.marca || eq.Marca || '',
    Modelo: eq.modelo || eq.Modelo || '',
    NumeroSerie: eq.numero_serie || eq.NumeroSerie || eq.serie || '',
    Id_Unico: eq.id_unico || eq.Id_Unico || eq.activoFijo || '',
    Servicio: eq.servicio || eq.Servicio || '',
    Ubicacion: eq.ubicacion || eq.UBICACIÓN || '',
    Riesgo: eq.riesgo || eq.Riesgo || 'I',
    Frecuencia: eq.frecuencia_mantenimiento || eq.Frecuencia || 'SEMESTRAL',
    Garantia: eq.garantia || eq.Garantia || '',
    RegistroInvima: eq.reg_invima || eq.registro_invima || eq.RegistroInvima || '',
    RequiereCalibracion: eq.requiere_calibracion || eq.RequiereCalibracion || '',
    FechaCalibracion: eq.fecha_calibracion || eq.FechaCalibracion || '',
    FechaCompra: eq.fecha_compra || eq.FechaCompra || '',
    FechaInstalacion: eq.fecha_instalacion || eq.FechaInstalacion || '',
    FormaAdquisicion: eq.forma_adquisicion || eq.FormaAdquisicion || 'COMPRA INSTITUCIONAL',
    Proveedor: eq.proveedor || eq.Proveedor || 'ELECTROMEDICA EQUIPOS MEDICOS S.A.S.',
    Direccion: eq.direccion || eq.Direccion || 'CRA 9 # 2-17',
    Ciudad: eq.ciudad || eq.Ciudad || 'PEREIRA',
    Telefono: eq.telefono || eq.Telefono || '322 3273282',
    ValorAdquisicion: eq.valor_adquisicion || eq.ValorAdquisicion || '',
    UsoPrevisto: eq.uso_previsto || eq.UsoPrevisto || 'EQUIPO DESTINADO PARA LA ATENCIÓN, MONITOREO O SOPORTE CLÍNICO ASISTENCIAL SEGÚN ESPECIFICACIÓN DEL FABRICANTE.',
    ClasificacionBiomedica: eq.clasificacion_biomedica || eq.ClasificacionBiomedica || 'DIAGNÓSTICO / TRATAMIENTO',
    PermisoComercializacion: eq.permiso_comercializacion || eq.PermisoComercializacion || 'REGISTRO SANITARIO',
    FuenteEnergia: eq.fuente_energia || eq.FuenteEnergia || 'ELÉCTRICA 110V / BATERÍA',
    TecnologiaControlada: eq.tecnologia_controlada || eq.TecnologiaControlada || 'NO',
    Voltaje: eq.voltaje || eq.Voltaje || '110 - 120 VAC',
    Corriente: eq.corriente || eq.Corriente || 'N/A',
    Potencia: eq.potencia || eq.Potencia || 'N/A',
    FrecuenciaElectrica: eq.frecuencia_electrica || eq.FrecuenciaElectrica || '60 Hz',
    CalibracionTipo: eq.calibracion_tipo || 'TRAZABLE',
    VariablesMedir: eq.variables_medir || eq.VariablesMedir || 'N/A',
    CodigoManual: eq.codigo_manual || eq.CodigoManual || 'N/A',
    Planos: eq.planos || eq.Planos || 'ELECTRÓNICOS',
    Operacion: eq.operacion || eq.Operacion || 'USUARIO / TÉCNICO',
    Idioma: eq.idioma || eq.Idioma || 'ESPAÑOL',
    ServicioManual: eq.servicio_manual || eq.ServicioManual || 'DISPONIBLE',
    Accesorios: eq.accesorios || eq.Accesorios || 'Cables de alimentación y accesorios estándar según dotación.',
    CondicionesUso: eq.condiciones_uso || eq.CondicionesUso || 'Operación bajo condiciones ambientales controladas y cumplimiento estricto del protocolo de limpieza y desinfección institucional.'
  };
};

