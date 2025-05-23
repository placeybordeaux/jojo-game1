// Base Scene class for managing game scenes
import { eventBus } from '../systems/EventBus.js';

export class Scene {
    constructor(name) {
        this.name = name;
        this.objects = [];
        this.systems = [];
        this.active = false;
        this.initialized = false;
        this.background = null;
        this.data = {}; // Scene-specific data
    }

    // Initialize scene (called once)
    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.onCreate();
    }

    // Override in subclasses
    onCreate() {
        // Setup scene objects, load assets, etc.
    }

    // Enter scene (called when switching to this scene)
    enter(previousScene = null) {
        this.active = true;
        this.onEnter(previousScene);
        eventBus.emit('scene:entered', { scene: this, previousScene });
    }

    // Exit scene (called when switching away from this scene)
    exit(nextScene = null) {
        this.active = false;
        this.onExit(nextScene);
        eventBus.emit('scene:exited', { scene: this, nextScene });
    }

    // Override in subclasses
    onEnter(previousScene) {}
    onExit(nextScene) {}

    // Add object to scene
    addObject(object) {
        if (!this.objects.includes(object)) {
            this.objects.push(object);
            object.scene = this;
            eventBus.emit('scene:objectAdded', { scene: this, object });
        }
        return object;
    }

    // Remove object from scene
    removeObject(object) {
        const index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
            object.scene = null;
            eventBus.emit('scene:objectRemoved', { scene: this, object });
        }
    }

    // Find objects by tag
    findObjectsByTag(tag) {
        return this.objects.filter(obj => obj.hasTag(tag));
    }

    // Find object by ID
    findObjectById(id) {
        return this.objects.find(obj => obj.id === id);
    }

    // Get all interactable objects near a point
    getInteractablesNear(x, y, radius = 50) {
        return this.objects.filter(obj => {
            if (!obj.hasTag('interactable')) return false;
            
            const distance = Math.sqrt(
                Math.pow(obj.getCenter().x - x, 2) +
                Math.pow(obj.getCenter().y - y, 2)
            );
            
            return distance <= radius;
        });
    }

    // Add system to scene
    addSystem(system) {
        if (!this.systems.includes(system)) {
            this.systems.push(system);
            system.scene = this;
        }
        return system;
    }

    // Update scene
    update(deltaTime) {
        if (!this.active) return;

        // Update systems first
        this.systems.forEach(system => {
            if (system.update) {
                system.update(deltaTime, this.objects);
            }
        });

        // Update objects
        this.objects = this.objects.filter(obj => {
            if (!obj.active) {
                eventBus.emit('scene:objectDestroyed', { scene: this, object: obj });
                return false;
            }
            
            obj.update(deltaTime);
            return true;
        });

        // Scene-specific update
        this.onUpdate(deltaTime);
    }

    // Override in subclasses
    onUpdate(deltaTime) {}

    // Draw scene
    draw(ctx) {
        if (!this.active) return;

        // Clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw background
        if (this.background) {
            this.drawBackground(ctx);
        }

        // Draw objects (sorted by layer/depth if needed)
        const sortedObjects = this.objects
            .filter(obj => obj.visible)
            .sort((a, b) => (a.layer || 0) - (b.layer || 0));

        sortedObjects.forEach(obj => obj.draw(ctx));

        // Draw systems (UI, effects, etc.)
        this.systems.forEach(system => {
            if (system.draw) {
                system.draw(ctx);
            }
        });

        // Scene-specific drawing
        this.onDraw(ctx);
    }

    // Draw background
    drawBackground(ctx) {
        if (typeof this.background === 'string') {
            // Solid color
            ctx.fillStyle = this.background;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        } else if (this.background.tagName === 'IMG') {
            // Image
            ctx.drawImage(this.background, 0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }

    // Override in subclasses
    onDraw(ctx) {}

    // Handle input (called by game manager)
    handleInput(inputSystem) {
        this.onInput(inputSystem);
    }

    // Override in subclasses
    onInput(inputSystem) {}

    // Cleanup scene
    destroy() {
        this.objects.forEach(obj => obj.destroy());
        this.objects = [];
        this.systems = [];
        this.active = false;
        eventBus.emit('scene:destroyed', { scene: this });
    }

    // Scene data management
    setData(key, value) {
        this.data[key] = value;
    }

    getData(key, defaultValue = null) {
        return this.data[key] !== undefined ? this.data[key] : defaultValue;
    }
}