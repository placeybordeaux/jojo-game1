// Game configuration - centralized settings
export const gameConfig = {
    canvas: {
        width: 800,
        height: 400,
        id: 'gameCanvas'
    },

    assets: {
        images: {
            girl: 'girl.png',
            apple: 'apple.png',
            cookie: 'cookie.png',
            house: 'house.png',
            outdoor: 'outdoor.png',
            orangeTree: 'orange_tree.png',
            orange: 'orange.png',
            chicken: 'chicken.png',
            chickenCoop: 'chicken_coop.png'
        }
    },

    player: {
        startX: 100,
        startY: 300,
        width: 50,
        height: 100,
        speed: 5,
        maxInventorySize: 6
    },

    hygiene: {
        dirtyingRate: 0.1,     // How fast player gets dirty from chickens
        bathroomRate: 0.02,    // How fast bathroom need increases
        bathTime: 200,         // Frames to complete bathing
        washTime: 100,         // Frames to wash hands
        peeTime: 100           // Frames to use toilet
    },

    kitchen: {
        waffleRecipe: {
            name: 'Waffles',
            ingredients: ['Flour', 'Eggs', 'Milk', 'Sugar']
        },
        cookTime: 3000  // 3 seconds in milliseconds
    },

    friend: {
        name: 'Maya',
        visitInterval: [600, 1200], // 10-20 seconds between visits
        visitDuration: 1800,        // 30 seconds
        walkSpeed: 1,
        gifts: [
            { name: 'Flower', type: 'gift', icon: '🌸' },
            { name: 'Book', type: 'gift', icon: '📖' }
        ]
    },

    items: {
        orange: { name: 'Orange', type: 'food', icon: '🍊' },
        apple: { name: 'Apple', type: 'food', icon: '🍎' },
        cookie: { name: 'Cookie', type: 'food', icon: '🍪' }
    },

    scenes: {
        indoor: {
            doors: {
                outdoor: { x: 700, y: 280, width: 60, height: 120 },
                kitchen: { x: 50, y: 280, width: 60, height: 120 },
                bathroom: { x: 300, y: 280, width: 60, height: 120 }
            },
            tv: { x: 250, y: 180, width: 80, height: 60 },
            items: {
                apple: { x: 600, y: 350, width: 30, height: 30 },
                cookie: { x: 50, y: 350, width: 30, height: 30 }
            }
        },
        kitchen: {
            ingredients: [
                { name: 'Flour', x: 100, y: 80, width: 40, height: 40, color: '#F5F5DC' },
                { name: 'Eggs', x: 200, y: 80, width: 40, height: 40, color: '#FFFACD' },
                { name: 'Milk', x: 300, y: 80, width: 40, height: 40, color: '#FFFFFF' },
                { name: 'Sugar', x: 400, y: 80, width: 40, height: 40, color: '#F0F8FF' }
            ],
            mixingBowl: { x: 150, y: 200, width: 60, height: 40 },
            waffleMaker: { x: 400, y: 200, width: 80, height: 60 }
        },
        bathroom: {
            toilet: { x: 150, y: 150, width: 60, height: 80 },
            bathtub: { x: 400, y: 100, width: 120, height: 80 },
            sink: { x: 250, y: 200, width: 80, height: 40 },
            toiletPaper: { x: 100, y: 120, width: 30, height: 40, startingRolls: 3 }
        },
        outdoor: {
            orangeTree: { x: 200, y: 0, width: 150, height: 200, orangeCount: 5 },
            chickenCoop: { x: 600, y: 50, width: 100, height: 100 },
            chickens: { count: 3, speed: 1 }
        }
    },

    debug: {
        showFPS: true,
        showCollisionBoxes: false,
        autoLog: true,
        logInterval: 10000 // 10 seconds
    }
};