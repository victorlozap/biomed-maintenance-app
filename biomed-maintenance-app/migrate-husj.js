import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODIzNTksImV4cCI6MjA5MDQ1ODM1OX0.gQockW2pLcQiJ4xGX5WL6OL5mWFI9LqBQAEODN1kkZI';
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
