const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODIzNTksImV4cCI6MjA5MDQ1ODM1OX0.gQockW2pLcQiJ4xGX5WL6OL5mWFI9LqBQAEODN1kkZI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSample() {
    const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .eq('id_unico', '573317')
        .single();

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Sample Data for 573317:', JSON.stringify(data, null, 2));
}

checkSample();
