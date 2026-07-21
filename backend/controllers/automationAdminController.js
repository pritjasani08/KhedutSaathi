const { getDbClient } = require('../config/db');
const eventBroker = require('../utils/eventBroker');
const automationLogger = require('../utils/automationLogger');
const crypto = require('crypto');

exports.replayFailedEvent = async (req, res) => {
    const { eventId } = req.params;
    const adminId = req.user.id; // From authMiddleware
    const { reason } = req.body;
    
    const adminClient = getDbClient(true);
    
    try {
        // 1. Fetch the failed event
        const { data: failedEvent, error: fetchError } = await adminClient
            .from('automation_failed_events')
            .select('*')
            .eq('id', eventId)
            .single();
            
        if (fetchError || !failedEvent) {
            return res.status(404).json({ error: 'Failed event not found' });
        }
        
        // 2. Check Expiration
        if (new Date(failedEvent.expires_at) < new Date()) {
            return res.status(400).json({ error: 'Cannot replay expired event' });
        }
        
        // 3. Mark as REPLAYING
        await adminClient
            .from('automation_failed_events')
            .update({ status: 'REPLAYING' })
            .eq('id', eventId);
            
        automationLogger.info('Replaying failed event', { eventId, adminId, reason });
        
        const payload = failedEvent.payload;
        // Ensure correlationId is preserved
        payload.correlationId = failedEvent.correlation_id || crypto.randomUUID();
        
        let replayOutcome = 'FAILED';
        let errorMessage = null;
        
        try {
            // 4. Republish to Broker
            // Note: The orchestrator will see a duplicate signature if it was marked FAILED,
            // but our new orchestrator logic allows it if we bypass the FAILED check, 
            // OR we can change the signature by updating the timestamp, but standard replay keeps it.
            // Wait, if the orchestrator checks idempotency, it will see FAILED and return true (skip).
            // To allow replay, we must either delete the processed_events record first, or have the orchestrator 
            // allow processing if status === 'FAILED'.
            // In AutomationOrchestrator.js, I updated it to say: "If it's FAILED or CANCELLED, we could process it again".
            // So we DO need to delete or update the processed_events record before republishing.
            
            const dateStr = new Date().toISOString().split('T')[0];
            const signature = crypto.createHash('sha256')
                .update(`${payload.eventType}:${payload.userId}:${payload.entityId || ''}:${dateStr}`)
                .digest('hex');
                
            // Delete the FAILED idempotency lock so it can be reprocessed cleanly
            await adminClient.from('automation_processed_events').delete().eq('signature', signature);
            
            // Re-publish! The orchestrator handles it asynchronously.
            // Wait, since we are returning an API response, we just publish it. If we want to await the result, 
            // we'd need a synchronous call, but eventBroker is async fire-and-forget.
            // We will just assume SUCCESS for the replay *dispatch*, and the orchestrator handles the actual result.
            // But wait, the prompt said: "On success, updates status to RESOLVED... On failure, updates status back to FAILED".
            // If the orchestrator processes it, the orchestrator will insert a NEW FAILED record if it fails again.
            // To cleanly tie it back, we can just mark THIS record as RESOLVED (replayed), and if it fails again, 
            // a new DLQ record is created. Or we can await the orchestrator directly!
            // Let's await the orchestrator directly for a synchronous API response.
            
            const AutomationOrchestrator = require('./automationOrchestrator');
            // We bypass the broker and call the orchestrator directly so we can await it
            await AutomationOrchestrator.handleAutomationTrigger(payload);
            
            // If it didn't throw, we check if it succeeded
            const { data: idempData } = await adminClient
                .from('automation_processed_events')
                .select('status')
                .eq('signature', signature)
                .single();
                
            if (idempData && idempData.status === 'SUCCESS') {
                replayOutcome = 'SUCCESS';
            } else {
                throw new Error('Replayed event did not result in SUCCESS status');
            }
        } catch (err) {
            replayOutcome = 'FAILED';
            errorMessage = err.message;
        }
        
        // 5. Update DLQ Record
        const newStatus = replayOutcome === 'SUCCESS' ? 'RESOLVED' : 'FAILED';
        await adminClient
            .from('automation_failed_events')
            .update({ 
                status: newStatus,
                replay_count: failedEvent.replay_count + 1,
                last_replayed_at: new Date().toISOString(),
                last_error: errorMessage
            })
            .eq('id', eventId);
            
        // 6. Insert Audit Record
        await adminClient
            .from('automation_replay_audits')
            .insert([{
                failed_event_id: eventId,
                correlation_id: payload.correlationId,
                admin_id: adminId,
                replay_reason: reason || 'Manual Admin Replay',
                replay_outcome: replayOutcome,
                error_message: errorMessage
            }]);
            
        if (replayOutcome === 'SUCCESS') {
            return res.json({ message: 'Event replayed successfully', eventId });
        } else {
            return res.status(500).json({ error: 'Event replay failed', details: errorMessage });
        }
        
    } catch (error) {
        automationLogger.error('Replay endpoint error', { eventId, error: error.message });
        return res.status(500).json({ error: 'Internal server error during replay' });
    }
};
