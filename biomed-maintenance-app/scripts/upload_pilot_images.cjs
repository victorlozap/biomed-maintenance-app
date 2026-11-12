const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
const IMAGES_DIR = path.resolve(__dirname, '../temp_pilot_images');

const PILOT_CATALOG = [
  {
    marca: 'Gentec',
    modelo: 'FM-197B-15L-CH',
    filename: 'Gentec_FM-197B-15L-CH.png',
    equipo: 'Flujómetro O2'
  },
  {
    marca: 'Lenz',
    modelo: 'GZ-805',
    filename: 'Lenz_GZ-805.png',
    equipo: 'Tensiómetro Digital'
  },
  {
    marca: 'Oxywatch',
    modelo: 'MD300C29',
    filename: 'Oxywatch_MD300C29.png',
    equipo: 'Pulsoxímetro Digital'
  },
  {
    marca: 'Caresens',
    modelo: 'N VOICE',
    filename: 'Caresens_N_VOICE.png',
    equipo: 'Glucómetro Parlante'
  },
  {
    marca: 'Pahsco',
    modelo: '434',
    filename: 'Pahsco_434.png',
    equipo: 'Flujómetro O2'
  },
  {
    marca: 'Htc',
    modelo: 'HTC-2',
    filename: 'Htc_HTC-2.png',
    equipo: 'Termohigrómetro Digital'
  },
  {
    marca: 'Acare',
    modelo: 'VRA-391',
    filename: 'Acare_VRA-391.png',
    equipo: 'Vacutron / Regulador Succión'
  },
  {
    marca: 'Acare',
    modelo: 'FA-OS-04',
    filename: 'Acare_FA-OS-04.png',
    equipo: 'Flujómetro O2'
  },
  {
    marca: 'Pulmo-Med',
    modelo: '7E-A',
    filename: 'Pulmo-Med_7E-A.png',
    equipo: 'Aspirador Secreciones'
  },
  {
    marca: 'Edan',
    modelo: 'iM70',
    filename: 'Edan_iM70.png',
    equipo: 'Monitor Signos Vitales'
  }
];

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'application/octet-stream';
}

async function run() {
  console.log('===============================================================');
  console.log('☁️  SUBIDOR DE FOTOS A SUPABASE STORAGE Y SINCRONIZADOR DE DB');
  console.log('===============================================================');
  console.log(`📁 Directorio origen: ${IMAGES_DIR}`);
  console.log(`🌐 Supabase URL: ${supabaseUrl}\n`);

  let totalUpdatedEquipments = 0;
  const summaryReport = [];

  for (let i = 0; i < PILOT_CATALOG.length; i++) {
    const item = PILOT_CATALOG[i];
    const localFilePath = path.join(IMAGES_DIR, item.filename);

    console.log(`[${i + 1}/${PILOT_CATALOG.length}] Procesando ${item.marca} - ${item.modelo} (${item.equipo})...`);

    if (!fs.existsSync(localFilePath)) {
      console.error(`   ❌ Archivo no encontrado en disco: ${localFilePath}`);
      summaryReport.push({ item, status: 'ERROR_FILE_NOT_FOUND', count: 0 });
      continue;
    }

    const fileBuffer = fs.readFileSync(localFilePath);
    const mimeType = getMimeType(localFilePath);
    const storagePath = `photos/${item.filename}`;

    // 1. Subida a Supabase Storage
    console.log(`   📤 Subiendo a Storage: equipment-images/${storagePath} (${(fileBuffer.length / 1024).toFixed(1)} KB)...`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('equipment-images')
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true
      });

    if (uploadError) {
      console.error(`   ❌ Error subiendo a Storage: ${uploadError.message}`);
      summaryReport.push({ item, status: 'ERROR_STORAGE_UPLOAD', count: 0, error: uploadError.message });
      continue;
    }

    // 2. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('equipment-images')
      .getPublicUrl(storagePath);

    console.log(`   🔗 URL Pública: ${publicUrl}`);

    // 3. Actualizar la tabla equipments en Supabase
    // Protegemos fotos existentes: solo actualizamos donde foto_url es null o vacío
    const { data: updatedRows, error: updateError } = await supabase
      .from('equipments')
      .update({ foto_url: publicUrl })
      .ilike('marca', item.marca)
      .ilike('modelo', item.modelo)
      .or('foto_url.is.null,foto_url.eq.""')
      .select('id_unico');

    if (updateError) {
      console.error(`   ❌ Error actualizando base de datos: ${updateError.message}`);
      summaryReport.push({ item, status: 'ERROR_DB_UPDATE', count: 0, error: updateError.message });
      continue;
    }

    const count = updatedRows ? updatedRows.length : 0;
    totalUpdatedEquipments += count;
    console.log(`   ✅ Base de Datos actualizada: ${count} equipos vinculados con la nueva foto.`);

    summaryReport.push({
      item,
      status: 'SUCCESS',
      count,
      publicUrl,
      sampleIds: (updatedRows || []).slice(0, 3).map(r => r.id_unico)
    });
  }

  console.log('\n===============================================================');
  console.log('📊 REPORTE DE RESULTADOS DE LA PRUEBA PILOTO');
  console.log('===============================================================');
  console.log(`Total de equipos impactados con foto nueva: ${totalUpdatedEquipments}`);
  console.log('\nDetalle por modelo:');
  summaryReport.forEach(r => {
    if (r.status === 'SUCCESS') {
      console.log(`- ✅ [${r.count} equipos] ${r.item.marca} ${r.item.modelo} -> ${r.publicUrl}`);
      if (r.sampleIds && r.sampleIds.length > 0) {
        console.log(`     Ejemplos IDs: ${r.sampleIds.join(', ')}`);
      }
    } else {
      console.log(`- ❌ ${r.item.marca} ${r.item.modelo}: ${r.status}`);
    }
  });

  return { totalUpdatedEquipments, summaryReport };
}

run();

