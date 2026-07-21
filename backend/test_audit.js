const { getDbClient } = require('./config/db');
const adminClient = getDbClient(true);
const userId = '125329df-5b47-4d2a-ae5a-5be9e9b637cd';

async function run() {
    const res = {};
    
    // 1. Farmer Profile
    const { data: profile } = await adminClient.from('farmer_profiles').select('*').eq('user_id', userId).single();
    res.profile = profile || null;
    
    // 2. Crop Planner History (maybe crop_plans or ai_decisions)
    const { data: decisions } = await adminClient.from('ai_decisions').select('*').eq('user_id', userId);
    res.ai_decisions = decisions;
    
    // 3. Disease Diagnosis
    const { data: diseases } = await adminClient.from('disease_diagnosis').select('*').eq('user_id', userId);
    res.diseases = diseases;
    
    // 4. Marketplace
    const { data: listings } = await adminClient.from('marketplace_listings').select('*').eq('farmer_id', userId);
    res.marketplace = listings;
    
    // 5. Notifications
    if (profile) {
        const { data: notifs } = await adminClient.from('notifications').select('*').eq('user_id', profile.id);
        res.notifications_profile = notifs;
    }
    const { data: notifs } = await adminClient.from('notifications').select('*').eq('user_id', userId);
    res.notifications_auth = notifs;
    
    // 6. Automation Processed
    const { data: processed } = await adminClient.from('automation_processed_events').select('*').like('event_key', `%${userId}%`);
    res.automation_processed = processed;
    
    // 7. Automation Failed
    const { data: failed } = await adminClient.from('automation_failed_events').select('*'); // no user_id column probably
    res.automation_failed = failed.filter(f => JSON.stringify(f.payload).includes(userId));
    
    // Let's also check if they are in the auth.users table
    const { data: authUser } = await adminClient.auth.admin.getUserById(userId);
    res.auth_user_exists = !!authUser.user;
    
    console.log(JSON.stringify(res, null, 2));
}
run();
