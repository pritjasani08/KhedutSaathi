const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { getDbClient } = require('../config/db');
const eventBroker = require('../utils/eventBroker');
const EVENTS = require('../constants/events');
const crypto = require('crypto');

async function runValidation() {
    console.log("=== STARTING PRODUCTION VALIDATION ===");
    const adminClient = getDbClient(true);
    let allPassed = true;

    // 1. Verify DB Connection & Metrics schema
    console.log("\n1. Verifying DB schemas...");
    try {
        const { error: mErr } = await adminClient.from('automation_metrics').select('id').limit(1);
        if (mErr) throw new Error(`automation_metrics missing: ${mErr.message}`);
        
        const { error: pErr } = await adminClient.from('automation_processed_events').select('signature').limit(1);
        if (pErr) throw new Error(`automation_processed_events missing: ${pErr.message}`);
        
        const { error: fErr } = await adminClient.from('automation_failed_events').select('id').limit(1);
        if (fErr) throw new Error(`automation_failed_events missing: ${fErr.message}`);
        
        console.log("✅ DB Schemas (Metrics, Processed, Failed) exist and accessible.");
    } catch (e) {
        console.log("❌ DB Schema check failed:", e.message);
        allPassed = false;
    }

    // We can't safely test the entire flow purely programmatically without mock users and bypassing AI unless we use a test user.
    // So we will perform a static code check and a dry-run event payload generation.
    console.log("\n2. Verifying Event Payload Versioning...");
    try {
        const payload = EVENTS.buildEventPayload(EVENTS.DISEASE_DETECTED, crypto.randomUUID(), 'test-entity', 'diagnosis', {});
        if (payload.version !== 1) throw new Error("Payload version is not 1");
        if (payload.eventType !== EVENTS.DISEASE_DETECTED) throw new Error("Incorrect event type");
        console.log("✅ Event Payload Contract is correct (version 1).");
    } catch (e) {
        console.log("❌ Event Payload Contract failed:", e.message);
        allPassed = false;
    }

    console.log("\n=== VALIDATION SCRIPT COMPLETE ===");
}

runValidation().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
