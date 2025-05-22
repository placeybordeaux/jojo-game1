// Kitchen mechanics test suite
// Run with: node kitchen-tests.js

// Mock objects to simulate game environment
const mockGirl = {
    x: 0, y: 0, width: 50, height: 100
};

const mockSpeechBubble = {
    show: function(text) {
        console.log(`[Speech]: ${text}`);
    }
};

// Extract kitchen logic for testing
function createKitchen() {
    return {
        ingredients: [
            { name: 'Flour', x: 100, y: 80, width: 40, height: 40, collected: false, color: '#F5F5DC' },
            { name: 'Eggs', x: 200, y: 80, width: 40, height: 40, collected: false, color: '#FFFACD' },
            { name: 'Milk', x: 300, y: 80, width: 40, height: 40, collected: false, color: '#FFFFFF' },
            { name: 'Sugar', x: 400, y: 80, width: 40, height: 40, collected: false, color: '#F0F8FF' }
        ],
        
        mixingBowl: {
            x: 150, y: 200, width: 60, height: 40,
            ingredients: [],
            mixed: false
        },

        waffleMaker: {
            x: 400, y: 200, width: 80, height: 60,
            hasBatter: false,
            cooking: false,
            cookTime: 0,
            cookDuration: 3000,
            waffleReady: false
        },

        girl: {
            carriedIngredient: null
        },

        waffleRecipe: {
            name: 'Waffles',
            ingredients: ['Flour', 'Eggs', 'Milk', 'Sugar'],
            completed: false
        },

        init: function() {
            this.ingredients.forEach(ing => ing.collected = false);
            this.mixingBowl.ingredients = [];
            this.mixingBowl.mixed = false;
            this.waffleMaker.hasBatter = false;
            this.waffleMaker.cooking = false;
            this.waffleMaker.waffleReady = false;
            this.girl.carriedIngredient = null;
            this.waffleRecipe.completed = false;
        },

        interact: function() {
            // Check ingredient pickup
            if (!this.girl.carriedIngredient) {
                this.ingredients.forEach(ingredient => {
                    if (!ingredient.collected &&
                        mockGirl.x < ingredient.x + ingredient.width &&
                        mockGirl.x + mockGirl.width > ingredient.x &&
                        mockGirl.y < ingredient.y + ingredient.height &&
                        mockGirl.y + mockGirl.height > ingredient.y) {
                        ingredient.collected = true;
                        this.girl.carriedIngredient = ingredient;
                        mockSpeechBubble.show(`Picked up ${ingredient.name}!`);
                    }
                });
            }
            
            // Check mixing bowl interaction separately (not as else if)
            if (mockGirl.x < this.mixingBowl.x + this.mixingBowl.width &&
                mockGirl.x + mockGirl.width > this.mixingBowl.x &&
                mockGirl.y < this.mixingBowl.y + this.mixingBowl.height &&
                mockGirl.y + mockGirl.height > this.mixingBowl.y) {
                
                if (this.girl.carriedIngredient) {
                    this.mixingBowl.ingredients.push(this.girl.carriedIngredient.name);
                    mockSpeechBubble.show(`Added ${this.girl.carriedIngredient.name} to bowl!`);
                    this.girl.carriedIngredient = null;
                    return; // Exit after adding ingredient
                } 
                
                // Try to mix if not carrying anything
                if (!this.girl.carriedIngredient && !this.mixingBowl.mixed) {
                    console.log('[DEBUG] Attempting to mix...');
                    console.log('[DEBUG] Bowl ingredients:', this.mixingBowl.ingredients);
                    console.log('[DEBUG] Required ingredients:', this.waffleRecipe.ingredients);
                    
                    if (this.mixingBowl.ingredients.length >= this.waffleRecipe.ingredients.length) {
                        const hasAllIngredients = this.waffleRecipe.ingredients.every(ing => {
                            const hasIt = this.mixingBowl.ingredients.includes(ing);
                            console.log(`[DEBUG] Has ${ing}:`, hasIt);
                            return hasIt;
                        });
                        
                        if (hasAllIngredients) {
                            this.mixingBowl.mixed = true;
                            mockSpeechBubble.show('Mixed the batter!');
                            return;
                        } else {
                            mockSpeechBubble.show('Missing ingredients for waffle batter!');
                            return;
                        }
                    } else {
                        mockSpeechBubble.show(`Need ${this.waffleRecipe.ingredients.length - this.mixingBowl.ingredients.length} more ingredients!`);
                        return;
                    }
                }
            }
            // Check waffle maker interaction
            else if (mockGirl.x < this.waffleMaker.x + this.waffleMaker.width &&
                mockGirl.x + mockGirl.width > this.waffleMaker.x &&
                mockGirl.y < this.waffleMaker.y + this.waffleMaker.height &&
                mockGirl.y + mockGirl.height > this.waffleMaker.y) {
                
                if (this.waffleMaker.waffleReady) {
                    this.waffleMaker.waffleReady = false;
                    this.waffleRecipe.completed = true;
                    mockSpeechBubble.show('Got the waffle!');
                } else if (this.mixingBowl.mixed && !this.waffleMaker.hasBatter && !this.waffleMaker.cooking) {
                    this.waffleMaker.hasBatter = true;
                    this.waffleMaker.cooking = true;
                    this.waffleMaker.cookTime = 0;
                    this.mixingBowl.ingredients = [];
                    this.mixingBowl.mixed = false;
                    mockSpeechBubble.show('Cooking waffle...');
                }
            }
        }
    };
}

