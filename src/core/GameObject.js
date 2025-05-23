// Base class for all game objects
import { eventBus } from '../systems/EventBus.js';

export class GameObject {
    constructor(x = 0, y = 0, width = 50, height = 50) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = true;
        this.visible = true;
        this.id = this.generateId();
        this.tags = new Set();
        this.components = new Map();
    }

    // Generate unique ID
    generateId() {
        return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Add tag for categorization
    addTag(tag) {
        this.tags.add(tag);
        return this;
    }

    // Check if has tag
    hasTag(tag) {
        return this.tags.has(tag);
    }

    // Add component
    addComponent(name, component) {
        this.components.set(name, component);
        if (component.owner) component.owner = this;
        return this;
    }

    // Get component
    getComponent(name) {
        return this.components.get(name);
    }

    // Remove component
    removeComponent(name) {
        return this.components.delete(name);
    }

    // Check if has component
    hasComponent(name) {
        return this.components.has(name);
    }

    // Get bounding box for collision
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    // Get center point
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    // Check if point is inside object
    containsPoint(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }

    // Emit event from this object
    emit(eventName, data = {}) {
        eventBus.emit(eventName, { 
            ...data, 
            source: this,
            sourceId: this.id 
        });
    }

    // Override in subclasses
    update(deltaTime) {
        // Update all components
        this.components.forEach(component => {
            if (component.update) {
                component.update(deltaTime);
            }
        });
    }

    // Override in subclasses
    draw(ctx) {
        if (!this.visible) return;
        
        // Draw all drawable components
        this.components.forEach(component => {
            if (component.draw) {
                component.draw(ctx);
            }
        });
    }

    // Override in subclasses
    interact(interactor) {
        return false;
    }

    // Destroy object
    destroy() {
        this.active = false;
        this.emit('object:destroyed');
    }
}

// Specific game object types
export class InteractableObject extends GameObject {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.addTag('interactable');
        this.interactionRadius = 10;
    }

    // Check if object can be interacted with
    canInteract(interactor) {
        const distance = Math.sqrt(
            Math.pow(this.getCenter().x - interactor.getCenter().x, 2) +
            Math.pow(this.getCenter().y - interactor.getCenter().y, 2)
        );
        return distance <= this.interactionRadius;
    }
}

export class MovableObject extends GameObject {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.addTag('movable');
        this.velocity = { x: 0, y: 0 };
        this.speed = 5;
    }

    // Move by velocity
    move(deltaTime = 1) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
    }

    // Set velocity based on direction
    setVelocity(x, y) {
        this.velocity.x = x * this.speed;
        this.velocity.y = y * this.speed;
    }

    // Stop movement
    stop() {
        this.velocity.x = 0;
        this.velocity.y = 0;
    }
}