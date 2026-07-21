const logger = require('./logger');

/**
 * SSEBroker abstracts Server-Sent Events management.
 * Designed to be extensible for distributed environments (e.g. via Redis Pub/Sub).
 */
class SseBroker {
    constructor() {
        this.clients = new Map(); // Local memory for now
        this.stats = { totalBroadcasts: 0 };
    }

    /**
     * Registers a new SSE connection for a user.
     * @param {string} userId 
     * @param {Object} responseStream 
     * @param {Object} request 
     */
    registerClient(userId, responseStream, request) {
        if (!this.clients.has(userId)) {
            this.clients.set(userId, new Set());
        }
        this.clients.get(userId).add(responseStream);
        
        logger.info(`[SSEBroker] Client connected for user ${userId}. Total active connections: ${this.getActiveConnectionCount()}`);

        request.on('close', () => {
            this.removeClient(userId, responseStream);
        });
    }

    /**
     * Removes an SSE connection.
     * @param {string} userId 
     * @param {Object} responseStream 
     */
    removeClient(userId, responseStream) {
        const userClients = this.clients.get(userId);
        if (userClients) {
            userClients.delete(responseStream);
            if (userClients.size === 0) {
                this.clients.delete(userId);
            }
        }
        logger.info(`[SSEBroker] Client disconnected for user ${userId}. Total active connections: ${this.getActiveConnectionCount()}`);
    }

    /**
     * Broadcasts an event exclusively to the specified user's active connections.
     * @param {string} userId 
     * @param {string} eventType 
     * @param {Object} payload 
     */
    broadcastToUser(userId, eventType, payload) {
        // Future: In a distributed system, this method might also publish a message to Redis 
        // which other nodes listen to and broadcast locally to their connected clients.
        
        const userClients = this.clients.get(userId);
        if (userClients) {
            const message = `data: ${JSON.stringify({ type: eventType, payload })}\n\n`;
            userClients.forEach(client => {
                client.write(message);
            });
            this.stats.totalBroadcasts++;
            logger.info(`[SSEBroker] Broadcasted ${eventType} to ${userId} (${userClients.size} clients)`);
        }
    }
    
    getActiveConnectionCount() {
        let count = 0;
        for (const clients of this.clients.values()) {
            count += clients.size;
        }
        return count;
    }
    
    getStats() {
        return {
            activeConnections: this.getActiveConnectionCount(),
            totalBroadcasts: this.stats.totalBroadcasts
        };
    }
}

module.exports = new SseBroker();
