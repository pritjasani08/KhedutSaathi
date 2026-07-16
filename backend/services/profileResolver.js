const { getDbClient } = require('../config/db');
const logger = require('../utils/logger');

class FarmerProfileNotFoundError extends Error {
    constructor(userId) {
        super(`Farmer profile not found for user_id: ${userId}`);
        this.name = 'FarmerProfileNotFoundError';
        this.userId = userId;
    }
}
exports.FarmerProfileNotFoundError = FarmerProfileNotFoundError;

/**
 * In-memory request-scoped cache for farmer profiles.
 * To avoid memory leaks, keys should ideally expire, but for a single Node process 
 * servicing requests, an LRU cache is best. For simplicity and to satisfy the 
 * "request-scoped caching" requirement without a complex LRU dependency, we use a simple
 * Map that clears itself periodically or tracks timestamps. 
 * A better pattern is caching per `req` object, but since we are called from services 
 * where `req` isn't available, we use a global Map with a short TTL (e.g. 5 seconds) 
 * to act as a request-scoped debouncer.
 */
const profileCache = new Map();
const CACHE_TTL_MS = 5000; 

/**
 * IDENTITY CONTRACT:
 * 
 * @param {string} userId - The canonical users.id (public.users.id) from the JWT / req.user.id
 * @returns {Promise<{userId: string, farmerProfileId: string, profile: Object}>}
 * 
 * Rules:
 * 1. Controllers MUST pass `req.user.id` (users.id) here.
 * 2. Schedulers MUST pass `user_id` (users.id) here.
 * 3. AI Services MUST call this function to resolve the farmer_profiles.id.
 * 4. AI Services MUST use `farmerProfileId` for ALL AI table queries.
 */
exports.resolveFarmerProfile = async (userId) => {
    if (!userId) {
        throw new Error('resolveFarmerProfile requires a valid userId');
    }

    const now = Date.now();
    const cached = profileCache.get(userId);
    
    if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
        return cached.data;
    }

    const adminClient = getDbClient(true);
    
    const { data: profile, error } = await adminClient
        .from('farmer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error || !profile) {
        logger.error(`Failed to resolve farmer profile for user ${userId}`, error || 'No profile returned');
        throw new FarmerProfileNotFoundError(userId);
    }

    const result = {
        userId: profile.user_id, // users.id
        farmerProfileId: profile.id, // auth.users UUID used by AI tables
        profile
    };

    profileCache.set(userId, {
        timestamp: now,
        data: result
    });

    // Cleanup old cache entries lazily to prevent memory leak
    if (profileCache.size > 1000) {
        const expireTime = now - CACHE_TTL_MS;
        for (const [key, value] of profileCache.entries()) {
            if (value.timestamp < expireTime) {
                profileCache.delete(key);
            }
        }
    }

    return result;
};

exports.FarmerProfileNotFoundError = FarmerProfileNotFoundError;
