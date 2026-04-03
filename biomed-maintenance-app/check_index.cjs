const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gzdspkhpxkibjxbfdeuc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZHNwa2hweGtpYmp4YmZkZXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODIzNTksImV4cCI6MjA5MDQ1ODM1OX0.gQockW2pLcQiJ4xGX5WL6OL5mWFI9LqBQAEODN1kkZI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIndex() {
    // Fetch all IDs, ordered by id_unico ascending
    let allIds = [];
    let from = 0;
    while (true) {
        const { data, error } = await supabase.from('equipments').select('id_unico').order('id_unico', { ascending: true }).range(from, from + 999);
        if (error || !data || data.length === 0) break;
        allIds = allIds.concat(data.map(i => i.id_unico));
        from += 1000;
    }

    const testId = '573317';
    const index = allIds.indexOf(testId);
    console.log(`Index of ${testId} in sorted list: ${index}`);
    console.log(`Total IDs: ${allIds.length}`);
}

checkIndex();
