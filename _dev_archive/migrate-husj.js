import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    });
}

const supabaseUrl = process.env.SUPABASE_URL || 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!supabaseKey) throw new Error('VITE_SUPABASE_ANON_KEY is missing. Set it in your .env file.');
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log("🚀 Leyendo inventario local...");
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'inventory.json');
  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  console.log(`📊 Total equipos en JSON: ${rawData.length}`);
  
  // DEDUPLICACIÓN: Usamos un Map para asegurar que Id_Unico sea único antes de enviar
  const uniqueMap = new Map();
  
  rawData.forEach(item => {
    const id = String(item['Id_Unico'] || 'N/A').trim();
    // Si ya existe, lo sobrescribimos con el nuevo (o puedes elegir ignorar)
    uniqueMap.set(id, {
      id_unico: id,
      equipo: item['Equipo'] || 'N/A',
      marca: item['Marca'] || 'N/A',
      modelo: item['Modelo'] || 'N/A',
      numero_serie: item['NumeroSerie'] || 'N/A',
      servicio: item['Servicio'] || 'N/A',
      ubicacion: item['UBICACIÓN'] || 'N/A',
      estado: item['Estado'] || 'BUENO',
      riesgo: item['RIESGO'] || 'I',
      reg_invima: item['REG. INVIMA'] || 'N/A',
      garantia: item['GARANTÍA'] || 'N/A',
      certificado_calibracion: item['CERTIFICADO DE CALIBRACIÓN'] || 'N/A',
      fecha_calibracion: String(item['FECHA DE CALIBRACIÓN'] || 'N/A'),
      fecha_vencimiento_calibracion: String(item['FECHA DE VENCIMIENTO DE CALIBRACIÓN'] || 'N/A'),
      frecuencia_mantenimiento: item['FRECUENCIA DE MANTENIMIENTO'] || 'N/A',
      responsable_mtto: item['RESPONSABLE MTTO'] || 'N/A',
      propietario: item['PROPIETARIO'] || 'N/A',
      estrategia_mtto: item['ESTRATEGIA DE MANTTO'] || 'N/A'
    });
  });

  const cleanData = Array.from(uniqueMap.values());
  console.log(`🧹 Datos depurados (sin placas repetidas): ${cleanData.length}`);
  console.log(`⚠️ Se omitieron ${rawData.length - cleanData.length} registros por tener placas duplicadas.`);

  console.log("📡 Subiendo a la nube...");
  
  for (let i = 0; i < cleanData.length; i += 50) {
    const chunk = cleanData.slice(i, i + 50);
    const { error } = await supabase.from('equipments').upsert(chunk, { onConflict: 'id_unico' });
    
    if (error) {
      console.error(`❌ Error en bloque ${i}:`, error.message);
    } else {
      console.log(`✅ Bloque ${i} a ${Math.min(i+50, cleanData.length)} subido.`);
    }
  }

  console.log("✨ ¡Migración 3.0 (Deduplicada) COMPLETADA!");
}

migrate();
