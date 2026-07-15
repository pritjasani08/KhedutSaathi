const crypto = require('crypto');
const supabase = require('../config/supabaseClient');
const logger = require('../utils/logger');
const axios = require('axios');

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
 */
exports.generateProactiveNotificationsForUser = async (userId, profile) => {
    try {
        const candidates = [];
        
        // 1. Fetch recent weather (Simulated or real fetch)
        // In a real app, this would use the weatherService
        const weather = { condition: "Heavy Rain", alert: true };
        if (weather.alert) {
            candidates.push({
                id: crypto.randomUUID(),
                type: 'WEATHER',
                title: 'Heavy Rainfall Warning',
                priority: 'HIGH',
                trigger: 'WEATHER_HEAVY_RAIN',
                rawFacts: weather,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
            });
        }

        // 2. Market Alert Detection
        // e.g. check if primary_crop price dropped/spiked > 10%
        // (Skipped for brevity, but logic would live here)
        
        if (candidates.length === 0) return []; // No meaningful events detected
        
        // 3. Filter out candidates that have already been generated (prevent duplicates)
        const newCandidates = [];
        for (const candidate of candidates) {
            const signature = generateSignature(userId, candidate.type, candidate.trigger);
            const { data } = await supabase
                .from('notifications')
                .select('id')
                .eq('notification_signature', signature)
                .limit(1);
                
            if (!data || data.length === 0) {
                // Attach signature for downstream insertion
                candidate._signature = signature;
                newCandidates.push(candidate);
            }
        }
        
        if (newCandidates.length === 0) return [];

        // 4. Send to Python Engine for explanation (Enrichment only)
        const farmerMemoryService = require('./farmerMemoryService');
        const { memory, recentDecisions } = await farmerMemoryService.getFarmerMemory(profile.id || userId);

        const payload = {
            requestId: crypto.randomUUID(),
            farmer_id: userId,
            profile: profile || {},
            memory: memory,
            recent_decisions: recentDecisions,
            candidates: newCandidates
        };
        
        const aiResponse = await axios.post(PYTHON_AI_URL, payload, { timeout: 15000 });
        
        if (aiResponse.data.status !== 'success') {
            throw new Error(aiResponse.data.error || "AI generation failed");
        }
        
        return aiResponse.data.notifications.map(n => {
            const originalCandidate = newCandidates.find(c => c.id === n.id);
            return {
                user_id: userId,
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
        logger.error(`Failed to generate notifications for ${userId}: ${err.message}`);
        return [];
    }
};
