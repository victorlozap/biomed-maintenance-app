const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    });
}

const supabaseUrl = process.env.SUPABASE_URL || 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing. Set it in your .env file: SUPABASE_SERVICE_ROLE_KEY=your-key');
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadMissing() {
    const ids = ['570861', '570863'];
    const jsonPath = path.join(__dirname, 'src', 'data', 'inventory.json');
    const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    const toUpload = rawData.filter(item => ids.includes(String(item.Id_Unico)));
    
    if (toUpload.length === 0) {
        console.log('Items not found in inventory.json either!');
        return;
    }

    const cleanData = toUpload.map(item => ({
        id_unico: String(item.Id_Unico),
        equipo: item.Equipo || 'N/A',
        marca: item.Marca || 'N/A',
        modelo: item.Modelo || 'N/A',
        numero_serie: item.NumeroSerie || 'N/A',
        servicio: item.Servicio || 'N/A',
        ubicacion: item['UBICACIÓN'] || item.Ubicacion || 'N/A',
        estado: item.Estado || 'BUENO',
        riesgo: item.RIESGO || item.Riesgo || 'I',
        reg_invima: item['REG. INVIMA'] || item.Reg_Invima || 'N/A',
        garantia: item['GARANTÍA'] || item.Garantia || 'N/A',
        frecuencia_mantenimiento: item['FRECUENCIA DE MANTENIMIENTO'] || item.Frecuencia || 'N/A',
        propietario: item.PROPIETARIO || item.Propietario || 'N/A'
    }));

    console.log('Uploading:', cleanData);

    const { data, error } = await supabase.from('equipments').upsert(cleanData, { onConflict: 'id_unico' }).select();

    if (error) {
        console.error('Error uploading:', error);
    } else {
        console.log('Success:', data);
    }
}

uploadMissing();
