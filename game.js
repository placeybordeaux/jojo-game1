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
                friend.update();
            } else if (this.currentScene === 'kitchen') {
                kitchen.update();
            } else if (this.currentScene === 'bathroom') {
                bathroom.update();
            }
            
            // Update girl's hygiene
            this.updateHygiene();
            
            // Update TV animation
            tv.update();
        },

        draw: function() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (this.currentScene === 'indoor') {
                this.ctx.drawImage(this.images.house.img, 0, 0, this.canvas.width, this.canvas.height);
                door.draw(this.ctx);  // Draw the door
                kitchenDoor.draw(this.ctx);  // Draw the kitchen door
                bathroomDoor.draw(this.ctx);  // Draw the bathroom door
                tv.draw(this.ctx);  // Draw the TV
                items.apple.draw(this.ctx);
                items.cookie.draw(this.ctx);
            } else if (this.currentScene === 'outdoor') {
                this.ctx.drawImage(this.images.outdoorBackground.img, 0, 0, this.canvas.width, this.canvas.height);
                orangeTree.draw(this.ctx);
                chickens.draw(this.ctx);
                chickenCoop.draw(this.ctx);
                friend.draw(this.ctx);
            } else if (this.currentScene === 'kitchen') {
                kitchen.draw(this.ctx);
            } else if (this.currentScene === 'bathroom') {
                bathroom.draw(this.ctx);
            }
            girl.draw(this.ctx);
            speechBubble.draw(this.ctx);
            inventory.draw(this.ctx);
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

    const tv = {
        x: 250,
        y: 180,
        width: 80,
        height: 60,
        isOn: false,
        animationTime: 0,
        scene: 'cooking', // cooking, nature, or rainbow
        
        draw: function(ctx) {
            // TV frame (gray)
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 4;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            
            // TV stand
            ctx.fillStyle = '#444';
            ctx.fillRect(this.x + this.width/2 - 10, this.y + this.height, 20, 8);
            
            if (this.isOn) {
                // Draw TV show content
                this.drawTVShow(ctx);
            } else {
                // TV screen (black when off)
                ctx.fillStyle = 'black';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                
                // Screen reflection when off
                ctx.fillStyle = '#333';
                ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
            }
            
            // TV label
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('TV', this.x + this.width/2, this.y - 5);
        },

        drawTVShow: function(ctx) {
            // Screen background (blue sky)
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            if (this.scene === 'cooking') {
                this.drawCookingShow(ctx);
            } else if (this.scene === 'nature') {
                this.drawNatureShow(ctx);
            } else if (this.scene === 'rainbow') {
                this.drawRainbowShow(ctx);
            }
            
            // TV scan lines effect
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i < this.height; i += 3) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + i);
                ctx.lineTo(this.x + this.width, this.y + i);
                ctx.stroke();
            }
        },

        drawCookingShow: function(ctx) {
            // Chef (simple stick figure with hat)
            const centerX = this.x + this.width/2;
            const centerY = this.y + this.height/2;
            
            // Chef hat
            ctx.fillStyle = 'white';
            ctx.fillRect(centerX - 8, centerY - 20, 16, 12);
            
            // Chef head
            ctx.fillStyle = '#FFDBAC';
            ctx.beginPath();
            ctx.arc(centerX, centerY - 10, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Chef body
            ctx.fillStyle = 'white';
            ctx.fillRect(centerX - 6, centerY - 5, 12, 15);
            
            // Cooking pot (bouncing slightly)
            const bounce = Math.sin(this.animationTime * 0.1) * 2;
            ctx.fillStyle = '#444';
            ctx.fillRect(centerX + 15, centerY + bounce, 12, 8);
            
            // Steam from pot
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            for (let i = 0; i < 3; i++) {
                const steamY = centerY + bounce - 5 - i * 3 + Math.sin(this.animationTime * 0.15 + i) * 2;
                ctx.beginPath();
                ctx.arc(centerX + 21 + i * 2, steamY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        },

        drawNatureShow: function(ctx) {
            // Ground
            ctx.fillStyle = '#90EE90';
            ctx.fillRect(this.x, this.y + this.height - 15, this.width, 15);
            
            // Tree
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x + 20, this.y + 30, 8, 20);
            
            // Tree leaves (swaying)
            const sway = Math.sin(this.animationTime * 0.08) * 3;
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.arc(this.x + 24 + sway, this.y + 30, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Bird flying across screen
            const birdX = this.x + (this.animationTime * 0.5) % (this.width + 20) - 10;
            const birdY = this.y + 15 + Math.sin(this.animationTime * 0.1) * 3;
            
            if (birdX >= this.x - 10 && birdX <= this.x + this.width + 10) {
                ctx.fillStyle = 'black';
                ctx.font = '8px Arial';
                ctx.fillText('v', birdX, birdY);
            }
            
            // Sun
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(this.x + this.width - 15, this.y + 15, 8, 0, Math.PI * 2);
            ctx.fill();
        },

        drawRainbowShow: function(ctx) {
            // Rainbow colors
            const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
            
            // Animated rainbow bands
            for (let i = 0; i < colors.length; i++) {
                const y = this.y + 10 + i * 6 + Math.sin(this.animationTime * 0.1 + i * 0.5) * 2;
                ctx.fillStyle = colors[i];
                ctx.fillRect(this.x + 5, y, this.width - 10, 4);
            }
            
            // Bouncing star
            const starX = this.x + this.width/2 + Math.sin(this.animationTime * 0.12) * 20;
            const starY = this.y + this.height/2 + Math.cos(this.animationTime * 0.08) * 10;
            
            ctx.fillStyle = '#FFD700';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('★', starX, starY);
        },

        update: function() {
            if (this.isOn) {
                this.animationTime++;
                
                // Switch scenes every 300 frames (about 5 seconds at 60fps)
                if (this.animationTime % 300 === 0) {
                    const scenes = ['cooking', 'nature', 'rainbow'];
                    const currentIndex = scenes.indexOf(this.scene);
                    this.scene = scenes[(currentIndex + 1) % scenes.length];
                }
            }
        },

        interact: function() {
            if (girl.x < this.x + this.width &&
                girl.x + girl.width > this.x &&
                girl.y < this.y + this.height &&
                girl.y + girl.height > this.y) {
                
                this.isOn = !this.isOn;
                if (this.isOn) {
                    this.animationTime = 0;
                    speechBubble.show('Yay TV!');
                } else {
                    speechBubble.show('TV off');
                }
                return true;
            }
            return false;
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
        inventory: [], // Array of items: {name: 'Apple', type: 'food', icon: '🍎'}
        maxInventorySize: 6,
        
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
                    const orangeItem = {name: 'Orange', type: 'food', icon: '🍊'};
                    if (inventory.addItem(orangeItem)) {
                        speechBubble.show('Picked an orange! 🍊');
                    } else {
                        speechBubble.show('Inventory full!');
                    }
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
            // Don't start new interactions if already doing something
            if (this.girl.peeing || this.girl.bathing || this.girl.washingHands || this.girl.usingToiletPaper) {
                return;
            }

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

            // Draw toilet paper
            if (this.toiletPaper.rolls > 0) {
                ctx.fillStyle = 'white';
                ctx.fillRect(this.toiletPaper.x, this.toiletPaper.y, this.toiletPaper.width, this.toiletPaper.height);
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.toiletPaper.x, this.toiletPaper.y, this.toiletPaper.width, this.toiletPaper.height);
                
                // Draw perforated lines
                ctx.strokeStyle = '#ccc';
                ctx.lineWidth = 1;
                for (let i = 1; i < 4; i++) {
                    ctx.beginPath();
                    ctx.moveTo(this.toiletPaper.x, this.toiletPaper.y + i * this.toiletPaper.height/4);
                    ctx.lineTo(this.toiletPaper.x + this.toiletPaper.width, this.toiletPaper.y + i * this.toiletPaper.height/4);
                    ctx.stroke();
                }
                
                ctx.fillStyle = 'black';
                ctx.font = '8px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`TP (${this.toiletPaper.rolls})`, this.toiletPaper.x + this.toiletPaper.width/2, this.toiletPaper.y - 5);
            } else {
                // Empty toilet paper holder
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.toiletPaper.x, this.toiletPaper.y, this.toiletPaper.width, this.toiletPaper.height);
                ctx.fillStyle = 'red';
                ctx.font = '8px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('EMPTY!', this.toiletPaper.x + this.toiletPaper.width/2, this.toiletPaper.y + this.toiletPaper.height/2);
            }

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
            if (this.girl.usingToiletPaper && this.girl.wipingProgress > 0) {
                this.drawProgressBar(ctx, 50, 140, this.girl.wipingProgress, 'Using toilet paper...');
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
            ctx.fillRect(600, 50, 180, 170);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(600, 50, 180, 170);
            
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
            
            // Toilet paper availability
            ctx.fillStyle = this.toiletPaper.rolls > 0 ? 'green' : 'red';
            ctx.fillText(`Toilet Paper: ${this.toiletPaper.rolls} rolls`, 610, 170);
        }
    };

    const friend = {
        x: -100, // Starts off-screen
        y: 250,
        width: 50,
        height: 100,
        speed: 1,
        isVisiting: false,
        visitDuration: 0,
        maxVisitTime: 1800, // 30 seconds at 60fps
        nextVisitTime: 300, // 5 seconds until first visit
        inventory: [
            {name: 'Flower', type: 'gift', icon: '🌸'},
            {name: 'Book', type: 'gift', icon: '📖'}
        ],
        waving: false,
        waveTime: 0,
        
        init: function() {
            this.x = -100;
            this.isVisiting = false;
            this.visitDuration = 0;
            this.nextVisitTime = 300;
            this.inventory = [
                {name: 'Flower', type: 'gift', icon: '🌸'},
                {name: 'Book', type: 'gift', icon: '📖'}
            ];
        },

        update: function() {
            if (!this.isVisiting) {
                // Countdown to next visit
                this.nextVisitTime--;
                if (this.nextVisitTime <= 0) {
                    this.startVisit();
                }
            } else {
                // Handle visit
                this.visitDuration++;
                
                if (this.x < 50) {
                    // Walking in
                    this.x += this.speed;
                } else if (this.visitDuration > this.maxVisitTime - 200) {
                    // Walking away
                    this.x += this.speed;
                    if (this.x > game.canvas.width + 100) {
                        this.endVisit();
                    }
                } else {
                    // Standing and potentially waving
                    if (!this.waving && Math.random() < 0.005) {
                        this.startWaving();
                    }
                }
                
                if (this.waving) {
                    this.waveTime++;
                    if (this.waveTime > 60) { // Wave for 1 second
                        this.waving = false;
                        this.waveTime = 0;
                    }
                }
            }
        },

        startVisit: function() {
            this.isVisiting = true;
            this.visitDuration = 0;
            this.x = -100;
            speechBubble.show('A friend is visiting!');
        },

        endVisit: function() {
            this.isVisiting = false;
            this.visitDuration = 0;
            this.nextVisitTime = 600 + Math.random() * 600; // 10-20 seconds until next visit
            this.x = -100;
        },

        startWaving: function() {
            this.waving = true;
            this.waveTime = 0;
            if (this.isNearGirl()) {
                speechBubble.show('Hi there! 👋');
            }
        },

        isNearGirl: function() {
            return Math.abs(this.x - girl.x) < 100 && Math.abs(this.y - girl.y) < 100;
        },

        interact: function() {
            if (this.isVisiting && this.x >= 50 && this.x <= game.canvas.width - 50 &&
                girl.x < this.x + this.width &&
                girl.x + girl.width > this.x &&
                girl.y < this.y + this.height &&
                girl.y + girl.height > this.y) {
                
                this.openTradingInterface();
                return true;
            }
            return false;
        },

        openTradingInterface: function() {
            // Simple trading - friend gives a random item if girl has oranges
            const girlHasOranges = girl.inventory.some(item => item.name === 'Orange');
            const friendHasItems = this.inventory.length > 0;
            
            if (girlHasOranges && friendHasItems) {
                // Trade orange for friend's item
                const orangeIndex = girl.inventory.findIndex(item => item.name === 'Orange');
                const friendItem = this.inventory.shift();
                
                girl.inventory.splice(orangeIndex, 1);
                girl.inventory.push(friendItem);
                
                speechBubble.show(`Thanks! Here's a ${friendItem.name}! ${friendItem.icon}`);
            } else if (friendHasItems && girl.inventory.length < girl.maxInventorySize) {
                // Friend gives free gift
                const friendItem = this.inventory.shift();
                girl.inventory.push(friendItem);
                speechBubble.show(`Here's a gift! ${friendItem.name} ${friendItem.icon}`);
            } else if (girlHasOranges) {
                // Girl gives orange to friend
                const orangeIndex = girl.inventory.findIndex(item => item.name === 'Orange');
                girl.inventory.splice(orangeIndex, 1);
                speechBubble.show('Thank you for the orange!');
            } else {
                speechBubble.show('Nice to see you!');
            }
        },

        draw: function(ctx) {
            if (this.isVisiting && this.x > -50) {
                // Friend body (different color from girl)
                ctx.fillStyle = '#FFB6C1'; // Light pink
                ctx.fillRect(this.x, this.y, this.width, this.height);
                
                // Friend face
                ctx.fillStyle = '#FFDBAC';
                ctx.fillRect(this.x + 10, this.y + 10, 30, 30);
                
                // Hair (brown)
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(this.x + 5, this.y + 5, 40, 20);
                
                // Arms
                ctx.fillStyle = '#FFDBAC';
                if (this.waving) {
                    // Waving arm up
                    ctx.fillRect(this.x - 10, this.y + 20, 15, 30);
                    ctx.fillRect(this.x + this.width, this.y + 15, 15, 25);
                } else {
                    // Arms down
                    ctx.fillRect(this.x - 5, this.y + 25, 10, 40);
                    ctx.fillRect(this.x + this.width - 5, this.y + 25, 10, 40);
                }
                
                // Name tag
                ctx.fillStyle = 'white';
                ctx.font = '8px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Maya', this.x + this.width/2, this.y - 5);
            }
        }
    };

    const inventory = {
        isOpen: false,
        
        toggle: function() {
            this.isOpen = !this.isOpen;
        },

        addItem: function(item) {
            if (girl.inventory.length < girl.maxInventorySize) {
                girl.inventory.push(item);
                return true;
            }
            return false;
        },

        removeItem: function(itemName) {
            const index = girl.inventory.findIndex(item => item.name === itemName);
            if (index !== -1) {
                return girl.inventory.splice(index, 1)[0];
            }
            return null;
        },

        hasItem: function(itemName) {
            return girl.inventory.some(item => item.name === itemName);
        },

        draw: function(ctx) {
            if (this.isOpen) {
                // Inventory background
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
                for (let i = 0; i < girl.inventory.length; i++) {
                    const item = girl.inventory[i];
                    const x = 70 + (i % 3) * 90;
                    const y = 100 + Math.floor(i / 3) * 40;
                    
                    // Item slot
                    ctx.fillStyle = '#f0f0f0';
                    ctx.fillRect(x, y, 80, 30);
                    ctx.strokeStyle = '#ccc';
                    ctx.strokeRect(x, y, 80, 30);
                    
                    // Item
                    ctx.fillStyle = 'black';
                    ctx.fillText(`${item.icon} ${item.name}`, x + 5, y + 20);
                }
                
                // Empty slots
                for (let i = girl.inventory.length; i < girl.maxInventorySize; i++) {
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
            } else if (e.key === 'i' || e.key === 'I') {
                inventory.toggle();
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
                if (!tv.interact()) {
                    items.apple.interact();
                    items.cookie.interact();
                }
            } else if (game.currentScene === 'outdoor') {
                if (!friend.interact()) {
                    girl.interactWithChickens();
                }
            } else if (game.currentScene === 'kitchen') {
                kitchen.interact();
            } else if (game.currentScene === 'bathroom') {
                bathroom.interact();
            }
        }
    };

    // Debug system
    const debug = {
        logStatus: function() {
            console.log('=== GAME STATUS ===');
            console.log('Current Scene:', game.currentScene);
            console.log('Girl Position:', {x: girl.x, y: girl.y});
            console.log('Girl Stats:', {
                dirtiness: girl.dirtiness,
                needsBathroom: girl.needsBathroom,
                handsClean: girl.handsClean,
                carryingChicken: girl.carryingChicken
            });
            
            if (game.currentScene === 'kitchen') {
                console.log('Kitchen Stats:', {
                    carriedIngredient: kitchen.girl.carriedIngredient?.name || 'none',
                    bowlIngredients: kitchen.mixingBowl.ingredients,
                    bowlMixed: kitchen.mixingBowl.mixed,
                    waffleMaker: {
                        hasBatter: kitchen.waffleMaker.hasBatter,
                        cooking: kitchen.waffleMaker.cooking,
                        waffleReady: kitchen.waffleMaker.waffleReady
                    }
                });
            }
            
            if (game.currentScene === 'bathroom') {
                console.log('Bathroom Stats:', {
                    toiletPaperRolls: bathroom.toiletPaper.rolls,
                    bathtubHasWater: bathroom.bathtub.hasWater,
                    sinkHasWater: bathroom.sink.hasWater,
                    activities: {
                        peeing: bathroom.girl.peeing,
                        bathing: bathroom.girl.bathing,
                        washingHands: bathroom.girl.washingHands,
                        usingToiletPaper: bathroom.girl.usingToiletPaper
                    }
                });
            }
            
            if (game.currentScene === 'outdoor') {
                console.log('Outdoor Stats:', {
                    chickensCount: chickens.list.length,
                    orangesLeft: orangeTree.oranges.filter(o => !o.picked).length
                });
            }
        },

        setDirtiness: function(value) {
            girl.dirtiness = Math.max(0, Math.min(100, value));
            console.log(`Set dirtiness to ${girl.dirtiness}`);
        },

        setBathroomNeed: function(value) {
            girl.needsBathroom = Math.max(0, Math.min(100, value));
            console.log(`Set bathroom need to ${girl.needsBathroom}`);
        },

        setHandsClean: function(clean) {
            girl.handsClean = clean;
            console.log(`Set hands clean to ${girl.handsClean}`);
        },

        gotoScene: function(sceneName) {
            if (['indoor', 'outdoor', 'kitchen', 'bathroom'].includes(sceneName)) {
                game.currentScene = sceneName;
                girl.x = 100;
                girl.y = 300;
                console.log(`Moved to ${sceneName} scene`);
            } else {
                console.log('Invalid scene. Use: indoor, outdoor, kitchen, bathroom');
            }
        },

        teleport: function(x, y) {
            girl.x = x;
            girl.y = y;
            console.log(`Teleported girl to (${x}, ${y})`);
        },

        addToiletPaper: function(rolls = 3) {
            bathroom.toiletPaper.rolls += rolls;
            console.log(`Added ${rolls} toilet paper rolls. Total: ${bathroom.toiletPaper.rolls}`);
        },

        resetKitchen: function() {
            kitchen.init();
            console.log('Kitchen reset to initial state');
        },

        resetBathroom: function() {
            bathroom.init();
            console.log('Bathroom reset to initial state');
        },

        completeWaffle: function() {
            kitchen.mixingBowl.ingredients = ['Flour', 'Eggs', 'Milk', 'Sugar'];
            kitchen.mixingBowl.mixed = true;
            kitchen.waffleMaker.hasBatter = true;
            kitchen.waffleMaker.waffleReady = true;
            kitchen.waffleMaker.cooking = false;
            console.log('Waffle completed - ready to collect!');
        },

        getDirty: function() {
            girl.dirtiness = 80;
            girl.handsClean = false;
            console.log('Girl is now dirty and needs a bath!');
        },

        makeUrgent: function() {
            girl.needsBathroom = 95;
            console.log('Girl really needs to use the bathroom!');
        },

        showHelp: function() {
            console.log('=== DEBUG COMMANDS ===');
            console.log('debug.logStatus() - Show current game status');
            console.log('debug.setDirtiness(0-100) - Set cleanliness level');
            console.log('debug.setBathroomNeed(0-100) - Set bathroom urgency');
            console.log('debug.setHandsClean(true/false) - Set hand cleanliness');
            console.log('debug.gotoScene("sceneName") - Teleport to scene');
            console.log('debug.teleport(x, y) - Move girl to coordinates');
            console.log('debug.addToiletPaper(rolls) - Add toilet paper');
            console.log('debug.resetKitchen() - Reset kitchen state');
            console.log('debug.resetBathroom() - Reset bathroom state');
            console.log('debug.completeWaffle() - Instant waffle ready');
            console.log('debug.getDirty() - Make girl dirty');
            console.log('debug.makeUrgent() - Make bathroom urgent');
            console.log('debug.showHelp() - Show this help');
        }
    };

    // Make debug available globally
    window.debug = debug;

    // Auto-log status periodically in development
    setInterval(() => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Only auto-log on localhost
            console.log(`[${new Date().toLocaleTimeString()}] Scene: ${game.currentScene}, Girl: (${Math.round(girl.x)}, ${Math.round(girl.y)}), Dirty: ${Math.round(girl.dirtiness)}%, Bathroom: ${Math.round(girl.needsBathroom)}%`);
        }
    }, 10000); // Every 10 seconds

    // Initialize the game
    game.init();
    input.init();
    orangeTree.init();
    chickens.init();
    kitchen.init();
    bathroom.init();
    friend.init();

    // Show debug help on load
    console.log('=== JOJO GAME DEBUG SYSTEM ===');
    console.log('Type debug.showHelp() for available commands');
    console.log('Type debug.logStatus() to see current game state');
})();
