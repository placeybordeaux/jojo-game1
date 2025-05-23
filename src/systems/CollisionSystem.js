// Collision detection utilities
export const CollisionSystem = {
    // Axis-Aligned Bounding Box collision
    checkAABB(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    },

    // Check if point is inside rectangle
    checkPointInRect(point, rect) {
        return point.x >= rect.x &&
               point.x <= rect.x + rect.width &&
               point.y >= rect.y &&
               point.y <= rect.y + rect.height;
    },

    // Check if two objects are within distance
    checkDistance(a, b, distance) {
        const dx = (a.x + a.width/2) - (b.x + b.width/2);
        const dy = (a.y + a.height/2) - (b.y + b.height/2);
        return Math.sqrt(dx * dx + dy * dy) <= distance;
    },

    // Get collision info with details
    getCollisionInfo(a, b) {
        if (!this.checkAABB(a, b)) return null;
        
        const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
        const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
        
        return { overlapX, overlapY };
    }
};