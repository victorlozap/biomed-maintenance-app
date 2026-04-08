const https = require('https');

const urlBase = "gzdspkhpxkibjxbfdeuc.supabase.co";
const path = "/rest/v1/equipments?equipo=eq.BOMBA%20DE%20INFUSI%C3%93N&select=id_unico,numero_serie,id";
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MjM1OSwiZXhwIjoyMDkwNDU4MzU5fQ.yCjghk-O_HOttUJBDhJ_LvkcdbLN97GMyrSwyV574Tw";
const headers = {
    "apikey": apikey,
    "Authorization": `Bearer ${apikey}`,
    "Content-Type": "application/json"
};

const getReq = {
    hostname: urlBase,
    path: path,
    method: 'GET',
    headers: headers
};

const req = https.request(getReq, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const bombs = JSON.parse(data);
        console.log(`Total BOMBA DE INFUSION in DB: ${bombs.length}`);
        
        const toDeleteIds = [];
        for (const b of bombs) {
            if ((b.id_unico && b.id_unico.endsWith('.0')) || (b.numero_serie && b.numero_serie.endsWith('.0'))) {
                toDeleteIds.push(b.id);
            }
        }
        
        console.log(`Items to delete ending in .0: ${toDeleteIds.length}`);
        
        let deleted = 0;
        
        const processDelete = async () => {
            for (const id of toDeleteIds) {
                await new Promise(resolve => {
                    const delReqOptions = {
                        hostname: urlBase,
                        path: `/rest/v1/equipments?id=eq.${id}`,
                        method: 'DELETE',
                        headers: headers
                    };
                    const delReq = https.request(delReqOptions, (delRes) => {
                        if (delRes.statusCode >= 200 && delRes.statusCode < 300) {
                            deleted++;
                        }
                        resolve();
                    });
                    delReq.on('error', () => resolve());
                    delReq.end();
                });
            }
            console.log(`Deleted ${deleted} items. Remaining BOMBAS should be ${bombs.length - deleted}`);
        };
        
        processDelete();
    });
});

req.on('error', e => console.error(e));
req.end();
