const { getDbClient } = require('./config/db');
const { resolveFarmerProfile } = require('./services/profileResolver');
const timelineService = require('./services/timelineService');

async function testTimeline() {
    const userId = 'd89cea52-e03b-4f74-91bf-efe7eaac3156'; // From validation script
    console.log("Input userId (Auth ID):", userId);
    
    const { farmerProfileId } = await resolveFarmerProfile(userId);
    console.log("Resolved farmerProfileId:", farmerProfileId);
    
    const adminClient = getDbClient(true);
    
    // 1. Simple query (No filters except user_id)
    const { data: step1, error: err1 } = await adminClient
        .from('farm_timeline')
        .select('*')
        .eq('user_id', farmerProfileId);
        
    console.log(`\nQuery: select('*').eq('user_id', '${farmerProfileId}')`);
    if (err1) console.error("Error:", err1);
    console.log("Row count:", step1 ? step1.length : 0);
    
    // Let's also check what happens if we query with userId (Auth ID)
    const { data: authIdRows } = await adminClient
        .from('farm_timeline')
        .select('*')
        .eq('user_id', userId);
    console.log(`\nQuery: select('*').eq('user_id', '${userId}') (Auth ID)`);
    console.log("Row count:", authIdRows ? authIdRows.length : 0);
    
    // If the frontend was calling getTimeline before my fix, they would have gotten authIdRows.
    // Why did they see []? Because they probably tested with a DIFFERENT user!
    
}
testTimeline().then(() => process.exit(0));
