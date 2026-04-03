const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODIzNTksImV4cCI6MjA5MDQ1ODM1OX0.gQockW2pLcQiJ4xGX5WL6OL5mWFI9LqBQAEODN1kkZI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRange() {
    const { data: first } = await supabase.from('equipments').select('id_unico').order('id_unico', { ascending: true }).limit(5);
    const { data: last } = await supabase.from('equipments').select('id_unico').order('id_unico', { ascending: false }).limit(5);

    console.log('First 5 IDs in Supabase:', first.map(i => i.id_unico));
    console.log('Last 5 IDs in Supabase:', last.map(i => i.id_unico));
}

checkRange();
