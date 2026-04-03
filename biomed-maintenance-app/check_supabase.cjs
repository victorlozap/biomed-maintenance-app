const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODIzNTksImV4cCI6MjA5MDQ1ODM1OX0.gQockW2pLcQiJ4xGX5WL6OL5mWFI9LqBQAEODN1kkZI';
const supabase = createClient(supabaseUrl, supabaseKey);

const idsToFind = ['544963', '573306', '573307', '573308', '573309', '573310', '573311', '573313', '573314', '573315', '573316', '573318', '573319', '573312', '573317'];

async function checkSupabase() {
    console.log('--- CHECKING SUPABASE ---');
    const { data, error } = await supabase
        .from('equipments')
        .select('id_unico, equipo, marca, modelo')
        .in('id_unico', idsToFind);

    if (error) {
        console.error('Error fetching from Supabase:', error);
        return;
    }

    console.log(`Found ${data.length} out of ${idsToFind.length} in Supabase:`);
    data.forEach(item => {
        console.log(` - ID: ${item.id_unico}, Equipo: ${item.equipo}`);
    });

    const missingIds = idsToFind.filter(id => !data.find(item => item.id_unico === id));
    console.log('Missing IDs:', missingIds);
}

checkSupabase();
