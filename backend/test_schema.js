const { getDbClient } = require('./config/db');

async function run() {
    const adminClient = getDbClient(true);
    // Find the distinct user_ids in farm_timeline
    const { data: timelineRaw } = await adminClient.from('farm_timeline').select('user_id');
    const uids = [...new Set(timelineRaw.map(r => r.user_id))];
    console.log("Distinct user_ids in farm_timeline:", uids);
    
    // Check if these are Auth User IDs or Profile IDs
    for (const uid of uids) {
        const { data: user } = await adminClient.from('users').select('id').eq('id', uid).single();
        const { data: profile } = await adminClient.from('farmer_profiles').select('id').eq('id', uid).single();
        console.log(`UID: ${uid} -> isUser: ${!!user}, isProfile: ${!!profile}`);
    }
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
