// Asset loading and management system
export class AssetManager {
    constructor() {
        this.images = new Map();
        this.sounds = new Map();
        this.loadedCount = 0;
        this.totalCount = 0;
        this.onProgress = null;
        this.onComplete = null;
    }

    // Load multiple images
    loadImages(imageConfig) {
        this.totalCount = Object.keys(imageConfig).length;
        this.loadedCount = 0;

        const promises = Object.entries(imageConfig).map(([name, src]) => {
            return this.loadImage(name, src);
        });

        return Promise.all(promises);
    }

    // Load single image
    loadImage(name, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.images.set(name, img);
                this.loadedCount++;
                
                if (this.onProgress) {
                    this.onProgress(this.loadedCount, this.totalCount);
                }
                
                if (this.loadedCount === this.totalCount && this.onComplete) {
                    this.onComplete();
                }
                
                resolve(img);
            };
            
            img.onerror = () => {
                console.error(`Failed to load image: ${name} (${src})`);
                reject(new Error(`Failed to load ${name}`));
            };
            
            img.src = src;
        });
    }

    // Get loaded image
    getImage(name) {
        const img = this.images.get(name);
        if (!img) {
            console.warn(`Image '${name}' not found`);
        }
        return img;
    }

    // Check if image exists
    hasImage(name) {
        return this.images.has(name);
    }

    // Get loading progress
    getProgress() {
        return {
            loaded: this.loadedCount,
            total: this.totalCount,
            percentage: this.totalCount === 0 ? 100 : (this.loadedCount / this.totalCount) * 100
        };
    }

    // Set progress callback
    setProgressCallback(callback) {
        this.onProgress = callback;
    }

    // Set completion callback
    setCompleteCallback(callback) {
        this.onComplete = callback;
    }
}

// Global asset manager instance
export const assetManager = new AssetManager();