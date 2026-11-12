const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const OUTPUT_DIR = path.resolve(__dirname, '../temp_pilot_images');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Catálogo de los 10 modelos prioritarios con fuentes verificadas
const PILOT_MODELS = [
  {
    marca: 'Gentec',
    modelo: 'FM-197B-15L-CH',
    equipo: 'FLUJOMETRO DE OXIGENO',
    filename: 'Gentec_FM-197B-15L-CH.png',
    urls: [
      'https://www.genstartech.com/sites/default/files/styles/product_slider/public/product-images/FM197B-6L.jpg',
      'https://servimedicingenieria.com/wp-content/uploads/2021/04/FM197B-15L-CH.jpg'
    ]
  },
  {
    marca: 'Lenz',
    modelo: 'GZ-805',
    equipo: 'TENSIOMETRO DIGITAL',
    filename: 'Lenz_GZ-805.png',
    urls: [
      'https://http2.mlstatic.com/D_NQ_NP_907356-MCO53531147783_012023-O.webp',
      'https://exitocol.vtexassets.com/arquivos/ids/31481767/tensiometro-digital-lenz-con-altavoz-y-luz.jpg?v=638973690984270000',
      'https://almacenmedico.com/cdn/shop/products/GZ805.jpg?v=1706201862&width=1920'
    ]
  },
  {
    marca: 'Oxywatch',
    modelo: 'MD300C29',
    equipo: 'PULSOXIMETRO DIGITAL',
    filename: 'Oxywatch_MD300C29.png',
    urls: [
      'https://global.choicemmed.com/cdn/shop/products/1_a06a2471-f522-458b-8fc7-9deb57aad661_1500x.jpg?v=1651398723',
      'https://equibiomedic.com/wp-content/uploads/2025/10/PULSOXIMETRO-CHOICEMMED-MD300C29.jpg',
      'https://www.enfermania.com/cdn/shop/files/9317.png?v=1785414096'
    ]
  },
  {
    marca: 'Caresens',
    modelo: 'N VOICE',
    equipo: 'GLUCOMETRO PARLANTE',
    filename: 'Caresens_N_VOICE.png',
    urls: [
      'https://i-sens.com/wp-content/uploads/2024/11/img-caresens-n-voice.jpg',
      'http://pharmacodiabetes.co.nz/cdn/shop/files/caresens-n-voice.jpg?v=1776727894'
    ]
  },
  {
    marca: 'Pahsco',
    modelo: '434',
    equipo: 'FLUJOMETRO DE OXIGENO',
    filename: 'Pahsco_434.png',
    urls: [
      'https://img.medicalexpo.es/images_me/photo-mg/69644-18096158.jpg',
      'https://www.pahsco.com.tw/upload/catalog_m/ALL_catalog_22H05_WMFMWEtsAk.jpg'
    ]
  },
  {
    marca: 'Htc',
    modelo: 'HTC-2',
    equipo: 'TERMOHIGROMETRO DIGITAL',
    filename: 'Htc_HTC-2.png',
    urls: [
      'https://monitox.com.co/wp-content/uploads/2022/10/FOTO-PRODUCTO.png',
      'https://greenforest.com.co/wp-content/uploads/2020/03/Captura-de-pantalla-de-2020-03-09-12-11-44.jpg'
    ]
  },
  {
    marca: 'Acare',
    modelo: 'VRA-391',
    equipo: 'VACUTRON / REGULADOR DE SUCCION',
    filename: 'Acare_VRA-391.png',
    urls: [
      'https://img.medicalexpo.es/images_me/photo-mg/79300-14815361.jpg',
      'https://acaretech.com/images/Suction_VRF-701.gif'
    ]
  },
  {
    marca: 'Acare',
    modelo: 'FA-OS-04',
    equipo: 'FLUJOMETRO DE OXIGENO',
    filename: 'Acare_FA-OS-04.png',
    urls: [
      'https://imcolmedica.com.co/wp-content/uploads/2025/09/01002765.jpg',
      'https://acaretech.com/images/Flowmeter_FA-AS-02_100233.jpg'
    ]
  },
  {
    marca: 'Pulmo-Med',
    modelo: '7E-A',
    equipo: 'ASPIRADOR DE SECRECIONES',
    filename: 'Pulmo-Med_7E-A.png',
    urls: [
      'https://technoin.com.co/wp-content/uploads/2020/07/Succionador-Aspirador-De-Secreciones-7E-A.jpg',
      'https://hergom-medical.com/cdn/shop/files/7E-A_720x.jpg?v=1792542524'
    ]
  },
  {
    marca: 'Edan',
    modelo: 'iM70',
    equipo: 'MONITOR DE SIGNOS VITALES',
    filename: 'Edan_iM70.png',
    urls: [
      'https://edanusa.com/wp-content/uploads/sites/12/2020/12/im70device-1.png',
      'https://mfimedical.com/cdn/shop/files/edan-im70-patient-monitor.jpg?v=1649903404'
    ]
  }
];

function downloadUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Demasiadas redirecciones HTTP'));

    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      },
      rejectUnauthorized: false,
      timeout: 15000
    }, (res) => {
      // Manejar redirecciones 301, 302, 307, 308
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, url).toString();
        }
        res.resume();
        return resolve(downloadUrl(redirectUrl, maxRedirects - 1));
      }

      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          buffer,
          contentType: res.headers['content-type'] || 'image/png',
          size: buffer.length
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout de conexión (15s)'));
    });

    req.on('error', reject);
  });
}

async function run() {
  console.log('===============================================================');
  console.log('📥 DESCARGADOR DE FOTOS OFICIALES - PILOTO TOP 10 MODELOS HUSJ');
  console.log('===============================================================');
  console.log(`📁 Directorio de salida: ${OUTPUT_DIR}\n`);

  const results = [];

  for (let i = 0; i < PILOT_MODELS.length; i++) {
    const item = PILOT_MODELS[i];
    console.log(`[${i + 1}/${PILOT_MODELS.length}] Procesando ${item.marca} - ${item.modelo} (${item.equipo})...`);

    let downloaded = false;
    for (const url of item.urls) {
      try {
        console.log(`   Intentando: ${url}`);
        const { buffer, contentType, size } = await downloadUrl(url);

        if (size < 5000) {
          console.warn(`   ⚠️ Tamaño sospechosamente bajo (${size} bytes). Descartando.`);
          continue;
        }

        const outPath = path.join(OUTPUT_DIR, item.filename);
        fs.writeFileSync(outPath, buffer);
        console.log(`   ✅ Guardado exitoso: ${item.filename} (${(size / 1024).toFixed(1)} KB, Tipo: ${contentType})`);
        results.push({ item, success: true, size, filename: item.filename });
        downloaded = true;
        break;
      } catch (err) {
        console.warn(`   ❌ Falló intento: ${err.message}`);
      }
    }

    if (!downloaded) {
      console.error(`   🛑 No se pudo descargar imagen para ${item.marca} ${item.modelo}`);
      results.push({ item, success: false });
    }
  }

  console.log('\n===============================================================');
  console.log('📊 RESUMEN FINAL DE DESCARGAS');
  console.log('===============================================================');
  const successCount = results.filter(r => r.success).length;
  console.log(`Descargas exitosas: ${successCount} de ${PILOT_MODELS.length}`);
  
  if (successCount === PILOT_MODELS.length) {
    console.log('🎉 Todos los modelos cuentan con su foto lista para revisión humana.');
  } else {
    console.log('⚠️ Algunos modelos fallaron y requieren fuente alternativa.');
  }
}

run();

