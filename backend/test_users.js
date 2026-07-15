const supabase = require('./config/supabaseClient');

async function test() {
    const { data } = await supabase.from('farmer_profiles').select('id, full_name');
    console.log("FARMERS:", data);
}
test();
