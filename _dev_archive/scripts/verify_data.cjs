const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://gzdspkhpxkibjxbfdeuc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODIzNTksImV4cCI6MjA5MDQ1ODM1OX0.gQockW2pLcQiJ4xGX5WL6OL5mWFI9LqBQAEODN1kkZI');

const targets = ['544963', '573306', '573307', '573308'];

async function verify() {
    console.log('--- Verificando equipos en Supabase ---');
    const { data, error } = await supabase
        .from('equipments')
        .select('id_unico, equipo, marca, modelo')
        .in('id_unico', targets);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('Equipos encontrados:');
    console.table(data);
    
    if (data.length === targets.length) {
        console.log('✅ TODOS los equipos de la imagen están ya en la DB.');
    } else {
        console.log(`❌ Solo se encontraron ${data.length} de ${targets.length}.`);
    }
}

verify();
