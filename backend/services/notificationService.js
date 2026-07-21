const crypto = require('crypto');
const { getDbClient } = require('../config/db');
const logger = require('../utils/logger');
const axios = require('axios');
const farmerMemoryService = require('./farmerMemoryService');
const { resolveFarmerProfile } = require('./profileResolver');
const { getNotificationTemplates } = require('../constants/notificationTemplates');

const PYTHON_AI_URL = 'http://127.0.0.1:8000/api/ai/notifications/generate';

/**
 * Generates a unique signature for a notification candidate to prevent duplicates.
 */
function generateSignature(userId, type, trigger) {
    const payload = `${userId}:${type}:${trigger}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Service to deterministically detect alerts and fetch AI explanations.
 * Optionally accepts eventPayload for event-driven contextual generation.
 */
exports.generateProactiveNotificationsForUser = async (userId, userProfile = null, eventPayload = null) => {
    let farmerProfileId, profile, newCandidates = [];
    
    try {
        const resolved = await resolveFarmerProfile(userId);
        farmerProfileId = resolved.farmerProfileId;
        profile = resolved.profile;
        
        let candidates = [];
        
        if (eventPayload && eventPayload.eventType) {
            const templates = getNotificationTemplates(eventPayload.eventType, eventPayload.metadata);
            
            candidates = templates.map(t => ({
                id: crypto.randomUUID(),
                type: t.type,
                title: t.title,
                message: t.message,
                priority: t.type === 'ALERT' ? 'HIGH' : 'MEDIUM',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                trigger: eventPayload.eventType,
                rawFacts: eventPayload.metadata
            }));
        } else {
            // 1. Fetch recent weather
            const weather = { condition: "Heavy Rain", alert: true };
            if (weather.alert) {
                candidates.push({
                    id: crypto.randomUUID(),
                    type: 'WEATHER',
                    title: 'Heavy Rainfall Warning',
                    message: 'Heavy rainfall expected in your area in the next 48 hours.',
                    priority: 'HIGH',
                    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
                    trigger: 'WEATHER_RAIN_HEAVY',
                    rawFacts: { weather: "Heavy Rain" }
                });
            }
        }
        
        // Deduplicate using recent notifications
        const adminClient = getDbClient(true);
        for (const candidate of candidates) {
            const signature = generateSignature(userId, candidate.type, candidate.trigger);
            const { data: existing } = await adminClient
                .from('notifications')
                .select('id')
                .eq('notification_signature', signature)
                .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
                .limit(1);
                
            if (!existing || existing.length === 0) {
                candidate._signature = signature;
                newCandidates.push(candidate);
            }
        }
        
        if (newCandidates.length === 0) return [];
        
        // Fetch context
        const { memory, recentDecisions } = await farmerMemoryService.getFarmerMemory(userId);

        const payload = {
            requestId: crypto.randomUUID(),
            farmer_id: userId,
            profile: profile || {},
            memory: memory,
            recent_decisions: recentDecisions,
            candidates: newCandidates
        };
        
        let aiResponse;
        let retries = 2;
        while (retries >= 0) {
            try {
                aiResponse = await axios.post(PYTHON_AI_URL, payload, { timeout: 15000 });
                if (aiResponse.data.status === 'success') {
                    break;
                }
            } catch (err) {
                if (retries === 0) throw err;
            }
            retries--;
            await new Promise(res => setTimeout(res, 1000));
        }
        
        if (!aiResponse || !aiResponse.data || aiResponse.data.status !== 'success') {
            throw new Error(aiResponse?.data?.error || "AI generation failed after retries");
        }
        
        return aiResponse.data.notifications.map(n => {
            const originalCandidate = newCandidates.find(c => c.id === n.id);
            return {
                user_id: farmerProfileId,
                type: n.type,
                title: n.title,
                message: n.message,
                priority: n.priority,
                expires_at: n.expiresAt,
                source: 'AI',
                generated_by: 'SYSTEM',
                notification_signature: originalCandidate._signature,
                context_snapshot: { 
                    facts: n.rawFacts,
                    personalization_factors: n.personalization_factors || null
                },
            };
        });
        
    } catch (err) {
        logger.warn(`AI Notification Engine unreachable, falling back to basic rules for ${userId}: ${err.message}`);
        
        // If it failed before resolving profile, we can't insert.
        if (!farmerProfileId || newCandidates.length === 0) {
            return [];
        }
        
        // Fallback: Map basic rule-based candidates directly
        return newCandidates.map(c => ({
            user_id: farmerProfileId,
            type: c.type,
            title: c.title,
            message: c.message,
            priority: c.priority,
            expires_at: c.expiresAt,
            source: 'SYSTEM',
            generated_by: 'SYSTEM',
            notification_signature: c._signature,
            context_snapshot: { facts: c.rawFacts }
        }));
    }
};
