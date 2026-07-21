const { getDbClient } = require('./config/db');

async function run() {
    const adminClient = getDbClient(true);
    const userId = 'd89cea52-e03b-4f74-91bf-efe7eaac3156';

    const { data: user } = await adminClient.from('users').select('*').eq('id', userId).single();
    console.log("User:", user?.id ? "Found" : "Not Found");
    
    const { data: profileAsUserId } = await adminClient.from('farmer_profiles').select('*').eq('user_id', userId).single();
    console.log("Profile where user_id = userId:", profileAsUserId?.id);

    const { data: profileAsId } = await adminClient.from('farmer_profiles').select('*').eq('id', userId).single();
    console.log("Profile where id = userId:", profileAsId?.id);
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
