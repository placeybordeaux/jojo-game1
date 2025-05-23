// Inventory management system
import { eventBus } from './EventBus.js';

export class InventorySystem {
    constructor() {
        this.inventories = new Map(); // Multiple inventories (player, friend, etc.)
        this.isUIOpen = false;
        this.selectedInventory = null;
    }

    // Create new inventory
    createInventory(id, maxSize = 6) {
        const inventory = {
            id,
            items: [],
            maxSize,
            owner: null
        };
        
        this.inventories.set(id, inventory);
        return inventory;
    }

    // Get inventory by ID
    getInventory(id) {
        return this.inventories.get(id);
    }

    // Add item to inventory
    addItem(inventoryId, item) {
        const inventory = this.getInventory(inventoryId);
        if (!inventory) {
            console.warn(`Inventory '${inventoryId}' not found`);
            return false;
        }

        if (inventory.items.length >= inventory.maxSize) {
            eventBus.emit('inventory:full', { inventoryId, item });
            return false;
        }

        inventory.items.push({
            ...item,
            id: this.generateItemId(),
            addedAt: Date.now()
        });

        eventBus.emit('inventory:itemAdded', { 
            inventoryId, 
            item, 
            inventory: inventory.items 
        });

        return true;
    }

    // Remove item from inventory
    removeItem(inventoryId, itemId) {
        const inventory = this.getInventory(inventoryId);
        if (!inventory) return null;

        const itemIndex = inventory.items.findIndex(item => 
            item.id === itemId || item.name === itemId
        );

        if (itemIndex === -1) return null;

        const removedItem = inventory.items.splice(itemIndex, 1)[0];
        
        eventBus.emit('inventory:itemRemoved', { 
            inventoryId, 
            item: removedItem, 
            inventory: inventory.items 
        });

        return removedItem;
    }

    // Check if inventory has item
    hasItem(inventoryId, itemName) {
        const inventory = this.getInventory(inventoryId);
        if (!inventory) return false;

        return inventory.items.some(item => item.name === itemName);
    }

    // Get items by type
    getItemsByType(inventoryId, type) {
        const inventory = this.getInventory(inventoryId);
        if (!inventory) return [];

        return inventory.items.filter(item => item.type === type);
    }

    // Transfer item between inventories
    transferItem(fromInventoryId, toInventoryId, itemId) {
        const item = this.removeItem(fromInventoryId, itemId);
        if (!item) return false;

        const success = this.addItem(toInventoryId, item);
        if (!success) {
            // Return item if transfer failed
            this.addItem(fromInventoryId, item);
            return false;
        }

        eventBus.emit('inventory:itemTransferred', {
            fromInventoryId,
            toInventoryId,
            item
        });

        return true;
    }

    // Toggle inventory UI
    toggleUI(inventoryId = null) {
        this.isUIOpen = !this.isUIOpen;
        this.selectedInventory = inventoryId;
        
        eventBus.emit('inventory:uiToggled', { 
            isOpen: this.isUIOpen, 
            inventoryId 
        });
    }

    // Generate unique item ID
    generateItemId() {
        return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get inventory stats
    getStats(inventoryId) {
        const inventory = this.getInventory(inventoryId);
        if (!inventory) return null;

        const typeCount = {};
        inventory.items.forEach(item => {
            typeCount[item.type] = (typeCount[item.type] || 0) + 1;
        });

        return {
            totalItems: inventory.items.length,
            maxSize: inventory.maxSize,
            freeSlots: inventory.maxSize - inventory.items.length,
            typeCount
        };
    }

    // Draw inventory UI
    draw(ctx) {
        if (!this.isUIOpen || !this.selectedInventory) return;

        const inventory = this.getInventory(this.selectedInventory);
        if (!inventory) return;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(50, 50, 300, 200);
        
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 2;
        ctx.fillRect(55, 55, 290, 190);
        ctx.strokeRect(55, 55, 290, 190);
        
        // Title
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Inventory', 200, 75);
        
        // Items
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        for (let i = 0; i < inventory.items.length; i++) {
            const item = inventory.items[i];
            const x = 70 + (i % 3) * 90;
            const y = 100 + Math.floor(i / 3) * 40;
            
            // Item slot
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(x, y, 80, 30);
            ctx.strokeStyle = '#ccc';
            ctx.strokeRect(x, y, 80, 30);
            
            // Item
            ctx.fillStyle = 'black';
            ctx.fillText(`${item.icon || '📦'} ${item.name}`, x + 5, y + 20);
        }
        
        // Empty slots
        for (let i = inventory.items.length; i < inventory.maxSize; i++) {
            const x = 70 + (i % 3) * 90;
            const y = 100 + Math.floor(i / 3) * 40;
            
            ctx.fillStyle = '#f8f8f8';
            ctx.fillRect(x, y, 80, 30);
            ctx.strokeStyle = '#ddd';
            ctx.strokeRect(x, y, 80, 30);
        }
        
        // Instructions
        ctx.fillStyle = 'gray';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press I to close inventory', 200, 230);
    }
}

// Global inventory system instance
export const inventorySystem = new InventorySystem();