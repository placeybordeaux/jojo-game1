// Centralized input handling system
export class InputSystem {
    constructor() {
        this.keys = new Map();
        this.keyJustPressed = new Map();
        this.keyJustReleased = new Map();
        this.listeners = [];
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        this.initialized = true;
    }

    handleKeyDown(e) {
        const key = this.normalizeKey(e.key);
        
        if (!this.keys.get(key)) {
            this.keyJustPressed.set(key, true);
        }
        
        this.keys.set(key, true);
        
        // Emit event for listeners
        this.listeners.forEach(listener => {
            if (listener.onKeyDown) {
                listener.onKeyDown(key, e);
            }
        });
    }

    handleKeyUp(e) {
        const key = this.normalizeKey(e.key);
        
        this.keys.set(key, false);
        this.keyJustReleased.set(key, true);
        
        // Emit event for listeners
        this.listeners.forEach(listener => {
            if (listener.onKeyUp) {
                listener.onKeyUp(key, e);
            }
        });
    }

    normalizeKey(key) {
        // Normalize key names for consistency
        const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            ' ': 'space',
            'Spacebar': 'space'
        };
        
        return keyMap[key] || key.toLowerCase();
    }

    // Check if key is currently pressed
    isKeyDown(key) {
        return this.keys.get(this.normalizeKey(key)) || false;
    }

    // Check if key was just pressed this frame
    isKeyJustPressed(key) {
        return this.keyJustPressed.get(this.normalizeKey(key)) || false;
    }

    // Check if key was just released this frame
    isKeyJustReleased(key) {
        return this.keyJustReleased.get(this.normalizeKey(key)) || false;
    }

    // Add input listener
    addListener(listener) {
        this.listeners.push(listener);
    }

    // Remove input listener
    removeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    // Clear just pressed/released flags (call each frame)
    update() {
        this.keyJustPressed.clear();
        this.keyJustReleased.clear();
    }

    // Get movement vector from arrow keys
    getMovementVector() {
        const vector = { x: 0, y: 0 };
        
        if (this.isKeyDown('left')) vector.x -= 1;
        if (this.isKeyDown('right')) vector.x += 1;
        if (this.isKeyDown('up')) vector.y -= 1;
        if (this.isKeyDown('down')) vector.y += 1;
        
        // Normalize diagonal movement
        if (vector.x !== 0 && vector.y !== 0) {
            const factor = Math.SQRT1_2; // 1/sqrt(2)
            vector.x *= factor;
            vector.y *= factor;
        }
        
        return vector;
    }
}

// Global input system instance
export const inputSystem = new InputSystem();