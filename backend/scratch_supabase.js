const supabase = require('./config/supabaseClient');

async function inspectSupabase() {
    console.log("=== CHECKING 'profiles' TABLE ===");
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    console.log("Result:", data);
    console.log("Error:", error);
    
    console.log("=== CHECKING 'users' TABLE ===");
    const { data: ud, error: ue } = await supabase.from('users').select('*').limit(1);
    console.log("Users Error:", ue);
    
    console.log("=== CHECKING 'farmer_profiles' ===");
    const { data: fd, error: fe } = await supabase.from('farmer_profiles').select('*').limit(1);
    console.log("Farmer Profiles Error:", fe);
}

inspectSupabase();
