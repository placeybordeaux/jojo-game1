// Simple event system for decoupled communication
export class EventBus {
    constructor() {
        this.events = new Map();
    }

    // Subscribe to an event
    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        this.events.get(eventName).push(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.events.get(eventName);
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        };
    }

    // Emit an event
    emit(eventName, data = {}) {
        if (this.events.has(eventName)) {
            this.events.get(eventName).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for ${eventName}:`, error);
                }
            });
        }
    }

    // Remove all listeners for an event
    off(eventName) {
        this.events.delete(eventName);
    }

    // Clear all events
    clear() {
        this.events.clear();
    }
}

// Global event bus instance
export const eventBus = new EventBus();