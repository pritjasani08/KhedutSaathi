const crypto = require('crypto');
const { getDbClient } = require('../config/db');
const logger = require('../utils/logger');
const axios = require('axios');
const farmerMemoryService = require('./farmerMemoryService');
const { resolveFarmerProfile } = require('./profileResolver');

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
 */
async function coreGenerateLogic(dbClient, userId) {
    const { farmerProfileId, profile } = await resolveFarmerProfile(userId);
    const candidates = [];
    const now = new Date();
    
    // 1. Weather Checks (Simulated)
    const weatherAlert = true; 
    if (weatherAlert) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        candidates.push({
            id: crypto.randomUUID(),
            task_type: 'IRRIGATION',
            title: 'Delay Irrigation',
            description: 'Heavy rainfall expected.',
            scheduled_date: tomorrow.toISOString(),
            priority: 'HIGH',
            source: 'WEATHER',
            trigger: 'WEATHER_HEAVY_RAIN',
            rawFacts: { condition: "Heavy Rain Forecast" },
            confidence: 90
        });
    }

    // 2. Crop Growth Stages
    const { memory, recentDecisions } = await farmerMemoryService.getFarmerMemory(userId);
    
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

    // 3. Government Scheme Deadline (Simulated)
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 15);
    candidates.push({
        id: crypto.randomUUID(),
        task_type: 'GENERAL',
        title: 'Apply for PM-Kisan Scheme',
        description: 'Deadline approaching.',
        scheduled_date: nextMonth.toISOString(),
        priority: 'HIGH',
        source: 'SCHEME',
        trigger: 'SCHEME_DEADLINE',
        rawFacts: { scheme: "PM-Kisan", deadline: nextMonth.toISOString() },
        confidence: 95
    });

    if (candidates.length === 0) return [];

    // 4. Filter duplicates via context_snapshot->signature
    const newCandidates = [];
    for (const candidate of candidates) {
        const signature = generateSignature(userId, candidate.task_type, candidate.trigger, candidate.scheduled_date.split('T')[0]);
        
        const { data } = await dbClient
            .from('farm_timeline')
            .select('id')
            .eq('user_id', farmerProfileId) // Explicit ownership check
            .contains('context_snapshot', { signature })
            .limit(1);
            
        if (!data || data.length === 0) {
            candidate._signature = signature;
            newCandidates.push(candidate);
        }
    }
    
    if (newCandidates.length === 0) return [];

    // 5. Send to Python Engine
    const payload = {
        requestId: crypto.randomUUID(),
        farmer_id: userId,
        profile: profile || {},
        memory: memory,
        recent_decisions: recentDecisions,
        candidates: newCandidates
    };
    
    let tasksToInsert = [];
    try {
        const aiResponse = await axios.post(PYTHON_AI_TIMELINE_URL, payload, { timeout: 5000 });
        
        if (aiResponse.data.status !== 'success') {
            throw new Error(aiResponse.data.error || "AI timeline explanation failed");
        }
        
        // 6. Map and Insert (AI enhanced)
        tasksToInsert = aiResponse.data.tasks.map(t => {
            const originalCandidate = newCandidates.find(c => c.id === t.id);
            return {
                user_id: farmerProfileId,
                task_type: t.task_type,
                title: t.title,
                description: t.description,
                scheduled_date: t.scheduled_date,
                priority: t.priority,
                status: 'PENDING',
                source: t.source,
                confidence: t.confidence,
                context_snapshot: { 
                    facts: t.rawFacts, 
                    signature: originalCandidate._signature,
                    personalization_factors: t.personalization_factors || [],
                    explanation: {
                        why: t.why,
                        impact: t.impact,
                        risks: t.risks,
                        next_actions: t.next_actions
                    }
                }
            };
        });
    } catch (err) {
        logger.warn(`AI Timeline Engine unreachable, falling back to basic rules: ${err.message}`);
        
        // Fallback: Map basic rule-based candidates directly
        tasksToInsert = newCandidates.map(c => ({
            user_id: farmerProfileId,
            task_type: c.task_type,
            title: c.title,
            description: c.description,
            scheduled_date: c.scheduled_date,
            priority: c.priority,
            status: 'PENDING',
            source: c.source,
            confidence: c.confidence,
            context_snapshot: { 
                facts: c.rawFacts, 
                signature: c._signature,
                explanation: {
                    why: "System generated recommendation.",
                }
            }
        }));
    }

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
            .eq('user_id', farmerProfileId) // Defensive authorization check
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
            .eq('user_id', farmerProfileId)
            .single();
            
        if (fetchErr || !existing) {
            throw new Error('Unauthorized: Task does not belong to user or does not exist.');
        }

        // 2. Perform Update
        const { data, error } = await adminClient
            .from('farm_timeline')
            .update(statusUpdate)
            .eq('id', taskId)
            .eq('user_id', farmerProfileId) // Double safeguard
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
            .eq('user_id', farmerProfileId)
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
            user_id: farmerProfileId,
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
    generateTimelineForUser: async (userId) => {
        const adminClient = getDbClient(true);
        return await coreGenerateLogic(adminClient, userId);
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
