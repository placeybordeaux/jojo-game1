(function() {
    const game = {
        canvas: null,
        ctx: null,
        images: {
            girl: { src: 'girl.png' },
            apple: { src: 'apple.png' },
            cookie: { src: 'cookie.png' },
            house: { src: 'house.png' },
            outdoorBackground: { src: 'outdoor.png' },
            orangeTree: { src: 'orange_tree.png' },
            orange: { src: 'orange.png' },
            chicken: { src: 'chicken.png' },
            chickenCoop: { src: 'chicken_coop.png' }
        },
        imagesLoaded: 0,
        totalImages: 0,
        currentScene: 'indoor',

        init: function() {
            this.canvas = document.getElementById('gameCanvas');
            this.ctx = this.canvas.getContext('2d');
            this.totalImages = Object.keys(this.images).length;
            this.loadImages();
        },

        loadImages: function() {
            for (let key in this.images) {
                this.images[key].img = new Image();
                this.images[key].img.onload = () => {
                    this.imagesLoaded++;
                    if (this.imagesLoaded === this.totalImages) {
                        this.startGame();
                    }
                };
                this.images[key].img.onerror = () => {
                    console.error(`Failed to load image: ${key} (${this.images[key].src})`);
                    alert(`Error: Failed to load image '${key}' (${this.images[key].src}). Please check if the file exists and the path is correct.`);
                };
                this.images[key].img.src = this.images[key].src;
            }
        },

        startGame: function() {
            this.gameLoop();
        },

        gameLoop: function() {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        },

        update: function() {
            girl.move();
            this.checkSceneTransition();
            if (this.currentScene === 'outdoor') {
                orangeTree.update();
                chickens.update();
                chickenCoop.checkChickenDelivery();
            } else if (this.currentScene === 'kitchen') {
                kitchen.update();
            }
        },

        draw: function() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (this.currentScene === 'indoor') {
                this.ctx.drawImage(this.images.house.img, 0, 0, this.canvas.width, this.canvas.height);
                door.draw(this.ctx);  // Draw the door
                kitchenDoor.draw(this.ctx);  // Draw the kitchen door
                items.apple.draw(this.ctx);
                items.cookie.draw(this.ctx);
            } else if (this.currentScene === 'outdoor') {
                this.ctx.drawImage(this.images.outdoorBackground.img, 0, 0, this.canvas.width, this.canvas.height);
                orangeTree.draw(this.ctx);
                chickens.draw(this.ctx);
                chickenCoop.draw(this.ctx);
            } else if (this.currentScene === 'kitchen') {
                kitchen.draw(this.ctx);
            }
            girl.draw(this.ctx);
            speechBubble.draw(this.ctx);
        },

        checkSceneTransition: function() {
            if (this.currentScene === 'indoor' && 
                girl.x + girl.width > door.x &&
                girl.x < door.x + door.width &&
                girl.y + girl.height > door.y &&
                girl.y < door.y + door.height &&
                input.spacePressed) {
                this.currentScene = 'outdoor';
                girl.x = 50;  // Start a bit inside the outdoor scene
                input.spacePressed = false;  // Reset space press
            } else if (this.currentScene === 'indoor' &&
                girl.x + girl.width > kitchenDoor.x &&
                girl.x < kitchenDoor.x + kitchenDoor.width &&
                girl.y + girl.height > kitchenDoor.y &&
                girl.y < kitchenDoor.y + kitchenDoor.height &&
                input.spacePressed) {
                this.currentScene = 'kitchen';
                girl.x = 50;
                girl.y = 300;
                input.spacePressed = false;
            } else if (this.currentScene === 'outdoor' && girl.x < 0) {
                this.currentScene = 'indoor';
                girl.x = this.canvas.width - girl.width - 50;  // Start a bit inside the house
            } else if (this.currentScene === 'kitchen' && girl.x < 0) {
                this.currentScene = 'indoor';
                girl.x = kitchenDoor.x - girl.width - 10;
                girl.y = kitchenDoor.y + 20;
            }
        },
    };

    const door = {
        x: 700,
        y: 280,  // Moved down to the bottom
        width: 60,
        height: 120,
        
        draw: function(ctx) {
            ctx.fillStyle = 'brown';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };

    const kitchenDoor = {
        x: 50,
        y: 280,
        width: 60,
        height: 120,
        
        draw: function(ctx) {
            ctx.fillStyle = 'darkgreen';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('KITCHEN', this.x + this.width/2, this.y + this.height/2);
        }
    };

    const girl = {
        x: 100,
        y: 300,
        width: 50,
        height: 100,
        speed: 5,
        carryingChicken: false,
        
        move: function() {
            let dx = 0;
            let dy = 0;

            if (input.rightPressed && this.x < game.canvas.width - this.width) {
                dx += this.speed;
            }
            if (input.leftPressed && this.x > 0) {
                dx -= this.speed;
            }
            if (input.upPressed && this.y > 0) {
                dy -= this.speed;
            }
            if (input.downPressed && this.y < game.canvas.height - this.height) {
                dy += this.speed;
            }

            // Normalize diagonal movement
            if (dx !== 0 && dy !== 0) {
                const factor = Math.sqrt(2) / 2;
                dx *= factor;
                dy *= factor;
            }

            this.x += dx;
            this.y += dy;
        },

        draw: function(ctx) {
            ctx.drawImage(game.images.girl.img, this.x, this.y, this.width, this.height);
        },

        interactWithChickens: function() {
            if (!this.carryingChicken) {
                chickens.list.forEach(chicken => {
                    if (!chicken.carried &&
                        this.x < chicken.x + chicken.width &&
                        this.x + this.width > chicken.x &&
                        this.y < chicken.y + chicken.height &&
                        this.y + this.height > chicken.y) {
                        chicken.carried = true;
                        this.carryingChicken = true;
                        speechBubble.show('Got you!');
                    }
                });
            } else {
                chickens.list.forEach(chicken => {
                    if (chicken.carried) {
                        chicken.carried = false;
                        this.carryingChicken = false;
                        speechBubble.show('Off you go!');
                    }
                });
            }
        }
    };

    const orangeTree = {
        x: 200,
        y: 0,
        width: 150,
        height: 200,
        oranges: [],

        init: function() {
            for (let i = 0; i < 5; i++) {
                this.oranges.push({
                    x: this.x + 20 + Math.random() * (this.width - 40),
                    y: this.y + 50 + Math.random() * (this.height - 100),
                    width: 30,
                    height: 30,
                    picked: false
                });
            }
        },

        update: function() {
            this.oranges.forEach(orange => {
                if (!orange.picked &&
                    girl.x < orange.x + orange.width &&
                    girl.x + girl.width > orange.x &&
                    girl.y < orange.y + orange.height &&
                    girl.y + girl.height > orange.y) {
                    orange.picked = true;
                    speechBubble.show('Yum! Fresh orange!');
                }
            });
        },

        draw: function(ctx) {
            ctx.drawImage(game.images.orangeTree.img, this.x, this.y, this.width, this.height);
            this.oranges.forEach(orange => {
                if (!orange.picked) {
                    ctx.drawImage(game.images.orange.img, orange.x, orange.y, orange.width, orange.height);
                }
            });
        }
    };

    const chickens = {
        list: [],
        init: function() {
            for (let i = 0; i < 3; i++) {
                this.list.push({
                    x: Math.random() * (game.canvas.width - 50),
                    y: Math.random() * (game.canvas.height - 50),
                    width: 50,
                    height: 50,
                    speed: 1,
                    direction: Math.random() * Math.PI * 2,
                    lastCluck: 0,
                    carried: false
                });
            }
        },
        update: function() {
            this.list.forEach(chicken => {
                if (!chicken.carried) {
                    chicken.x += Math.cos(chicken.direction) * chicken.speed;
                    chicken.y += Math.sin(chicken.direction) * chicken.speed;

                    // Bounce off edges more intelligently
                    if (chicken.x < 0) {
                        chicken.x = 0;
                        chicken.direction = Math.random() * Math.PI - Math.PI / 2; // Point right (between -90 and 90 degrees)
                    } else if (chicken.x > game.canvas.width - chicken.width) {
                        chicken.x = game.canvas.width - chicken.width;
                        chicken.direction = Math.random() * Math.PI + Math.PI / 2; // Point left (between 90 and 270 degrees)
                    }
                    
                    if (chicken.y < 0) {
                        chicken.y = 0;
                        chicken.direction = Math.random() * Math.PI; // Point down (between 0 and 180 degrees)
                    } else if (chicken.y > game.canvas.height - chicken.height) {
                        chicken.y = game.canvas.height - chicken.height;
                        chicken.direction = Math.random() * Math.PI + Math.PI; // Point up (between 180 and 360 degrees)
                    }

                    if (Date.now() - chicken.lastCluck > 5000 + Math.random() * 5000) {
                        speechBubble.showForChicken('Cluck!', chicken);
                        chicken.lastCluck = Date.now();
                    }
                } else {
                    chicken.x = girl.x;
                    chicken.y = girl.y - chicken.height;
                }
            });
        },
        draw: function(ctx) {
            this.list.forEach(chicken => {
                if (!chicken.carried) {
                    ctx.drawImage(game.images.chicken.img, chicken.x, chicken.y, chicken.width, chicken.height);
                }
            });
        }
    };

    const chickenCoop = {
        x: 600,
        y: 50,
        width: 100,
        height: 100,
        chickensInside: 0,

        draw: function(ctx) {
            ctx.drawImage(game.images.chickenCoop.img, this.x, this.y, this.width, this.height);
        },

        checkChickenDelivery: function() {
            chickens.list.forEach(chicken => {
                if (chicken.carried &&
                    girl.x < this.x + this.width &&
                    girl.x + girl.width > this.x &&
                    girl.y < this.y + this.height &&
                    girl.y + girl.height > this.y) {
                    chicken.carried = false;
                    this.chickensInside++;
                    chicken.x = -100;  // Move chicken off-screen
                    chicken.y = -100;
                    this.showHearts();
                }
            });
        },

        showHearts: function() {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    let heart = {
                        x: this.x + Math.random() * this.width,
                        y: this.y + Math.random() * this.height,
                        size: 20,
                        speed: 2
                    };
                    let heartInterval = setInterval(() => {
                        heart.y -= heart.speed;
                        game.ctx.font = `${heart.size}px Arial`;
                        game.ctx.fillText('❤️', heart.x, heart.y);
                        if (heart.y < 0) {
                            clearInterval(heartInterval);
                        }
                    }, 50);
                }, i * 200);
            }
        }
    };

    const items = {
        apple: {
            x: 600,
            y: 350,
            width: 30,
            height: 30,
            eaten: false,
            
            draw: function(ctx) {
                if (!this.eaten) {
                    ctx.drawImage(game.images.apple.img, this.x, this.y, this.width, this.height);
                }
            },

            interact: function() {
                if (!this.eaten && 
                    girl.x < this.x + this.width &&
                    girl.x + girl.width > this.x &&
                    girl.y < this.y + this.height &&
                    girl.y + girl.height > this.y) {
                    this.eaten = true;
                    speechBubble.show('Hiccup!');
                }
            }
        },

        cookie: {
            x: 50,
            y: 350,
            width: 30,
            height: 30,
            eaten: false,
            
            draw: function(ctx) {
                if (!this.eaten) {
                    ctx.drawImage(game.images.cookie.img, this.x, this.y, this.width, this.height);
                }
            },

            interact: function() {
                if (!this.eaten && 
                    girl.x < this.x + this.width &&
                    girl.x + girl.width > this.x &&
                    girl.y < this.y + this.height &&
                    girl.y + girl.height > this.y) {
                    this.eaten = true;
                    speechBubble.show('Yum! I love it!');
                }
            }
        }
    };

    const speechBubble = {
        visible: false,
        duration: 2000,
        startTime: 0,
        text: '',
        speaker: null,

        show: function(text) {
            this.text = text;
            this.visible = true;
            this.startTime = Date.now();
            this.speaker = girl;
        },

        showForChicken: function(text, chicken) {
            this.text = text;
            this.visible = true;
            this.startTime = Date.now();
            this.speaker = chicken;
        },

        draw: function(ctx) {
            if (this.visible && this.speaker) {
                const currentTime = Date.now();
                if (currentTime - this.startTime < this.duration) {
                    const centerX = this.speaker.x + this.speaker.width / 2;
                    const bubbleY = this.speaker.y - 50;
                    const textY = this.speaker.y - 45;
                    
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.moveTo(centerX, bubbleY + 40);
                    ctx.lineTo(centerX - 5, bubbleY + 30);
                    ctx.lineTo(centerX + 5, bubbleY + 30);
                    ctx.fill();
                    
                    ctx.beginPath();
                    ctx.ellipse(centerX, bubbleY, 40, 30, 0, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.fillStyle = 'black';
                    ctx.font = '16px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(this.text, centerX, textY);
                } else {
                    this.visible = false;
                }
            }
        }
    };

    const kitchen = {
        ingredients: [
            { name: 'Flour', x: 100, y: 100, width: 40, height: 40, collected: false, color: '#F5F5DC' },
            { name: 'Eggs', x: 200, y: 100, width: 40, height: 40, collected: false, color: '#FFFACD' },
            { name: 'Milk', x: 300, y: 100, width: 40, height: 40, collected: false, color: '#FFFFFF' },
            { name: 'Sugar', x: 400, y: 100, width: 40, height: 40, collected: false, color: '#F0F8FF' },
            { name: 'Butter', x: 500, y: 100, width: 40, height: 40, collected: false, color: '#FFFACD' }
        ],
        
        cookingStation: {
            x: 300, y: 250, width: 80, height: 60,
            ingredients: [], // ingredients brought here
            recipes: [
                { name: 'Pancakes', ingredients: ['Flour', 'Eggs', 'Milk'], completed: false },
                { name: 'Cake', ingredients: ['Flour', 'Eggs', 'Sugar', 'Butter'], completed: false },
                { name: 'Cookies', ingredients: ['Flour', 'Sugar', 'Butter'], completed: false }
            ],
            currentRecipe: 0
        },

        girl: {
            carriedIngredient: null
        },

        init: function() {
            // Reset ingredients and cooking station
            this.ingredients.forEach(ing => ing.collected = false);
            this.cookingStation.ingredients = [];
            this.cookingStation.recipes.forEach(recipe => recipe.completed = false);
            this.girl.carriedIngredient = null;
        },

        update: function() {
            this.checkIngredientPickup();
            this.checkIngredientDelivery();
            this.checkRecipeCompletion();
        },

        checkIngredientPickup: function() {
            if (!this.girl.carriedIngredient) {
                this.ingredients.forEach(ingredient => {
                    if (!ingredient.collected &&
                        girl.x < ingredient.x + ingredient.width &&
                        girl.x + girl.width > ingredient.x &&
                        girl.y < ingredient.y + ingredient.height &&
                        girl.y + girl.height > ingredient.y) {
                        ingredient.collected = true;
                        this.girl.carriedIngredient = ingredient;
                        speechBubble.show(`Picked up ${ingredient.name}!`);
                    }
                });
            }
        },

        checkIngredientDelivery: function() {
            if (this.girl.carriedIngredient &&
                girl.x < this.cookingStation.x + this.cookingStation.width &&
                girl.x + girl.width > this.cookingStation.x &&
                girl.y < this.cookingStation.y + this.cookingStation.height &&
                girl.y + girl.height > this.cookingStation.y) {
                
                this.cookingStation.ingredients.push(this.girl.carriedIngredient.name);
                speechBubble.show(`Added ${this.girl.carriedIngredient.name} to station!`);
                this.girl.carriedIngredient = null;
            }
        },

        checkRecipeCompletion: function() {
            const currentRecipe = this.cookingStation.recipes[this.cookingStation.currentRecipe];
            if (!currentRecipe.completed) {
                const hasAllIngredients = currentRecipe.ingredients.every(ing => 
                    this.cookingStation.ingredients.includes(ing)
                );
                
                if (hasAllIngredients) {
                    currentRecipe.completed = true;
                    speechBubble.show(`${currentRecipe.name} completed!`);
                    // Reset station for next recipe
                    this.cookingStation.ingredients = [];
                    // Move to next recipe
                    this.cookingStation.currentRecipe = (this.cookingStation.currentRecipe + 1) % this.cookingStation.recipes.length;
                }
            }
        },

        draw: function(ctx) {
            // Draw kitchen background (simple tiles)
            ctx.fillStyle = '#F0F0F0';
            ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
            
            // Draw tile pattern
            ctx.strokeStyle = '#CCCCCC';
            ctx.lineWidth = 1;
            for (let x = 0; x < game.canvas.width; x += 50) {
                for (let y = 0; y < game.canvas.height; y += 50) {
                    ctx.strokeRect(x, y, 50, 50);
                }
            }

            // Draw ingredients
            this.ingredients.forEach(ingredient => {
                if (!ingredient.collected) {
                    ctx.fillStyle = ingredient.color;
                    ctx.fillRect(ingredient.x, ingredient.y, ingredient.width, ingredient.height);
                    ctx.strokeStyle = '#333';
                    ctx.strokeRect(ingredient.x, ingredient.y, ingredient.width, ingredient.height);
                    
                    ctx.fillStyle = 'black';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(ingredient.name, ingredient.x + ingredient.width/2, ingredient.y - 5);
                }
            });

            // Draw cooking station
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.cookingStation.x, this.cookingStation.y, this.cookingStation.width, this.cookingStation.height);
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.cookingStation.x, this.cookingStation.y, this.cookingStation.width, this.cookingStation.height);
            
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('STOVE', this.cookingStation.x + this.cookingStation.width/2, this.cookingStation.y + this.cookingStation.height/2);

            // Draw carried ingredient above girl
            if (this.girl.carriedIngredient) {
                const ingredient = this.girl.carriedIngredient;
                ctx.fillStyle = ingredient.color;
                ctx.fillRect(girl.x + 10, girl.y - 20, 30, 30);
                ctx.strokeStyle = '#333';
                ctx.strokeRect(girl.x + 10, girl.y - 20, 30, 30);
            }

            // Draw recipe list
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(600, 50, 180, 200);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(600, 50, 180, 200);
            
            ctx.fillStyle = 'black';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('RECIPES', 690, 70);
            
            ctx.font = '10px Arial';
            ctx.textAlign = 'left';
            this.cookingStation.recipes.forEach((recipe, index) => {
                const y = 90 + index * 50;
                const isCurrent = index === this.cookingStation.currentRecipe;
                
                ctx.fillStyle = recipe.completed ? 'green' : (isCurrent ? 'blue' : 'black');
                ctx.fillText(`${recipe.name}${recipe.completed ? ' ✓' : ''}`, 610, y);
                
                ctx.fillStyle = 'gray';
                ctx.font = '8px Arial';
                recipe.ingredients.forEach((ing, i) => {
                    const hasIngredient = this.cookingStation.ingredients.includes(ing);
                    ctx.fillStyle = hasIngredient ? 'green' : 'gray';
                    ctx.fillText(`• ${ing}`, 615, y + 10 + i * 10);
                });
                ctx.font = '10px Arial';
            });
        }
    };

    const input = {
        rightPressed: false,
        leftPressed: false,
        upPressed: false,
        downPressed: false,
        spacePressed: false,

        init: function() {
            document.addEventListener('keydown', this.keyDownHandler.bind(this));
            document.addEventListener('keyup', this.keyUpHandler.bind(this));
        },

        keyDownHandler: function(e) {
            if (e.key === 'Right' || e.key === 'ArrowRight') {
                this.rightPressed = true;
            } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
                this.leftPressed = true;
            } else if (e.key === 'Up' || e.key === 'ArrowUp') {
                this.upPressed = true;
            } else if (e.key === 'Down' || e.key === 'ArrowDown') {
                this.downPressed = true;
            } else if (e.key === ' ' || e.key === 'Spacebar') {
                this.spacePressed = true;
                this.interact();
            }
        },

        keyUpHandler: function(e) {
            if (e.key === 'Right' || e.key === 'ArrowRight') {
                this.rightPressed = false;
            } else if (e.key === 'Up' || e.key === 'ArrowUp') {
                this.upPressed = false;
            } else if (e.key === 'Down' || e.key === 'ArrowDown') {
                this.downPressed = false;
            } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
                this.leftPressed = false;
            } else if (e.key === ' ' || e.key === 'Spacebar') {
                this.spacePressed = false;
            }
        },

        interact: function() {
            if (game.currentScene === 'indoor') {
                items.apple.interact();
                items.cookie.interact();
            } else if (game.currentScene === 'outdoor') {
                girl.interactWithChickens();
            }
            // Kitchen interactions are handled automatically in kitchen.update()
        }
    };

    // Initialize the game
    game.init();
    input.init();
    orangeTree.init();
    chickens.init();
    kitchen.init();
})();
