const https = require('https');
const fs = require('fs');
const path = require('path');

function downloadFile(url, outputPath) {
    https.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
            return downloadFile(response.headers.location, outputPath);
        }

        if (response.statusCode !== 200) {
            console.error(`❌ Error HTTP: ${response.statusCode}`);
            return;
        }

        const fileStream = fs.createWriteStream(outputPath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
            fileStream.close();
            console.log('✅ Archivo guardado.');
        });
    }).on('error', (err) => {
        console.error('❌ Error:', err.message);
    });
}

const url = 'https://esehusj-my.sharepoint.com/:x:/g/personal/coordinacion_biomedicos_husj_gov_co/IQDr3O84U3OzQrY7w3UCWBtBAcCh0_DH28klms8E4Y2GqDo?download=1';
const outputPath = path.join(__dirname, '../Mantenimientos/INVENTARIO_MAESTRO_2026.xlsx');

downloadFile(url, outputPath);
