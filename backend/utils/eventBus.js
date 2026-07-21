const EventEmitter = require('events');

class EventBus extends EventEmitter {}

// Export a singleton instance
const eventBus = new EventBus();

module.exports = eventBus;
