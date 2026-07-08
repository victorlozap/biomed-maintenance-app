import XLSX from 'xlsx';
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

const EXCEL_PATH = 'd:\\VICTOR LOPEZ\\CLAUDE CODE\\prueba\\Mantenimientos\\1. INVENTARIO EQUIPOS MÉDICOS HUSJ 2025.xlsx';

async function importExcel() {
    console.log("📂 Leyendo Excel (Sheet: INVENTARIO HUSJ (2025))...");
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheetName = 'INVENTARIO HUSJ (2025)';
    const sheet = workbook.Sheets[sheetName];
    
    // Saltamos la fila 0 (ENE, FEB...) y empezamos en la fila 1 (Id_Unico, Equipo...)
    const rawData = XLSX.utils.sheet_to_json(sheet, { range: 1, defval: '' });

    console.log(`📊 Total registros encontrados: ${rawData.length}`);

    const uniqueMap = new Map();

    rawData.forEach(item => {
        const id = String(item['Id_Unico'] || '').trim();
        if (!id || id === 'Id_Unico') return;

        uniqueMap.set(id, {
            id_unico: id,
            equipo: String(item['Equipo'] || 'N/A').toUpperCase(),
            marca: String(item['Marca'] || 'N/A').toUpperCase(),
            modelo: String(item['Modelo'] || 'N/A').toUpperCase(),
            numero_serie: String(item['NumeroSerie'] || 'N/A').toUpperCase(),
            servicio: String(item['Servicio'] || 'N/A').trim(),
            ubicacion: String(item['UBICACIÓN'] || 'N/A').trim(),
            estado: String(item['Estado'] || 'BUENO').toUpperCase(),
            riesgo: String(item['RIESGO'] || 'I').toUpperCase(),
            reg_invima: String(item['REG. INVIMA'] || 'N/A'),
            garantia: String(item['GARANTÍA'] || 'N/A'),
            frecuencia_mantenimiento: String(item['FRECUENCIA DE MANTENIMIENTO'] || 'Anual').toUpperCase(),
            propietario: String(item['PROPIETARIO'] || 'HUSJ').toUpperCase()
        });
    });

    const cleanData = Array.from(uniqueMap.values());
    console.log(`🧹 Datos depurados y normalizados: ${cleanData.length}`);

    // LOG DE PRUEBA: Verificar equipo 573313
    const testEq = cleanData.find(e => e.id_unico === '573313');
    if (testEq) {
        console.log("🔍 Verificación 573313:", testEq);
    } else {
        console.warn("⚠️ No se encontró el equipo 573313 en los datos depurados.");
    }

    console.log("📡 Subiendo a Supabase...");
    for (let i = 0; i < cleanData.length; i += 50) {
        const chunk = cleanData.slice(i, i + 50);
        const { error } = await supabase.from('equipments').upsert(chunk, { onConflict: 'id_unico' });
        
        if (error) {
            console.error(`❌ Error en bloque ${i}:`, error.message);
        } else {
            process.stdout.write('.'); // Progreso silencioso
        }
    }

    console.log("\n✨ ¡Sincronización Directa de Inventario HUSJ 2025 COMPLETADA!");
}

importExcel().catch(console.error);
