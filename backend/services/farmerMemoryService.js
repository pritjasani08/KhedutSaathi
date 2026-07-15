const supabase = require('../config/supabaseClient');
const logger = require('../utils/logger');

/**
 * Service to manage Farmer Memory and History seamlessly
 */
class FarmerMemoryService {
    
    /**
     * Retrieves the persistent memory and the last 10 historical decisions for a farmer
     */
    async getFarmerMemory(userId) {
        try {
            // 1. Fetch persistent memory
            const { data: memory, error: memoryError } = await supabase
                .from('farmer_memory')
                .select('*')
                .eq('user_id', userId)
                .single();
                
            if (memoryError && memoryError.code !== 'PGRST116') {
                logger.error(`Error fetching farmer memory for ${userId}:`, memoryError);
            }
            
            // 2. Fetch recent decisions (up to 5 for context)
            const { data: recentDecisions, error: decisionsError } = await supabase
                .from('ai_decisions')
                .select('id, title, decision_type, status, feedback, created_at, actual_crop_planted, actual_yield')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);
                
            if (decisionsError) {
                logger.error(`Error fetching recent decisions for ${userId}:`, decisionsError);
            }
            
            return {
                memory: memory || null,
                recentDecisions: recentDecisions || []
            };
        } catch (error) {
            logger.error(`getFarmerMemory unexpected error for ${userId}:`, error.message);
            return { memory: null, recentDecisions: [] };
        }
    }
    
    /**
     * Initializes or updates persistent memory (deterministic)
     */
    async updateMemory(userId, updates) {
        try {
            // Upsert mechanism
            const { data: existing } = await supabase
                .from('farmer_memory')
                .select('id, memory_version')
                .eq('user_id', userId)
                .single();
                
            let result;
            if (existing) {
                result = await supabase
                    .from('farmer_memory')
                    .update({ 
                        ...updates,
                        memory_version: existing.memory_version + 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', userId);
            } else {
                result = await supabase
                    .from('farmer_memory')
                    .insert({
                        user_id: userId,
                        ...updates
                    });
            }
            
            if (result.error) throw result.error;
            return true;
        } catch (error) {
            logger.error(`Failed to update memory for ${userId}:`, error.message);
            return false;
        }
    }
    
    /**
     * Centralized feedback processing.
     * Updates decision history AND recalculates memory metrics.
     */
    async processFeedback(userId, decisionId, feedback) {
        try {
            // 1. Update the decision
            const validFeedback = ['UP', 'DOWN', 'NONE'].includes(feedback) ? (feedback === 'NONE' ? null : feedback) : null;
            
            const { error: updateError } = await supabase
                .from('ai_decisions')
                .update({ feedback: validFeedback })
                .eq('id', decisionId)
                .eq('user_id', userId);
                
            if (updateError) throw updateError;
            
            // 2. Recalculate metrics for memory (Fire & Forget to not block API)
            this._recalculateMetrics(userId).catch(e => logger.error(`Metric recalculation failed for ${userId}:`, e.message));
            
            return true;
        } catch (error) {
            logger.error(`processFeedback error for ${userId} on decision ${decisionId}:`, error.message);
            throw error;
        }
    }
    
    /**
     * Internal deterministic recalculation of feedback and acceptance scores
     */
    async _recalculateMetrics(userId) {
        const { data: decisions, error } = await supabase
            .from('ai_decisions')
            .select('status, feedback')
            .eq('user_id', userId);
            
        if (error || !decisions) return;
        
        const total = decisions.length;
        if (total === 0) return;
        
        let accepted = 0;
        let upvotes = 0;
        let downvotes = 0;
        
        decisions.forEach(d => {
            if (d.status === 'ACCEPTED' || d.status === 'EXECUTED') accepted++;
            if (d.feedback === 'UP') upvotes++;
            if (d.feedback === 'DOWN') downvotes++;
        });
        
        const acceptanceRate = (accepted / total).toFixed(2);
        
        let feedbackScore = 0;
        const totalVotes = upvotes + downvotes;
        if (totalVotes > 0) {
            // Scale -1.0 to 1.0 based on upvotes vs downvotes
            feedbackScore = ((upvotes - downvotes) / totalVotes).toFixed(2);
        }
        
        await this.updateMemory(userId, {
            recommendation_acceptance_rate: parseFloat(acceptanceRate),
            feedback_score: parseFloat(feedbackScore)
        });
    }
}

module.exports = new FarmerMemoryService();
