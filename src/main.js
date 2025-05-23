// Main entry point for the modular game
import { Game } from './core/Game.js';
import { gameConfig } from './config/gameConfig.js';
import { inventorySystem } from './systems/InventorySystem.js';
import { eventBus } from './systems/EventBus.js';

// Import scenes (we'll create these next)
// import { IndoorScene } from './scenes/IndoorScene.js';
// import { OutdoorScene } from './scenes/OutdoorScene.js';
// import { KitchenScene } from './scenes/KitchenScene.js';
// import { BathroomScene } from './scenes/BathroomScene.js';

class JojoGame {
    constructor() {
        this.game = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            console.log('=== JOJO GAME - MODULAR VERSION ===');
            
            // Create game instance
            this.game = new Game(gameConfig.canvas.id);
            
            // Setup global systems
            this.setupSystems();
            
            // Load assets
            const assetsLoaded = await this.game.loadAssets(gameConfig.assets);
            if (!assetsLoaded) {
                throw new Error('Failed to load game assets');
            }

            // Create and add scenes
            this.createScenes();
            
            // Setup debug system
            this.setupDebugSystem();
            
            // Start with indoor scene
            this.game.changeScene('indoor');
            
            this.initialized = true;
            console.log('Game initialized successfully!');
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
        }
    }

    setupSystems() {
        // Create player inventory
        inventorySystem.createInventory('player', gameConfig.player.maxInventorySize);
        
        // Setup event listeners
        eventBus.on('assets:progress', (data) => {
            console.log(`Loading: ${data.loaded}/${data.total} assets`);
        });

        eventBus.on('scene:entered', (data) => {
            console.log(`Entered scene: ${data.scene.name}`);
        });
    }

    createScenes() {
        // For now, we'll create simple placeholder scenes
        // TODO: Replace with actual scene imports once we create them
        
        const scenes = [
            this.createSimpleScene('indoor', 'Indoor Scene'),
            this.createSimpleScene('outdoor', 'Outdoor Scene'),
            this.createSimpleScene('kitchen', 'Kitchen Scene'),
            this.createSimpleScene('bathroom', 'Bathroom Scene')
        ];

        scenes.forEach(scene => this.game.addScene(scene));
    }

    createSimpleScene(name, title) {
        // Temporary simple scene for testing the new architecture
        return {
            name,
            initialized: false,
            active: false,
            objects: [],
            systems: [],
            
            init() {
                this.initialized = true;
                console.log(`${title} initialized`);
            },
            
            enter(previousScene) {
                this.active = true;
                console.log(`Entered ${title}`);
            },
            
            exit(nextScene) {
                this.active = false;
                console.log(`Exited ${title}`);
            },
            
            update(deltaTime) {
                // Placeholder update
            },
            
            draw(ctx) {
                // Simple background
                ctx.fillStyle = name === 'outdoor' ? '#87CEEB' : '#F0F0F0';
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                
                // Title
                ctx.fillStyle = 'black';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(title, ctx.canvas.width / 2, 50);
                
                // Instructions
                ctx.font = '16px Arial';
                ctx.fillText('Modular architecture active!', ctx.canvas.width / 2, 100);
                ctx.fillText('Original game features being migrated...', ctx.canvas.width / 2, 130);
                
                // Scene switching instructions
                ctx.font = '12px Arial';
                ctx.fillText('Press 1-4 to switch scenes', ctx.canvas.width / 2, 200);
                ctx.fillText('1: Indoor, 2: Outdoor, 3: Kitchen, 4: Bathroom', ctx.canvas.width / 2, 220);
            },
            
            handleInput(inputSystem) {
                // Scene switching for testing
                if (inputSystem.isKeyJustPressed('1')) {
                    eventBus.emit('scene:changeRequest', { sceneName: 'indoor' });
                } else if (inputSystem.isKeyJustPressed('2')) {
                    eventBus.emit('scene:changeRequest', { sceneName: 'outdoor' });
                } else if (inputSystem.isKeyJustPressed('3')) {
                    eventBus.emit('scene:changeRequest', { sceneName: 'kitchen' });
                } else if (inputSystem.isKeyJustPressed('4')) {
                    eventBus.emit('scene:changeRequest', { sceneName: 'bathroom' });
                }
            }
        };
    }

    setupDebugSystem() {
        // Enhanced debug system
        window.game = this.game;
        window.systems = {
            inventory: inventorySystem,
            events: eventBus
        };
        
        window.debug = {
            ...window.debug, // Keep existing debug functions
            
            // New modular debug functions
            switchScene: (sceneName) => {
                this.game.changeScene(sceneName);
            },
            
            logSystems: () => {
                console.log('=== SYSTEM STATUS ===');
                console.log('Current Scene:', this.game.getCurrentScene()?.name);
                console.log('Inventory System:', inventorySystem.getStats('player'));
                console.log('Game State:', this.game.getState());
            },
            
            testEvents: () => {
                console.log('Testing event system...');
                eventBus.emit('test:event', { message: 'Hello from event bus!' });
            },
            
            showHelp: () => {
                console.log('=== MODULAR DEBUG COMMANDS ===');
                console.log('debug.switchScene(name) - Change scene');
                console.log('debug.logSystems() - Show system status');
                console.log('debug.testEvents() - Test event system');
                console.log('game - Access game instance');
                console.log('systems - Access all systems');
            }
        };

        // Test event listener
        eventBus.on('test:event', (data) => {
            console.log('Event received:', data.message);
        });

        console.log('Debug system enhanced! Type debug.showHelp() for commands');
    }

    start() {
        if (!this.initialized) {
            console.error('Game not initialized. Call init() first.');
            return;
        }
        
        this.game.start();
    }

    destroy() {
        if (this.game) {
            this.game.destroy();
        }
    }
}

// Initialize and start the game
const jojoGame = new JojoGame();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await jojoGame.init();
    jojoGame.start();
});

// Global access for debugging
window.jojoGame = jojoGame;