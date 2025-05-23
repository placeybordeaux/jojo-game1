# 🎮 Jojo Game - Modular Architecture

This is the refactored version of the Jojo Game using modern modular architecture patterns.

## 🚀 What's New

### **Modular Structure**
```
src/
├── core/           # Core game engine
│   ├── Game.js     # Main game manager
│   ├── Scene.js    # Base scene class
│   └── GameObject.js # Base object class
├── systems/        # Reusable systems
│   ├── EventBus.js      # Event communication
│   ├── InputSystem.js   # Input handling
│   ├── AssetManager.js  # Asset loading
│   ├── InventorySystem.js # Inventory management
│   └── CollisionSystem.js # Collision detection
├── config/         # Configuration
│   └── gameConfig.js # Game settings
└── main.js         # Entry point
```

### **Key Improvements**
- ✅ **Separated Concerns**: Logic, rendering, and data are cleanly separated
- ✅ **Event-Driven**: Decoupled communication via EventBus
- ✅ **Reusable Systems**: Collision, input, inventory can be reused
- ✅ **Configuration-Driven**: Settings in one place
- ✅ **Modern ES6 Modules**: Clean imports/exports
- ✅ **Debug Enhancement**: Better debugging tools

## 🛠️ Development Setup

### **Quick Start**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to localhost:3000
```

### **Alternative (Simple)**
```bash
# Just open the HTML file
open index-modular.html
```

## 🎮 How to Use

### **Controls**
- **Arrow Keys**: Move around
- **Space**: Interact with objects
- **I**: Toggle inventory
- **ESC**: Pause/unpause
- **1-4**: Switch scenes (testing)

### **Debug Commands**
Open browser console (F12) and try:
```javascript
// Show available commands
debug.showHelp()

// Check system status
debug.logSystems()

// Switch scenes
debug.switchScene('kitchen')

// Test event system
debug.testEvents()

// Access game instance
game.getCurrentScene()

// Access systems
systems.inventory.getStats('player')
```

## 🔄 Migration Status

### **✅ Completed**
- Core game architecture
- Event system
- Input system  
- Asset management
- Inventory system
- Scene management
- Debug system

### **🚧 In Progress**
- Scene implementations (currently placeholders)
- GameObject implementations
- Original game feature migration

### **📋 TODO**
- Migrate all original scenes (indoor, outdoor, kitchen, bathroom)
- Migrate all game objects (girl, friend, chickens, etc.)
- Migrate all gameplay systems (hygiene, cooking, etc.)
- Add save/load system
- Add sound system
- Add animation system

## 🎯 Next Steps

1. **Create Real Scenes**: Replace placeholder scenes with actual implementations
2. **Migrate Player**: Create Girl class using new GameObject base
3. **Migrate Features**: Move all original features to new architecture
4. **Add Tests**: Unit tests for systems
5. **Performance**: Optimize rendering and updates

## 📊 Architecture Benefits

### **Before (Monolithic)**
- 1800+ line single file
- Tight coupling
- Global scope pollution
- Hard to test
- Difficult to extend

### **After (Modular)**
- Small, focused files
- Loose coupling via events
- Clean module system
- Easy to test individual systems
- Simple to add new features

## 🔧 Available Systems

### **EventBus**
```javascript
// Subscribe to events
eventBus.on('player:moved', (data) => console.log(data));

// Emit events
eventBus.emit('player:moved', { x: 100, y: 200 });
```

### **InputSystem**
```javascript
// Check current input
if (inputSystem.isKeyDown('space')) { /* interact */ }

// Check for single press
if (inputSystem.isKeyJustPressed('i')) { /* toggle inventory */ }

// Get movement vector
const movement = inputSystem.getMovementVector(); // {x: 0, y: -1}
```

### **InventorySystem**
```javascript
// Create inventory
inventorySystem.createInventory('player', 6);

// Add items
inventorySystem.addItem('player', { name: 'Apple', icon: '🍎' });

// Check contents
inventorySystem.hasItem('player', 'Apple');
```

This modular architecture provides a solid foundation for growing the game while keeping code maintainable and organized!