// Test functions
function testIngredientPickup() {
    console.log('\n=== Testing Ingredient Pickup ===');
    const kitchen = createKitchen();
    kitchen.init();
    
    // Position girl at flour
    mockGirl.x = kitchen.ingredients[0].x;
    mockGirl.y = kitchen.ingredients[0].y;
    
    console.log(`Girl position: (${mockGirl.x}, ${mockGirl.y})`);
    console.log(`Flour position: (${kitchen.ingredients[0].x}, ${kitchen.ingredients[0].y})`);
    
    kitchen.interact();
    
    const success = kitchen.girl.carriedIngredient && kitchen.girl.carriedIngredient.name === 'Flour';
    console.log(`Result: ${success ? 'PASS' : 'FAIL'}`);
    if (!success) {
        console.log('Expected to carry Flour, got:', kitchen.girl.carriedIngredient);
    }
    
    return success;
}

function testMixingBowl() {
    console.log('\n=== Testing Mixing Bowl ===');
    const kitchen = createKitchen();
    kitchen.init();
    
    // Add all ingredients to bowl manually to test mixing logic
    kitchen.mixingBowl.ingredients = ['Flour', 'Eggs', 'Milk', 'Sugar'];
    kitchen.girl.carriedIngredient = null;
    
    // Position girl at mixing bowl
    mockGirl.x = kitchen.mixingBowl.x + 10;
    mockGirl.y = kitchen.mixingBowl.y + 10;
    
    console.log('Bowl ingredients:', kitchen.mixingBowl.ingredients);
    console.log('Recipe requires:', kitchen.waffleRecipe.ingredients);
    console.log(`Girl position: (${mockGirl.x}, ${mockGirl.y})`);
    console.log(`Bowl position: (${kitchen.mixingBowl.x}, ${kitchen.mixingBowl.y})`);
    
    // Check collision detection manually
    const inBowl = mockGirl.x < kitchen.mixingBowl.x + kitchen.mixingBowl.width &&
                  mockGirl.x + mockGirl.width > kitchen.mixingBowl.x &&
                  mockGirl.y < kitchen.mixingBowl.y + kitchen.mixingBowl.height &&
                  mockGirl.y + mockGirl.height > kitchen.mixingBowl.y;
    console.log('Collision detected:', inBowl);
    
    // Check ingredients match
    const hasAllIngredients = kitchen.waffleRecipe.ingredients.every(ing => 
        kitchen.mixingBowl.ingredients.includes(ing)
    );
    console.log('Has all ingredients:', hasAllIngredients);
    
    kitchen.interact();
    
    const success = kitchen.mixingBowl.mixed;
    console.log(`Result: ${success ? 'PASS' : 'FAIL'}`);
    if (!success) {
        console.log('Bowl state after interaction:', kitchen.mixingBowl);
    }
    
    return success;
}

function testWaffleMaker() {
    console.log('\n=== Testing Waffle Maker ===');
    const kitchen = createKitchen();
    kitchen.init();
    
    // Set up mixed batter
    kitchen.mixingBowl.mixed = true;
    kitchen.girl.carriedIngredient = null;
    
    // Position girl at waffle maker
    mockGirl.x = kitchen.waffleMaker.x + 10;
    mockGirl.y = kitchen.waffleMaker.y + 10;
    
    console.log('Batter ready:', kitchen.mixingBowl.mixed);
    console.log(`Girl position: (${mockGirl.x}, ${mockGirl.y})`);
    console.log(`Waffle maker position: (${kitchen.waffleMaker.x}, ${kitchen.waffleMaker.y})`);
    
    kitchen.interact();
    
    const success = kitchen.waffleMaker.cooking;
    console.log(`Result: ${success ? 'PASS' : 'FAIL'}`);
    if (!success) {
        console.log('Waffle maker state:', kitchen.waffleMaker);
    }
    
    return success;
}

function runFullWorkflow() {
    console.log('\n=== Testing Full Waffle Workflow ===');
    const kitchen = createKitchen();
    kitchen.init();
    
    let step = 1;
    
    // Step 1: Collect all ingredients
    console.log(`Step ${step++}: Collecting ingredients`);
    ['Flour', 'Eggs', 'Milk', 'Sugar'].forEach(ingredientName => {
        const ingredient = kitchen.ingredients.find(ing => ing.name === ingredientName);
        mockGirl.x = ingredient.x;
        mockGirl.y = ingredient.y;
        kitchen.interact();
        
        // Move to bowl and add ingredient
        mockGirl.x = kitchen.mixingBowl.x + 10;
        mockGirl.y = kitchen.mixingBowl.y + 10;
        kitchen.interact();
    });
    
    console.log('Ingredients in bowl:', kitchen.mixingBowl.ingredients);
    
    // Step 2: Mix batter
    console.log(`Step ${step++}: Mixing batter`);
    kitchen.interact();
    console.log('Batter mixed:', kitchen.mixingBowl.mixed);
    
    // Step 3: Cook waffle
    console.log(`Step ${step++}: Cooking waffle`);
    mockGirl.x = kitchen.waffleMaker.x + 10;
    mockGirl.y = kitchen.waffleMaker.y + 10;
    kitchen.interact();
    console.log('Waffle cooking:', kitchen.waffleMaker.cooking);
    
    const success = kitchen.waffleMaker.cooking;
    console.log(`Full workflow: ${success ? 'PASS' : 'FAIL'}`);
    
    return success;
}

// Run all tests
function runAllTests() {
    console.log('=== KITCHEN MECHANICS TEST SUITE ===');
    
    const results = [
        testIngredientPickup(),
        testMixingBowl(), 
        testWaffleMaker(),
        runFullWorkflow()
    ];
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Tests passed: ${passed}/${total}`);
    console.log(`Overall: ${passed === total ? 'ALL TESTS PASS' : 'SOME TESTS FAILED'}`);
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}