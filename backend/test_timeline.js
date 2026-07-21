const { getDbClient } = require('./config/db');
const timelineService = require('./services/timelineService');

async function run() {
    const adminClient = getDbClient(true);
    
    // Simulate req.user
    const userId = 'd89cea52-e03b-4f74-91bf-efe7eaac3156'; // TEST_USER_ID
    console.log("Mock req.user:", { id: userId });

    const { data: timelineRaw } = await adminClient.from('farm_timeline').select('*');
    console.log(`Timeline table has ${timelineRaw.length} total rows.`);
    console.log("Sample:", timelineRaw.slice(0,2).map(r => ({ id: r.id, user_id: r.user_id, status: r.status, title: r.title, dismissed_at: r.dismissed_at })));
    
    const { data: notificationsRaw } = await adminClient.from('notifications').select('*');
    console.log(`Notifications table has ${notificationsRaw.length} total rows.`);
    console.log("Sample:", notificationsRaw.slice(0,2).map(r => ({ id: r.id, user_id: r.user_id })));

    try {
        const timeline = await timelineService.user.getTimeline(userId);
        console.log("Controller Returned:", timeline);
    } catch(err) {
        console.error("Error calling getTimeline:", err);
    }
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
