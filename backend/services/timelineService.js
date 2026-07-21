const crypto = require('crypto');
const { getDbClient } = require('../config/db');
const logger = require('../utils/logger');
const axios = require('axios');
const farmerMemoryService = require('./farmerMemoryService');
const { resolveFarmerProfile } = require('./profileResolver');
const { getTimelineTemplates } = require('../constants/timelineTemplates');

const PYTHON_AI_TIMELINE_URL = 'http://127.0.0.1:8000/api/ai/timeline/generate';

/**
 * Generates a unique signature to prevent creating duplicate timeline tasks for the same event.
 */
function generateSignature(userId, taskType, trigger, scheduledDateStr) {
    const payload = `${userId}:${taskType}:${trigger}:${scheduledDateStr}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Core generation logic used by both user-triggered and scheduled generations
 * Optionally accepts an eventPayload to generate contextual tasks based on the trigger event.
 */
async function coreGenerateLogic(dbClient, userId, eventPayload = null) {
    const { farmerProfileId, profile } = await resolveFarmerProfile(userId);
    let candidates = [];
    
    if (eventPayload && eventPayload.eventType) {
        // Event-driven contextual generation
        const templates = getTimelineTemplates(eventPayload.eventType, eventPayload.metadata);
        
        candidates = templates.map(t => ({
            id: crypto.randomUUID(),
            task_type: t.task_type.toUpperCase(),
            title: t.title,
            description: t.description,
            scheduled_date: t.due_date,
            priority: (t.priority || 'MEDIUM').toUpperCase(),
            source: eventPayload.source.toUpperCase(),
            trigger: eventPayload.eventType,
            rawFacts: eventPayload.metadata,
            confidence: 95
            
        }));
    } else {
        // Legacy fallback or user-requested refresh logic
        const { memory } = await farmerMemoryService.getFarmerMemory(userId);
        if (memory && memory.preferred_crops && memory.preferred_crops.length > 0) {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            
            candidates.push({
                id: crypto.randomUUID(),
                task_type: 'SCOUTING',
                title: `Scout ${memory.preferred_crops[0]} for pests`,
                description: `Routine scouting for ${memory.preferred_crops[0]}`,
                scheduled_date: nextWeek.toISOString(),
                priority: 'MEDIUM',
                source: 'MEMORY',
                trigger: 'ROUTINE_SCOUTING',
                rawFacts: { crop: memory.preferred_crops[0] },
                confidence: 85
            });
        }
    }

    // Filter out candidates if a PENDING task with the same trigger already exists
    const finalCandidates = [];
    for (const c of candidates) {
        const { data: existingPending } = await dbClient
            .from('farm_timeline')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'PENDING')
            .contains('context_snapshot', { trigger: c.trigger })
            .limit(1);
            
        if (!existingPending || existingPending.length === 0) {
            finalCandidates.push(c);
        }
    }
    
    if (finalCandidates.length === 0) return [];

    // Map candidates to DB format (Skipping AI loop for direct rules if preferred)
    const tasksToInsert = finalCandidates.map(c => ({
        user_id: userId,
        task_type: c.task_type,
        title: c.title,
        description: c.description,
        scheduled_date: c.scheduled_date,
        priority: c.priority,
        status: 'PENDING',
        source: c.source,
        confidence: c.confidence,
        context_snapshot: { 
            trigger: c.trigger,
            facts: c.rawFacts, 
            explanation: {
                why: "System generated contextual recommendation.",
            }
        }
    }));
    
    // We will still allow the Python AI to enhance these if they exist, but for now we skip AI 
    // if it's already mapped contextually via templates, to save time and reduce errors.
    // If AI enhancement is strictly needed, it should be done here on `finalCandidates`.
    
    // For now, insert directly for reliability
    if (tasksToInsert.length > 0) {
        const { error: insertError } = await dbClient
            .from('farm_timeline')
            .insert(tasksToInsert);
            
        if (insertError) {
            logger.error(`Failed to insert timeline tasks for ${userId}: ${insertError.message}`);
        }
    }
    
    return tasksToInsert;

}


// ==========================================
// USER-SCOPED SERVICES (Called by Controllers)
// ==========================================
exports.user = {
    /**
     * Triggered directly by the user (e.g. hitting refresh).
     * Uses Service Role client because Anon client lacks proper auth context in this architecture, 
     * but programmatically enforces user_id boundaries.
     */
    generateTimeline: async (userId) => {
        const adminClient = getDbClient(true);
        return await coreGenerateLogic(adminClient, userId);
    },

    getTimeline: async (userId) => {
        const adminClient = getDbClient(true);
        const { farmerProfileId } = await resolveFarmerProfile(userId);
        
        const { data, error } = await adminClient
            .from('farm_timeline')
            .select('*')
            .eq('user_id', userId) // Defensive authorization check
            .order('scheduled_date', { ascending: true });

        if (error) throw error;
        return data;
    },

    updateTaskStatus: async (userId, taskId, statusUpdate) => {
        const adminClient = getDbClient(true);
        const { farmerProfileId } = await resolveFarmerProfile(userId);
        
        // 1. Verify ownership BEFORE modifying
        const { data: existing, error: fetchErr } = await adminClient
            .from('farm_timeline')
            .select('id')
            .eq('id', taskId)
            .eq('user_id', userId)
            .single();
            
        if (fetchErr || !existing) {
            throw new Error('Unauthorized: Task does not belong to user or does not exist.');
        }

        // 2. Perform Update
        const { data, error } = await adminClient
            .from('farm_timeline')
            .update(statusUpdate)
            .eq('id', taskId)
            .eq('user_id', userId) // Double safeguard
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    postponeTask: async (userId, taskId, postponeDays = 1) => {
        const adminClient = getDbClient(true);
        const { farmerProfileId } = await resolveFarmerProfile(userId);
        
        // 1. Verify ownership BEFORE modifying
        const { data: task, error: fetchErr } = await adminClient
            .from('farm_timeline')
            .select('scheduled_date')
            .eq('id', taskId)
            .eq('user_id', userId)
            .single();
            
        if (fetchErr || !task) {
            throw new Error('Unauthorized: Task does not belong to user or does not exist.');
        }
        
        const newDate = new Date(task.scheduled_date);
        newDate.setDate(newDate.getDate() + postponeDays);

        return await exports.user.updateTaskStatus(userId, taskId, {
            status: 'POSTPONED',
            postponed_until: newDate.toISOString(),
            scheduled_date: newDate.toISOString()
        });
    },
    
    createTaskFromNotification: async (userId, notificationId) => {
        const adminClient = getDbClient(true);
        const { farmerProfileId } = await resolveFarmerProfile(userId);
        
        // Explicit ownership check
        const { data: notification, error: fetchErr } = await adminClient
            .from('notifications')
            .select('*')
            .eq('id', notificationId)
            .eq('user_id', farmerProfileId)
            .single();
            
        if (fetchErr || !notification) {
            throw new Error("Unauthorized: Notification not found or unauthorized");
        }
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
    
        const task = {
            user_id: userId,
            task_type: notification.type === 'WEATHER' ? 'GENERAL' : 'SCOUTING',
            title: notification.title,
            description: notification.message,
            scheduled_date: tomorrow.toISOString(),
            priority: notification.priority,
            status: 'PENDING',
            source: 'NOTIFICATION',
            confidence: 95,
            context_snapshot: {
                from_notification_id: notificationId,
                facts: notification.context_snapshot?.facts || {}
            }
        };
    
        const { data, error } = await adminClient
            .from('farm_timeline')
            .insert(task)
            .select()
            .single();
            
        if (error) throw error;
        return data;
    }
};

// ==========================================
// ADMIN-SCOPED SERVICES (Called by Schedulers)
// ==========================================
exports.admin = {
    /**
     * Triggered by background jobs for batch generation
     */
    generateTimelineForUser: async (userId, eventPayload = null) => {
        const adminClient = getDbClient(true);
        return await coreGenerateLogic(adminClient, userId, eventPayload);
    },
    
    /**
     * Expire old pending tasks
     */
    expireOldTasks: async () => {
        const adminClient = getDbClient(true);
        const { error } = await adminClient
            .from('farm_timeline')
            .update({ status: 'DISMISSED' })
            .lt('expires_at', new Date().toISOString())
            .eq('status', 'PENDING');
            
        if (error) {
            logger.error(`Error expiring old timeline tasks: ${error.message}`);
        }
    }
};
