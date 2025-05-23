// Main Game class - manages scenes, game loop, and global state
import { eventBus } from '../systems/EventBus.js';
import { inputSystem } from '../systems/InputSystem.js';
import { assetManager } from '../systems/AssetManager.js';
import { inventorySystem } from '../systems/InventorySystem.js';

export class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        
        if (!this.canvas || !this.ctx) {
            throw new Error(`Canvas element '${canvasId}' not found`);
        }

        this.scenes = new Map();
        this.currentScene = null;
        this.isRunning = false;
        this.lastTime = 0;
        this.targetFPS = 60;
        this.deltaTime = 0;
        
        // Game state
        this.gameState = {
            player: null,
            time: 0,
            paused: false
        };

        // Setup event listeners
        this.setupEventListeners();
        
        console.log('Game initialized');
    }

    // Setup global event listeners
    setupEventListeners() {
        // Handle inventory toggle
        eventBus.on('input:keyPressed', (data) => {
            if (data.key === 'i') {
                inventorySystem.toggleUI('player');
            }
        });

        // Handle scene transitions
        eventBus.on('scene:changeRequest', (data) => {
            this.changeScene(data.sceneName, data.transitionData);
        });

        // Handle pause/unpause
        eventBus.on('game:pause', () => this.pause());
        eventBus.on('game:resume', () => this.resume());
    }

    // Add scene to game
    addScene(scene) {
        this.scenes.set(scene.name, scene);
        scene.game = this;
        return scene;
    }

    // Change to different scene
    changeScene(sceneName, transitionData = {}) {
        const newScene = this.scenes.get(sceneName);
        if (!newScene) {
            console.error(`Scene '${sceneName}' not found`);
            return false;
        }

        const previousScene = this.currentScene;
        
        // Exit current scene
        if (this.currentScene) {
            this.currentScene.exit(newScene);
        }

        // Initialize new scene if needed
        if (!newScene.initialized) {
            newScene.init();
        }

        // Enter new scene
        this.currentScene = newScene;
        this.currentScene.enter(previousScene);

        console.log(`Scene changed to: ${sceneName}`);
        return true;
    }

    // Get current scene
    getCurrentScene() {
        return this.currentScene;
    }

    // Load game assets
    async loadAssets(assetConfig) {
        console.log('Loading assets...');
        
        assetManager.setProgressCallback((loaded, total) => {
            console.log(`Loading assets: ${loaded}/${total}`);
            eventBus.emit('assets:progress', { loaded, total });
        });

        assetManager.setCompleteCallback(() => {
            console.log('All assets loaded');
            eventBus.emit('assets:complete');
        });

        try {
            await assetManager.loadImages(assetConfig.images || {});
            return true;
        } catch (error) {
            console.error('Failed to load assets:', error);
            return false;
        }
    }

    // Start game loop
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        inputSystem.init();
        this.lastTime = performance.now();
        
        console.log('Game started');
        this.gameLoop();
    }

    // Stop game loop
    stop() {
        this.isRunning = false;
        console.log('Game stopped');
    }

    // Pause game
    pause() {
        this.gameState.paused = true;
        eventBus.emit('game:paused');
    }

    // Resume game
    resume() {
        this.gameState.paused = false;
        eventBus.emit('game:resumed');
    }

    // Main game loop
    gameLoop(currentTime = performance.now()) {
        if (!this.isRunning) return;

        // Calculate delta time
        this.deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        this.gameState.time += this.deltaTime;

        // Update
        if (!this.gameState.paused) {
            this.update(this.deltaTime);
        }

        // Draw
        this.draw();

        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    // Update game
    update(deltaTime) {
        // Update input system
        inputSystem.update();

        // Handle global input
        this.handleGlobalInput();

        // Update current scene
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
            this.currentScene.handleInput(inputSystem);
        }

        // Update global systems
        // (Add more global systems here as needed)
    }

    // Handle global input (keys that work everywhere)
    handleGlobalInput() {
        // Escape to pause/unpause
        if (inputSystem.isKeyJustPressed('escape')) {
            if (this.gameState.paused) {
                this.resume();
            } else {
                this.pause();
            }
        }

        // Inventory toggle
        if (inputSystem.isKeyJustPressed('i')) {
            inventorySystem.toggleUI('player');
        }
    }

    // Draw game
    draw() {
        // Draw current scene
        if (this.currentScene) {
            this.currentScene.draw(this.ctx);
        }

        // Draw global UI systems
        inventorySystem.draw(this.ctx);

        // Draw pause overlay
        if (this.gameState.paused) {
            this.drawPauseOverlay();
        }

        // Draw FPS counter in debug mode
        if (window.location.hostname === 'localhost') {
            this.drawDebugInfo();
        }
    }

    // Draw pause overlay
    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Press ESC to resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    // Draw debug information
    drawDebugInfo() {
        const fps = Math.round(1 / this.deltaTime);
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 120, 60);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`FPS: ${fps}`, 15, 25);
        this.ctx.fillText(`Scene: ${this.currentScene?.name || 'None'}`, 15, 40);
        this.ctx.fillText(`Time: ${this.gameState.time.toFixed(1)}s`, 15, 55);
    }

    // Get game state
    getState() {
        return { ...this.gameState };
    }

    // Set game state
    setState(newState) {
        this.gameState = { ...this.gameState, ...newState };
        eventBus.emit('game:stateChanged', this.gameState);
    }

    // Cleanup
    destroy() {
        this.stop();
        this.scenes.forEach(scene => scene.destroy());
        this.scenes.clear();
        eventBus.clear();
        console.log('Game destroyed');
    }
}