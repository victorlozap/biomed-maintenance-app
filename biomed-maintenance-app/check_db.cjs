const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODIzNTksImV4cCI6MjA5MDQ1ODM1OX0.gQockW2pLcQiJ4xGX5WL6OL5mWFI9LqBQAEODN1kkZI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- BUSCANDO TABLAS ---');
  // Usar una consulta que devuelva algo rápido
  const { data, error } = await supabase.rpc('get_tables'); // A ver si existe
  if (error) {
     console.log('RPC get_tables no disponible, probando select simple...');
     const tables = ['equipments', 'activities', 'protocols', 'maintenance_reports'];
     for(let t of tables) {
        const { count, error: err } = await supabase.from(t).select('*', { count: 'exact', head: true });
        console.log(`Tabla ${t}: ${err ? 'ERR: ' + err.message : count + ' registros'}`);
     }
  } else {
     console.log(data);
  }
}

check();
