const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const crypto = require('crypto');
const { getDbClient } = require('../config/db');
const eventBroker = require('../utils/eventBroker');
const sseBroker = require('../utils/sseBroker');
const EVENTS = require('../constants/events');

// We need to require the orchestrator so it sets up its listeners in this node process
const orchestrator = require('../services/automationOrchestrator');

const TEST_USER_ID = 'd89cea52-e03b-4f74-91bf-efe7eaac3156'; // Test Farmer
const TEST_PROFILE_ID = TEST_USER_ID; // In this system, profile ID and user ID are often synonymous, but we'll use user_id directly.
const adminClient = getDbClient(true);

// Mock SSE client to capture broadcasted messages
class MockRes {
    constructor() { this.messages = []; }
    write(msg) { this.messages.push(msg); }
}

const mockRes = new MockRes();
const mockReq = { on: () => {} };

async function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function runValidation() {
    console.log("=== RUNTIME VALIDATION SCRIPT ===");
    
    // Setup SSE connection to test SSE delivery
    sseBroker.registerClient(TEST_USER_ID, mockRes, mockReq);
    
    // ------------------------------------------------------------------------
    // TEST 1: Disease Detection (Normal Flow)
    // ------------------------------------------------------------------------
    console.log("\n[TEST 1] Triggering Disease Detection");
    const entityId = crypto.randomUUID();
    const payload = EVENTS.buildEventPayload(EVENTS.DISEASE_DETECTED, TEST_USER_ID, entityId, 'diagnosis', { diseaseName: 'Rust' });
    
    console.log(`Action: Publishing DISEASE_DETECTED event for user ${TEST_USER_ID}`);
    eventBroker.publish(EVENTS.DISEASE_DETECTED, payload);
    
    await delay(3000); // Wait for orchestrator and DB inserts
    
    // Verification: Timeline
    const { data: timelineTasks } = await adminClient.from('farm_timeline')
        .select('*').contains('context_snapshot', { trigger: EVENTS.DISEASE_DETECTED })
        .order('created_at', { ascending: false }).limit(1);
    
    // Verification: Notification
    const { data: notifications } = await adminClient.from('notifications')
        .select('*').eq('type', 'URGENT')
        .order('created_at', { ascending: false }).limit(1);
        
    // Verification: Processed Events (Idempotency)
    const { data: processed } = await adminClient.from('automation_processed_events')
        .select('*').eq('event_type', EVENTS.DISEASE_DETECTED)
        .order('created_at', { ascending: false }).limit(1);
        
    // Verification: Metrics
    const { data: metrics } = await adminClient.from('automation_metrics')
        .select('*').eq('event_type', EVENTS.DISEASE_DETECTED)
        .order('created_at', { ascending: false }).limit(1);
        
    console.log("Evidence (Timeline):", timelineTasks[0]?.title);
    console.log("Evidence (Notification):", notifications[0]?.title);
    console.log("Evidence (Processed Event):", processed[0]?.signature);
    console.log("Evidence (Metrics):", metrics[0]?.status, `${metrics[0]?.execution_time_ms}ms`);
    console.log("Evidence (SSE Messages):", mockRes.messages.length > 0 ? "Received" : "None");
    mockRes.messages = []; // Clear for next test
    
    // ------------------------------------------------------------------------
    // TEST 2: Idempotency (Repeat exact same event)
    // ------------------------------------------------------------------------
    console.log("\n[TEST 2] Triggering Idempotency Check (Duplicate Event)");
    eventBroker.publish(EVENTS.DISEASE_DETECTED, payload); // EXACT SAME PAYLOAD
    await delay(2000);
    
    // Should NOT have generated new tasks. We check count.
    const { count: timelineCount } = await adminClient.from('farm_timeline')
        .select('*', { count: 'exact', head: true }).contains('context_snapshot', { trigger: EVENTS.DISEASE_DETECTED });
        
    console.log("Evidence (Timeline Count after Duplicate):", timelineCount);
    console.log("Evidence (SSE Messages):", mockRes.messages.length); // Should be 0
    
    // ------------------------------------------------------------------------
    // TEST 3: Dead Letter Queue (Force Failure)
    // ------------------------------------------------------------------------
    console.log("\n[TEST 3] Triggering Dead Letter Queue via Forced Failure");
    
    // Malform the payload to cause a crash inside mapping
    const badPayload = { 
        version: 1, 
        eventType: EVENTS.SCHEME_MATCHED,
        userId: TEST_USER_ID,
        timestamp: Date.now(),
        source: 'test'
    };
    
    // Monkey-patch orchestrator to throw an error for this specific event to test DLQ
    const originalTrigger = orchestrator.triggerTimelineGeneration;
    orchestrator.triggerTimelineGeneration = async (uid, pload) => {
        if (pload.eventType === EVENTS.SCHEME_MATCHED) {
            throw new Error("Simulated unrecoverable error for DLQ");
        }
        return originalTrigger.call(orchestrator, uid, pload);
    };
    
    eventBroker.publish(EVENTS.SCHEME_MATCHED, badPayload);
    await delay(2000);
    
    const { data: failedEvents } = await adminClient.from('automation_failed_events')
        .select('*').eq('event_type', EVENTS.SCHEME_MATCHED)
        .order('created_at', { ascending: false }).limit(1);
        
    console.log("Evidence (DLQ Error Message):", failedEvents[0]?.error_message);
    
    // ------------------------------------------------------------------------
    // TEST 4: Schema Validation
    // ------------------------------------------------------------------------
    console.log("\n[TEST 4] Triggering Schema Validation Error");
    try {
        eventBroker.publish('SOME_EVENT', { userId: '123' }); // Missing version, timestamp, etc
        console.log("Evidence (Schema Error): FAILED (Did not throw)");
    } catch (e) {
        console.log("Evidence (Schema Error):", e.message);
    }
    
    // ------------------------------------------------------------------------
    // TEST 5: DLQ Replay Flow
    // ------------------------------------------------------------------------
    console.log("\n[TEST 5] Triggering DLQ Replay");
    if (failedEvents && failedEvents.length > 0) {
        const eventId = failedEvents[0].id;
        console.log(`Action: Replaying DLQ event ${eventId}`);
        
        // Mock a direct call to the admin controller function
        const req = {
            params: { eventId },
            user: { id: TEST_USER_ID }, // Mock admin
            body: { reason: "Automated Replay Test" }
        };
        const res = {
            status: function(c) { this.code = c; return this; },
            json: function(j) { this.body = j; return this; }
        };
        
        const automationAdminController = require('../controllers/automationAdminController');
        await automationAdminController.replayFailedEvent(req, res);
        
        console.log(`Evidence (Replay API Response): [${res.code}]`, res.body?.message || res.body?.error);
        
        // Check DLQ status
        const { data: updatedEvent } = await adminClient.from('automation_failed_events').select('*').eq('id', eventId).single();
        console.log(`Evidence (DLQ Status): ${updatedEvent?.status}, Replay Count: ${updatedEvent?.replay_count}`);
        
        // Check Audit Table
        const { data: audits } = await adminClient.from('automation_replay_audits').select('*').eq('failed_event_id', eventId);
        console.log(`Evidence (Audit Table): Found ${audits?.length || 0} audits. Outcome: ${audits?.[0]?.replay_outcome}`);
    } else {
        console.log("Evidence: No failed event found to replay.");
    }
    
    console.log("\n=== SCRIPT COMPLETE ===");
}

runValidation().then(() => process.exit(0));
