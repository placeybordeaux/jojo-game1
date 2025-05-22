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
            } else if (this.currentScene === 'bathroom') {
                bathroom.update();
            }
            
            // Update girl's hygiene
            this.updateHygiene();
        },

        draw: function() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (this.currentScene === 'indoor') {
                this.ctx.drawImage(this.images.house.img, 0, 0, this.canvas.width, this.canvas.height);
                door.draw(this.ctx);  // Draw the door
                kitchenDoor.draw(this.ctx);  // Draw the kitchen door
                bathroomDoor.draw(this.ctx);  // Draw the bathroom door
                items.apple.draw(this.ctx);
                items.cookie.draw(this.ctx);
            } else if (this.currentScene === 'outdoor') {
                this.ctx.drawImage(this.images.outdoorBackground.img, 0, 0, this.canvas.width, this.canvas.height);
                orangeTree.draw(this.ctx);
                chickens.draw(this.ctx);
                chickenCoop.draw(this.ctx);
            } else if (this.currentScene === 'kitchen') {
                kitchen.draw(this.ctx);
            } else if (this.currentScene === 'bathroom') {
                bathroom.draw(this.ctx);
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
            } else if (this.currentScene === 'indoor' &&
                girl.x + girl.width > bathroomDoor.x &&
                girl.x < bathroomDoor.x + bathroomDoor.width &&
                girl.y + girl.height > bathroomDoor.y &&
                girl.y < bathroomDoor.y + bathroomDoor.height &&
                input.spacePressed) {
                this.currentScene = 'bathroom';
                girl.x = 50;
                girl.y = 300;
                input.spacePressed = false;
            } else if (this.currentScene === 'kitchen' && girl.x < 0) {
                this.currentScene = 'indoor';
                girl.x = kitchenDoor.x - girl.width - 10;
                girl.y = kitchenDoor.y + 20;
            } else if (this.currentScene === 'bathroom' && girl.x < 0) {
                this.currentScene = 'indoor';
                girl.x = bathroomDoor.x - girl.width - 10;
                girl.y = bathroomDoor.y + 20;
            }
        },

        updateHygiene: function() {
            // Slowly increase bathroom need over time
            if (girl.needsBathroom < 100) {
                girl.needsBathroom += 0.02; // Takes about 5 minutes to get urgent
            }
            
            // Get dirty when interacting with chickens
            if (this.currentScene === 'outdoor' && girl.carryingChicken) {
                girl.dirtiness += 0.1;
                if (girl.dirtiness > 100) girl.dirtiness = 100;
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

    const bathroomDoor = {
        x: 300,
        y: 280,
        width: 60,
        height: 120,
        
        draw: function(ctx) {
            ctx.fillStyle = 'lightblue';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = 'darkblue';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('BATHROOM', this.x + this.width/2, this.y + this.height/2);
        }
    };

    const girl = {
        x: 100,
        y: 300,
        width: 50,
        height: 100,
        speed: 5,
        carryingChicken: false,
        dirtiness: 0, // 0-100, 100 being very dirty
        needsBathroom: 0, // 0-100, 100 being urgent
        handsClean: true,
        
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
            cookDuration: 3000, // 3 seconds
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

        update: function() {
            if (this.waffleMaker.cooking) {
                this.waffleMaker.cookTime += 16; // Assuming 60fps
                if (this.waffleMaker.cookTime >= this.waffleMaker.cookDuration) {
                    this.waffleMaker.cooking = false;
                    this.waffleMaker.waffleReady = true;
                    this.waffleMaker.hasBatter = false;
                    speechBubble.show('Waffle is ready!');
                }
            }
        },

        interact: function() {
            // Check ingredient pickup
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
            
            // Check mixing bowl interaction (separate from ingredient pickup)
            if (girl.x < this.mixingBowl.x + this.mixingBowl.width &&
                girl.x + girl.width > this.mixingBowl.x &&
                girl.y < this.mixingBowl.y + this.mixingBowl.height &&
                girl.y + girl.height > this.mixingBowl.y) {
                
                if (this.girl.carriedIngredient) {
                    this.mixingBowl.ingredients.push(this.girl.carriedIngredient.name);
                    speechBubble.show(`Added ${this.girl.carriedIngredient.name} to bowl!`);
                    this.girl.carriedIngredient = null;
                    return; // Exit after adding ingredient
                } 
                
                // Try to mix if not carrying anything
                if (!this.girl.carriedIngredient && !this.mixingBowl.mixed) {
                    if (this.mixingBowl.ingredients.length >= this.waffleRecipe.ingredients.length) {
                        const hasAllIngredients = this.waffleRecipe.ingredients.every(ing => 
                            this.mixingBowl.ingredients.includes(ing)
                        );
                        
                        if (hasAllIngredients) {
                            this.mixingBowl.mixed = true;
                            speechBubble.show('Mixed the batter!');
                            return;
                        } else {
                            speechBubble.show('Missing ingredients for waffle batter!');
                            return;
                        }
                    } else {
                        speechBubble.show(`Need ${this.waffleRecipe.ingredients.length - this.mixingBowl.ingredients.length} more ingredients!`);
                        return;
                    }
                }
            }
            
            // Check waffle maker interaction
            if (girl.x < this.waffleMaker.x + this.waffleMaker.width &&
                girl.x + girl.width > this.waffleMaker.x &&
                girl.y < this.waffleMaker.y + this.waffleMaker.height &&
                girl.y + girl.height > this.waffleMaker.y) {
                
                if (this.waffleMaker.waffleReady) {
                    this.waffleMaker.waffleReady = false;
                    this.waffleRecipe.completed = true;
                    speechBubble.show('Got the waffle!');
                } else if (this.mixingBowl.mixed && !this.waffleMaker.hasBatter && !this.waffleMaker.cooking) {
                    this.waffleMaker.hasBatter = true;
                    this.waffleMaker.cooking = true;
                    this.waffleMaker.cookTime = 0;
                    this.mixingBowl.ingredients = [];
                    this.mixingBowl.mixed = false;
                    speechBubble.show('Cooking waffle...');
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

            // Draw mixing bowl
            ctx.fillStyle = this.mixingBowl.mixed ? '#FFE4B5' : '#FFFFFF';
            ctx.beginPath();
            ctx.ellipse(this.mixingBowl.x + this.mixingBowl.width/2, this.mixingBowl.y + this.mixingBowl.height/2, 
                       this.mixingBowl.width/2, this.mixingBowl.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('MIXING BOWL', this.mixingBowl.x + this.mixingBowl.width/2, this.mixingBowl.y - 10);

            // Draw waffle maker
            ctx.fillStyle = this.waffleMaker.cooking ? '#FF4444' : (this.waffleMaker.waffleReady ? '#FFD700' : '#C0C0C0');
            ctx.fillRect(this.waffleMaker.x, this.waffleMaker.y, this.waffleMaker.width, this.waffleMaker.height);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.waffleMaker.x, this.waffleMaker.y, this.waffleMaker.width, this.waffleMaker.height);
            
            // Draw waffle maker grid pattern
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            for (let i = 1; i < 4; i++) {
                ctx.beginPath();
                ctx.moveTo(this.waffleMaker.x + i * this.waffleMaker.width/4, this.waffleMaker.y + 10);
                ctx.lineTo(this.waffleMaker.x + i * this.waffleMaker.width/4, this.waffleMaker.y + this.waffleMaker.height - 10);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(this.waffleMaker.x + 10, this.waffleMaker.y + i * this.waffleMaker.height/4);
                ctx.lineTo(this.waffleMaker.x + this.waffleMaker.width - 10, this.waffleMaker.y + i * this.waffleMaker.height/4);
                ctx.stroke();
            }
            
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('WAFFLE MAKER', this.waffleMaker.x + this.waffleMaker.width/2, this.waffleMaker.y - 10);

            // Draw carried ingredient above girl
            if (this.girl.carriedIngredient) {
                const ingredient = this.girl.carriedIngredient;
                ctx.fillStyle = ingredient.color;
                ctx.fillRect(girl.x + 10, girl.y - 20, 30, 30);
                ctx.strokeStyle = '#333';
                ctx.strokeRect(girl.x + 10, girl.y - 20, 30, 30);
            }

            // Draw waffle recipe status
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(550, 50, 220, 180);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(550, 50, 220, 180);
            
            ctx.fillStyle = 'black';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('WAFFLE RECIPE', 660, 75);
            
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillStyle = this.waffleRecipe.completed ? 'green' : 'blue';
            ctx.fillText(`${this.waffleRecipe.name}${this.waffleRecipe.completed ? ' ✓' : ''}`, 560, 100);
            
            // Show recipe ingredients
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            ctx.fillText('Ingredients needed:', 560, 120);
            this.waffleRecipe.ingredients.forEach((ing, i) => {
                const inBowl = this.mixingBowl.ingredients.includes(ing);
                ctx.fillStyle = inBowl ? 'green' : 'gray';
                ctx.fillText(`• ${ing}`, 565, 135 + i * 12);
            });
            
            // Show mixing bowl status
            ctx.fillStyle = 'black';
            ctx.fillText('Mixing Bowl:', 560, 185);
            if (this.mixingBowl.ingredients.length > 0) {
                this.mixingBowl.ingredients.forEach((ing, i) => {
                    ctx.fillStyle = 'blue';
                    ctx.fillText(`• ${ing}`, 565, 200 + i * 12);
                });
            }
            if (this.mixingBowl.mixed) {
                ctx.fillStyle = 'green';
                ctx.fillText('✓ Batter ready!', 565, 200 + this.mixingBowl.ingredients.length * 12);
            }
        }
    };

    const bathroom = {
        toilet: {
            x: 150, y: 150, width: 60, height: 80,
            inUse: false
        },
        
        bathtub: {
            x: 400, y: 100, width: 120, height: 80,
            hasWater: false,
            temperature: 'cold' // cold, warm, hot
        },
        
        sink: {
            x: 250, y: 200, width: 80, height: 40,
            hasWater: false,
            hasSoap: true
        },

        toiletPaper: {
            x: 100, y: 120, width: 30, height: 40,
            rolls: 3 // Number of rolls available
        },
        
        girl: {
            peeing: false,
            peeProgress: 0,
            bathing: false,
            bathProgress: 0,
            washingHands: false,
            washProgress: 0,
            usingToiletPaper: false,
            wipingProgress: 0
        },

        init: function() {
            this.toilet.inUse = false;
            this.bathtub.hasWater = false;
            this.bathtub.temperature = 'cold';
            this.sink.hasWater = false;
            this.toiletPaper.rolls = 3;
            this.girl.peeing = false;
            this.girl.peeProgress = 0;
            this.girl.bathing = false;
            this.girl.bathProgress = 0;
            this.girl.washingHands = false;
            this.girl.washProgress = 0;
            this.girl.usingToiletPaper = false;
            this.girl.wipingProgress = 0;
        },

        update: function() {
            // Update peeing progress
            if (this.girl.peeing && input.spacePressed) {
                this.girl.peeProgress += 2;
                if (this.girl.peeProgress >= 100) {
                    this.girl.peeing = false;
                    this.girl.peeProgress = 0;
                    girl.needsBathroom = 0;
                    speechBubble.show('Done! Now I need toilet paper.');
                }
            } else if (this.girl.peeing) {
                // Stop peeing if space not held
                this.girl.peeing = false;
                this.girl.peeProgress = 0;
                speechBubble.show('Hold space to finish!');
            }

            // Update toilet paper wiping progress
            if (this.girl.usingToiletPaper && input.spacePressed && this.toiletPaper.rolls > 0) {
                this.girl.wipingProgress += 3;
                if (this.girl.wipingProgress >= 100) {
                    this.girl.usingToiletPaper = false;
                    this.girl.wipingProgress = 0;
                    this.toiletPaper.rolls--;
                    girl.handsClean = false; // Need to wash hands after using toilet paper
                    speechBubble.show('All clean! Better wash my hands now.');
                }
            } else if (this.girl.usingToiletPaper && this.toiletPaper.rolls <= 0) {
                this.girl.usingToiletPaper = false;
                this.girl.wipingProgress = 0;
                speechBubble.show('Oh no! No toilet paper left!');
            } else if (this.girl.usingToiletPaper) {
                this.girl.usingToiletPaper = false;
                this.girl.wipingProgress = 0;
                speechBubble.show('Hold space to use toilet paper!');
            }

            // Update bathing progress
            if (this.girl.bathing && input.spacePressed && this.bathtub.hasWater) {
                this.girl.bathProgress += 1;
                if (this.girl.bathProgress >= 200) { // Takes longer to get clean
                    this.girl.bathing = false;
                    this.girl.bathProgress = 0;
                    girl.dirtiness = 0;
                    this.bathtub.hasWater = false; // Drain tub
                    speechBubble.show('All clean!');
                }
            } else if (this.girl.bathing && !this.bathtub.hasWater) {
                this.girl.bathing = false;
                this.girl.bathProgress = 0;
                speechBubble.show('Need water in the tub first!');
            }

            // Update hand washing progress
            if (this.girl.washingHands && input.spacePressed && this.sink.hasWater && this.sink.hasSoap) {
                this.girl.washProgress += 3;
                if (this.girl.washProgress >= 100) {
                    this.girl.washingHands = false;
                    this.girl.washProgress = 0;
                    girl.handsClean = true;
                    this.sink.hasWater = false; // Turn off water
                    speechBubble.show('Hands are clean!');
                }
            } else if (this.girl.washingHands) {
                if (!this.sink.hasWater) {
                    speechBubble.show('Need to turn on water!');
                } else if (!this.sink.hasSoap) {
                    speechBubble.show('Need soap!');
                }
                this.girl.washingHands = false;
                this.girl.washProgress = 0;
            }
        },

        interact: function() {
            // Toilet paper interaction
            if (girl.x < this.toiletPaper.x + this.toiletPaper.width &&
                girl.x + girl.width > this.toiletPaper.x &&
                girl.y < this.toiletPaper.y + this.toiletPaper.height &&
                girl.y + girl.height > this.toiletPaper.y) {
                
                if (this.toiletPaper.rolls > 0) {
                    this.girl.usingToiletPaper = true;
                    this.girl.wipingProgress = 0;
                    speechBubble.show('Hold space to use toilet paper!');
                } else {
                    speechBubble.show('No toilet paper left!');
                }
                return;
            }

            // Toilet interaction
            if (girl.x < this.toilet.x + this.toilet.width &&
                girl.x + girl.width > this.toilet.x &&
                girl.y < this.toilet.y + this.toilet.height &&
                girl.y + girl.height > this.toilet.y) {
                
                if (girl.needsBathroom > 20) {
                    this.girl.peeing = true;
                    this.girl.peeProgress = 0;
                    speechBubble.show('Hold space to pee!');
                } else {
                    speechBubble.show("I don't need to go right now.");
                }
                return;
            }

            // Bathtub interaction
            if (girl.x < this.bathtub.x + this.bathtub.width &&
                girl.x + girl.width > this.bathtub.x &&
                girl.y < this.bathtub.y + this.bathtub.height &&
                girl.y + girl.height > this.bathtub.y) {
                
                if (!this.bathtub.hasWater) {
                    this.bathtub.hasWater = true;
                    this.bathtub.temperature = 'warm';
                    speechBubble.show('Filling tub with warm water...');
                } else if (girl.dirtiness > 30) {
                    this.girl.bathing = true;
                    this.girl.bathProgress = 0;
                    speechBubble.show('Hold space to bathe!');
                } else {
                    speechBubble.show("I'm already clean enough!");
                }
                return;
            }

            // Sink interaction
            if (girl.x < this.sink.x + this.sink.width &&
                girl.x + girl.width > this.sink.x &&
                girl.y < this.sink.y + this.sink.height &&
                girl.y + girl.height > this.sink.y) {
                
                if (!girl.handsClean) {
                    if (!this.sink.hasWater) {
                        this.sink.hasWater = true;
                        speechBubble.show('Turned on water. Press space again to wash hands!');
                    } else {
                        this.girl.washingHands = true;
                        this.girl.washProgress = 0;
                        speechBubble.show('Hold space to wash hands with soap!');
                    }
                } else {
                    speechBubble.show('My hands are already clean!');
                }
                return;
            }
        },

        draw: function(ctx) {
            // Draw bathroom background
            ctx.fillStyle = '#E6F3FF';
            ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
            
            // Draw tile pattern
            ctx.strokeStyle = '#B3D9FF';
            ctx.lineWidth = 1;
            for (let x = 0; x < game.canvas.width; x += 40) {
                for (let y = 0; y < game.canvas.height; y += 40) {
                    ctx.strokeRect(x, y, 40, 40);
                }
            }

            // Draw toilet
            ctx.fillStyle = 'white';
            ctx.fillRect(this.toilet.x, this.toilet.y, this.toilet.width, this.toilet.height);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.toilet.x, this.toilet.y, this.toilet.width, this.toilet.height);
            
            // Toilet seat
            ctx.beginPath();
            ctx.ellipse(this.toilet.x + this.toilet.width/2, this.toilet.y + 20, 25, 15, 0, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('TOILET', this.toilet.x + this.toilet.width/2, this.toilet.y - 5);

            // Draw bathtub
            ctx.fillStyle = this.bathtub.hasWater ? '#ADD8E6' : 'white';
            ctx.fillRect(this.bathtub.x, this.bathtub.y, this.bathtub.width, this.bathtub.height);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.bathtub.x, this.bathtub.y, this.bathtub.width, this.bathtub.height);
            
            ctx.fillStyle = 'black';
            ctx.fillText('BATHTUB', this.bathtub.x + this.bathtub.width/2, this.bathtub.y - 5);

            // Draw sink
            ctx.fillStyle = 'white';
            ctx.fillRect(this.sink.x, this.sink.y, this.sink.width, this.sink.height);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.sink.x, this.sink.y, this.sink.width, this.sink.height);
            
            // Faucet
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(this.sink.x + this.sink.width/2 - 5, this.sink.y - 10, 10, 10);
            
            // Water stream if on
            if (this.sink.hasWater) {
                ctx.strokeStyle = '#ADD8E6';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(this.sink.x + this.sink.width/2, this.sink.y - 5);
                ctx.lineTo(this.sink.x + this.sink.width/2, this.sink.y + 10);
                ctx.stroke();
            }
            
            ctx.fillStyle = 'black';
            ctx.fillText('SINK', this.sink.x + this.sink.width/2, this.sink.y - 15);

            // Draw progress bars
            if (this.girl.peeing && this.girl.peeProgress > 0) {
                this.drawProgressBar(ctx, 50, 50, this.girl.peeProgress, 'Peeing...');
            }
            if (this.girl.bathing && this.girl.bathProgress > 0) {
                this.drawProgressBar(ctx, 50, 80, this.girl.bathProgress/2, 'Bathing...'); // /2 because bath takes 200
            }
            if (this.girl.washingHands && this.girl.washProgress > 0) {
                this.drawProgressBar(ctx, 50, 110, this.girl.washProgress, 'Washing hands...');
            }

            // Draw hygiene status
            this.drawHygieneStatus(ctx);
        },

        drawProgressBar: function(ctx, x, y, progress, label) {
            ctx.fillStyle = 'white';
            ctx.fillRect(x, y, 200, 20);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(x, y, 200, 20);
            
            ctx.fillStyle = 'lightblue';
            ctx.fillRect(x, y, (progress / 100) * 200, 20);
            
            ctx.fillStyle = 'black';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(label, x, y - 5);
        },

        drawHygieneStatus: function(ctx) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(600, 50, 180, 150);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(600, 50, 180, 150);
            
            ctx.fillStyle = 'black';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('HYGIENE STATUS', 690, 70);
            
            ctx.font = '10px Arial';
            ctx.textAlign = 'left';
            
            // Dirtiness
            ctx.fillStyle = girl.dirtiness > 50 ? 'red' : (girl.dirtiness > 25 ? 'orange' : 'green');
            ctx.fillText(`Cleanliness: ${Math.max(0, 100 - girl.dirtiness)}%`, 610, 90);
            
            // Bathroom need
            ctx.fillStyle = girl.needsBathroom > 75 ? 'red' : (girl.needsBathroom > 50 ? 'orange' : 'green');
            ctx.fillText(`Bathroom need: ${Math.round(girl.needsBathroom)}%`, 610, 110);
            
            // Hand cleanliness
            ctx.fillStyle = girl.handsClean ? 'green' : 'red';
            ctx.fillText(`Hands: ${girl.handsClean ? 'Clean' : 'Dirty'}`, 610, 130);
            
            // Soap availability
            ctx.fillStyle = this.sink.hasSoap ? 'green' : 'red';
            ctx.fillText(`Soap: ${this.sink.hasSoap ? 'Available' : 'Empty'}`, 610, 150);
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
            } else if (game.currentScene === 'kitchen') {
                kitchen.interact();
            } else if (game.currentScene === 'bathroom') {
                bathroom.interact();
            }
        }
    };

    // Initialize the game
    game.init();
    input.init();
    orangeTree.init();
    chickens.init();
    kitchen.init();
    bathroom.init();
})();
