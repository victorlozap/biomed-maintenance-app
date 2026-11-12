const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Cargar variables de entorno desde .env si existe
const envPath = path.resolve(__dirname, '../.env');
let supabaseUrl = 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
let supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const urlMatch = envContent.match(/SUPABASE_URL=["']?([^"'\r\n]+)/);
  const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/);
  if (urlMatch) supabaseUrl = urlMatch[1];
  if (keyMatch) supabaseKey = keyMatch[1];
}

const supabase = createClient(supabaseUrl, supabaseKey);

const defaultExcelPath = path.resolve(__dirname, '../1. INVENTARIO EQUIPOS MÉDICOS HUSJ 2025-2026.xlsx');
const targetFile = process.argv[2] || defaultExcelPath;

async function runSync() {
  console.log('====================================================');
  console.log('🚀 SINCRONIZADOR DE INVENTARIO MAESTRO HUSJ 2025-2026');
  console.log('====================================================');
  console.log(`📁 Leyendo archivo: ${targetFile}`);

  if (!fs.existsSync(targetFile)) {
    console.error(`❌ El archivo no existe en la ruta: ${targetFile}`);
    process.exit(1);
  }

  const startTime = Date.now();
  const workbook = xlsx.readFile(targetFile);
  const sheetName = 'INVENTARIO HUSJ (2025)';

  if (!workbook.Sheets[sheetName]) {
    console.error(`❌ No se encontró la hoja '${sheetName}' en el Excel.`);
    console.log('Hojas disponibles:', workbook.SheetNames);
    process.exit(1);
  }

  const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
  console.log(`📊 Filas totales leídas del Excel: ${rawData.length}`);

  // 1. Obtener equipos existentes en Supabase para proteger fotos y certificados existentes
  console.log('🔍 Consultando base de datos para preservar fotos y certificados...');
  const existingMap = new Map();
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('equipments')
      .select('id_unico, foto_url, certificado_url, certificado_calibracion, fecha_calibracion, fecha_vencimiento_calibracion')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Error consultando base de datos:', error.message);
      break;
    }
    if (!data || data.length === 0) break;
    data.forEach(item => {
      if (item.id_unico) {
        existingMap.set(String(item.id_unico).trim(), item);
      }
    });
    if (data.length < pageSize) break;
    page++;
  }
  console.log(`💾 Equipos registrados actualmente en Supabase: ${existingMap.size}`);

  const cleanVal = (val, defaultVal = '') => {
    if (val === undefined || val === null) return defaultVal;
    const s = String(val).trim();
    if (s.toLowerCase() === 'nan' || s.toLowerCase() === 'none') return defaultVal;
    return s;
  };

  const genericIds = new Set(['COMODATO', 'SIN IDENTIFICAR', 'N.R.', 'NA', 'N/A', 'SIN IDENTIFICAR']);
  const seenIds = new Map();
  const payloadMap = new Map();
  let newEquipmentsCount = 0;
  let updatedEquipmentsCount = 0;

  for (let i = 3; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length === 0) continue;

    let id_raw = cleanVal(row[0]);
    const equipo = cleanVal(row[3]);
    const serie = cleanVal(row[6]);

    // Ignorar encabezados residuales o filas sin equipo
    if (!id_raw || id_raw.toLowerCase() === 'activo fijo' || !equipo) {
      continue;
    }

    let id_unico = id_raw;

    // Normalizar IDs genéricos con su serie o número de fila
    if (genericIds.has(id_raw.toUpperCase())) {
      if (serie && serie.toUpperCase() !== 'NO DEFINIDO' && serie.toUpperCase() !== 'NA') {
        id_unico = `${id_raw}-${serie}`;
      } else {
        id_unico = `${id_raw}-F${i + 1}`;
      }
    }

    // Manejo de duplicados de activo fijo
    if (seenIds.has(id_unico)) {
      const prevData = seenIds.get(id_unico);
      // Si es el mismo equipo con misma serie, nos quedamos con el más completo
      if (prevData.equipo === equipo.toUpperCase() && prevData.serie === serie) {
        continue; // duplicado exacto
      } else {
        // Equipos diferentes con el mismo código asignado (ej. homónimos provisionales)
        id_unico = `${id_unico}-${serie || ('F' + (i + 1))}`;
      }
    }

    seenIds.set(id_unico, { equipo: equipo.toUpperCase(), serie });

    const isNew = !existingMap.has(id_unico);
    if (isNew) {
      newEquipmentsCount++;
    } else {
      updatedEquipmentsCount++;
    }

    const existing = existingMap.get(id_unico) || {};

    const itemPayload = {
      id_unico: id_unico,
      equipo: equipo.toUpperCase(),
      estado: cleanVal(row[1], 'ACTIVO').toUpperCase(),
      marca: cleanVal(row[4], 'NO DEFINIDO'),
      modelo: cleanVal(row[5], 'NO DEFINIDO'),
      numero_serie: cleanVal(row[6], 'NO DEFINIDO'),
      servicio: cleanVal(row[7], 'SIN SERVICIO').toUpperCase(),
      ubicacion: cleanVal(row[8], 'N/A'),
      garantia: cleanVal(row[17]) || cleanVal(row[18]) || 'N/A',
      riesgo: cleanVal(row[21], 'I').toUpperCase(),
      reg_invima: cleanVal(row[22], 'N/A'),
      frecuencia_mantenimiento: cleanVal(row[31], 'SEMESTRAL'),
      propietario: cleanVal(row[35], 'HUSJ'),
      responsable_mtto: cleanVal(row[36], 'TALLER BIOMÉDICO'),
      certificado_calibracion: cleanVal(row[44], existing.certificado_calibracion || 'N/A'),
      fecha_calibracion: cleanVal(row[45], existing.fecha_calibracion || null),
      fecha_vencimiento_calibracion: cleanVal(row[46], existing.fecha_vencimiento_calibracion || null),
      foto_url: existing.foto_url || null,
      certificado_url: existing.certificado_url || null
    };

    payloadMap.set(id_unico, itemPayload);
  }

  const payload = Array.from(payloadMap.values());
  console.log(`📦 Total equipos procesados con ID ÚNICO estricto: ${payload.length}`);
  console.log(`   ✨ Nuevos por insertar: ${newEquipmentsCount}`);
  console.log(`   🔄 Existentes por actualizar: ${updatedEquipmentsCount}`);

  // 3. Ejecutar Upsert en lotes de 100
  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;

  process.stdout.write('⏳ Subiendo a Supabase: ');
  for (let i = 0; i < payload.length; i += batchSize) {
    const batch = payload.slice(i, i + batchSize);
    const { error } = await supabase
      .from('equipments')
      .upsert(batch, { onConflict: 'id_unico' });

    if (error) {
      console.error(`\n❌ Error en lote ${Math.floor(i / batchSize) + 1}:`, error.message);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
      process.stdout.write('■');
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n\n====================================================');
  console.log('🎉 RESULTADO DE LA SINCRONIZACIÓN');
  console.log('====================================================');
  console.log(`✅ Equipos sincronizados exitosamente: ${successCount}`);
  if (errorCount > 0) {
    console.log(`⚠️ Equipos con error: ${errorCount}`);
  }
  console.log(`⏱️ Tiempo total: ${duration} segundos`);
  console.log('====================================================\n');
}

runSync().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
