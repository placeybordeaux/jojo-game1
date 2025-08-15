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
            chickenCoop: { src: 'chicken_coop.png' },
            kitten: { src: 'kitten.png' }, // Optional: can fallback to programmatic
            mamaCat: { src: 'mama_cat.png' }, // Optional: can fallback to programmatic
            catFood: { src: 'cat_food.png' }, // Optional
            milk: { src: 'milk.png' }, // Optional
            ballToy: { src: 'ball_toy.png' }, // Optional
            featherToy: { src: 'feather_toy.png' }, // Optional
            cereal: { src: 'cereal.png' }, // Optional
            bowl: { src: 'bowl.png' }, // Optional
            spoon: { src: 'spoon.png' }, // Optional
            taxi: { src: 'taxi.png' }, // Optional
            airplane: { src: 'airplane.png' }, // Optional
            luggage: { src: 'luggage.png' }, // Optional
            airport: { src: 'airport.png' } // Optional
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
            const optionalImages = ['kitten', 'mamaCat', 'catFood', 'milk', 'ballToy', 'featherToy', 'cereal', 'bowl', 'spoon', 'taxi', 'airplane', 'luggage', 'airport'];
            
            for (let key in this.images) {
                this.images[key].img = new Image();
                this.images[key].loaded = false;
                
                this.images[key].img.onload = () => {
                    this.images[key].loaded = true;
                    this.imagesLoaded++;
                    if (this.imagesLoaded === this.totalImages) {
                        this.startGame();
                    }
                };
                
                this.images[key].img.onerror = () => {
                    if (optionalImages.includes(key)) {
                        // Optional image failed - use programmatic fallback
                        console.log(`Optional image '${key}' not found, using programmatic rendering`);
                        this.images[key].loaded = false;
                        this.imagesLoaded++;
                        if (this.imagesLoaded === this.totalImages) {
                            this.startGame();
                        }
                    } else {
                        // Required image failed
                        console.error(`Failed to load required image: ${key} (${this.images[key].src})`);
                        alert(`Error: Failed to load required image '${key}' (${this.images[key].src}). Please check if the file exists and the path is correct.`);
                    }
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
                garbageCan.checkTrashDisposal();  // Check trash disposal
                friend.update();
                taxi.update();
            } else if (this.currentScene === 'kitchen') {
                kitchen.update();
            } else if (this.currentScene === 'bathroom') {
                bathroom.update();
            } else if (this.currentScene === 'airport') {
                airport.update();
            } else if (this.currentScene === 'airplane') {
                airplane.update();
            } else if (destinations[this.currentScene] && destinations[this.currentScene].update) {
                destinations[this.currentScene].update();
            } else if (this.currentScene === 'indoor') {
                kitten.update();
                mamaCat.update();
                // Update cat items interaction
                for (let item in catItems) {
                    catItems[item].interact();
                }
                // Update trash interaction
                trash.interact();
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
                trash.draw(this.ctx);  // Draw trash items
                kitten.draw(this.ctx);  // Draw the kitten
                mamaCat.draw(this.ctx);  // Draw mama cat
                // Draw cat items
                for (let item in catItems) {
                    catItems[item].draw(this.ctx);
                }
            } else if (this.currentScene === 'outdoor') {
                this.ctx.drawImage(this.images.outdoorBackground.img, 0, 0, this.canvas.width, this.canvas.height);
                orangeTree.draw(this.ctx);
                chickens.draw(this.ctx);
                chickenCoop.draw(this.ctx);
                garbageCan.draw(this.ctx);  // Draw garbage can
                friend.draw(this.ctx);
                taxi.draw(this.ctx);
                houseEntrance.draw(this.ctx);
            } else if (this.currentScene === 'kitchen') {
                kitchen.draw(this.ctx);
            } else if (this.currentScene === 'bathroom') {
                bathroom.draw(this.ctx);
            } else if (this.currentScene === 'airport') {
                airport.draw(this.ctx);
            } else if (this.currentScene === 'airplane') {
                airplane.draw(this.ctx);
            } else if (destinations[this.currentScene]) {
                destinations[this.currentScene].draw(this.ctx);
            }
            girl.draw(this.ctx);
            speechBubble.draw(this.ctx);
            inventory.updateHTML();  // Update HTML sidebar
            inventory.draw(this.ctx);         // Full overlay when open
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
            } else if (this.currentScene === 'outdoor' && girl.x <= -5) {
                this.currentScene = 'indoor';
                girl.x = door.x - girl.width - 10;  // Position near the door
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
            } else if (this.currentScene === 'kitchen' && girl.x <= -5) {
                this.currentScene = 'indoor';
                girl.x = kitchenDoor.x + kitchenDoor.width + 5;
                girl.y = kitchenDoor.y + 20;
            } else if (this.currentScene === 'bathroom' && girl.x <= -5) {
                this.currentScene = 'indoor';
                girl.x = bathroomDoor.x + bathroomDoor.width + 5;
                girl.y = bathroomDoor.y + 20;
            }
        },

        updateHygiene: function() {
            // Slowly increase bathroom needs over time
            if (girl.needsBathroom < 100) {
                girl.needsBathroom += 0.02; // Takes about 5 minutes to get urgent
            }
            if (girl.needsPoop < 100) {
                girl.needsPoop += 0.01; // Takes about 10 minutes to get urgent
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
            // Door frame
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Door panels
            ctx.fillStyle = '#D2691E';
            ctx.fillRect(this.x + 5, this.y + 10, this.width - 10, this.height - 20);
            
            // Door handle
            ctx.fillStyle = 'gold';
            ctx.beginPath();
            ctx.arc(this.x + this.width - 15, this.y + this.height/2, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Door label
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🚪 OUTSIDE', this.x + this.width/2, this.y - 5);
            
            // Interaction hint when nearby
            if (Math.abs(girl.x - this.x) < 100 && Math.abs(girl.y - this.y) < 100) {
                ctx.fillStyle = 'yellow';
                ctx.font = '12px Arial';
                ctx.fillText('Press SPACE', this.x + this.width/2, this.y - 20);
            }
        }
    };

    const kitchenDoor = {
        x: 50,
        y: 280,
        width: 60,
        height: 120,
        
        draw: function(ctx) {
            // Door frame
            ctx.fillStyle = '#228B22';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Door panels
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(this.x + 5, this.y + 10, this.width - 10, this.height - 20);
            
            // Door handle
            ctx.fillStyle = 'silver';
            ctx.beginPath();
            ctx.arc(this.x + this.width - 15, this.y + this.height/2, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Door label
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🍳 KITCHEN', this.x + this.width/2, this.y - 5);
            
            // Interaction hint when nearby
            if (Math.abs(girl.x - this.x) < 100 && Math.abs(girl.y - this.y) < 100) {
                ctx.fillStyle = 'yellow';
                ctx.font = '12px Arial';
                ctx.fillText('Press SPACE', this.x + this.width/2, this.y - 20);
            }
        }
    };

    const bathroomDoor = {
        x: 300,
        y: 280,
        width: 60,
        height: 120,
        
        draw: function(ctx) {
            // Door frame
            ctx.fillStyle = '#4169E1';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Door panels
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(this.x + 5, this.y + 10, this.width - 10, this.height - 20);
            
            // Door handle
            ctx.fillStyle = 'chrome';
            ctx.beginPath();
            ctx.arc(this.x + this.width - 15, this.y + this.height/2, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Door label
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🚿 BATHROOM', this.x + this.width/2, this.y - 5);
            
            // Interaction hint when nearby
            if (Math.abs(girl.x - this.x) < 100 && Math.abs(girl.y - this.y) < 100) {
                ctx.fillStyle = 'yellow';
                ctx.font = '12px Arial';
                ctx.fillText('Press SPACE', this.x + this.width/2, this.y - 20);
            }
        }
    };

    const houseEntrance = {
        x: 10,
        y: 280,
        width: 80,
        height: 120,
        
        draw: function(ctx) {
            // House entrance (left side of outdoor scene)
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Door panel
            ctx.fillStyle = '#D2691E';
            ctx.fillRect(this.x + 10, this.y + 10, this.width - 20, this.height - 20);
            
            // Door handle
            ctx.fillStyle = 'gold';
            ctx.beginPath();
            ctx.arc(this.x + this.width - 20, this.y + this.height/2, 4, 0, 2 * Math.PI);
            ctx.fill();
            
            // House entrance label
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🏠 HOUSE', this.x + this.width/2, this.y - 5);
            
            // Interaction hint when nearby
            if (girl.x < this.x + this.width + 30 && girl.y > this.y - 30) {
                ctx.fillStyle = 'yellow';
                ctx.font = '10px Arial';
                ctx.fillText('← Walk left to enter', this.x + this.width/2, this.y - 20);
                ctx.fillText('or press SPACE', this.x + this.width/2, this.y - 10);
            }
        },
        
        interact: function() {
            // Check if girl is near the entrance and space is pressed
            if (girl.x < this.x + this.width + 20 &&
                girl.x + girl.width > this.x - 10 &&
                girl.y < this.y + this.height &&
                girl.y + girl.height > this.y &&
                input.spacePressed) {
                game.currentScene = 'indoor';
                girl.x = door.x - girl.width - 10;
                girl.y = door.y + 20;
                input.spacePressed = false;
                return true;
            }
            return false;
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
        carryingLuggage: null,
        dirtiness: 0, // 0-100, 100 being very dirty
        needsBathroom: 0, // 0-100, 100 being urgent for pee
        needsPoop: 0, // 0-100, 100 being urgent for poop
        handsClean: true,
        inventory: [], // Array of items: {name: 'Apple', type: 'food', icon: '🍎'}
        maxInventorySize: 6,
        heldItem: null, // Item currently in hand: {name: 'Apple', type: 'food', icon: '🍎'}
        
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
            
            // Draw carried luggage
            if (this.carryingLuggage) {
                const bag = this.carryingLuggage;
                const bagX = this.x - 10;
                const bagY = this.y + this.height - bag.height - 10;
                
                if (game.images.luggage && game.images.luggage.loaded) {
                    ctx.drawImage(game.images.luggage.img, bagX, bagY, bag.width * 0.8, bag.height * 0.8);
                } else {
                    // Draw programmatic luggage
                    ctx.fillStyle = bag.color;
                    ctx.fillRect(bagX, bagY, bag.width * 0.8, bag.height * 0.8);
                    ctx.strokeStyle = '#333';
                    ctx.strokeRect(bagX, bagY, bag.width * 0.8, bag.height * 0.8);
                    
                    // Handle
                    ctx.strokeStyle = '#666';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(bagX + 3, bagY);
                    ctx.lineTo(bagX + bag.width * 0.8 - 3, bagY);
                    ctx.stroke();
                }
            }
            
            // Draw held item next to girl
            if (this.heldItem) {
                const itemX = this.x + this.width + 5;
                const itemY = this.y + 10;
                const itemSize = 25;
                
                // Item background
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(itemX, itemY, itemSize, itemSize);
                ctx.strokeStyle = '#666';
                ctx.lineWidth = 1;
                ctx.strokeRect(itemX, itemY, itemSize, itemSize);
                
                // Item emoji
                ctx.font = '18px Arial';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'black';
                ctx.fillText(this.heldItem.icon, itemX + itemSize/2, itemY + itemSize/2 + 6);
                
                // Item name below
                ctx.font = '8px Arial';
                ctx.fillText(this.heldItem.name, itemX + itemSize/2, itemY + itemSize + 10);
            }
        },

        interactWithChickens: function() {
            if (!this.carryingChicken) {
                // Try to pick up a chicken
                chickens.list.forEach(chicken => {
                    if (!chicken.carried &&
                        this.x < chicken.x + chicken.width &&
                        this.x + this.width > chicken.x &&
                        this.y < chicken.y + chicken.height &&
                        this.y + this.height > chicken.y) {
                        chicken.carried = true;
                        this.carryingChicken = true;
                        speechBubble.show('Picked up chicken! Take it to the coop!');
                    }
                });
            } else {
                // Already carrying - can only drop at coop or if really needed
                speechBubble.show('Take the chicken to the coop first!');
            }
        },
        
        dropChicken: function() {
            // Force drop chicken (for emergencies)
            if (this.carryingChicken) {
                chickens.list.forEach(chicken => {
                    if (chicken.carried) {
                        chicken.carried = false;
                        this.carryingChicken = false;
                        chicken.x = this.x + 30; // Drop next to girl
                        chicken.y = this.y;
                        speechBubble.show('Dropped chicken!');
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
                    handInventory.pickupItem(orangeItem);
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
                } else {
                    // Draw carried chicken above the girl
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
            
            // Show how many chickens are inside
            if (this.chickensInside > 0) {
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.strokeText(`🐔 ${this.chickensInside}`, this.x + this.width/2, this.y - 10);
                ctx.fillText(`🐔 ${this.chickensInside}`, this.x + this.width/2, this.y - 10);
            }
            
            // Show interaction hint when nearby and carrying a chicken
            if (girl.carryingChicken &&
                girl.x < this.x + this.width + 40 &&
                girl.x + girl.width > this.x - 40 &&
                girl.y < this.y + this.height + 40 &&
                girl.y + girl.height > this.y - 40) {
                ctx.fillStyle = 'yellow';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Walk close to deliver chicken!', this.x + this.width/2, this.y + this.height + 20);
            }
        },

        checkChickenDelivery: function() {
            if (girl.carryingChicken &&
                girl.x < this.x + this.width + 20 &&
                girl.x + girl.width > this.x - 20 &&
                girl.y < this.y + this.height + 20 &&
                girl.y + girl.height > this.y - 20) {
                
                // Find the carried chicken
                chickens.list.forEach(chicken => {
                    if (chicken.carried) {
                        chicken.carried = false;
                        girl.carryingChicken = false;
                        this.chickensInside++;
                        chicken.x = -100;  // Move chicken off-screen
                        chicken.y = -100;
                        speechBubble.show(`Chicken safely in coop! (${this.chickensInside} total)`);
                        this.showHearts();
                    }
                });
            }
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
                    const appleItem = {name: 'Apple', type: 'food', icon: '🍎'};
                    handInventory.pickupItem(appleItem);
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
                    const cookieItem = {name: 'Cookie', type: 'food', icon: '🍪'};
                    handInventory.pickupItem(cookieItem);
                }
            }
        }
    };

    const kitten = {
        x: 150,
        y: 200,
        width: 40,
        height: 30,
        happiness: 50,
        hunger: 30,
        lastMeow: 0,
        isPlaying: false,
        playingWithToy: null,
        speed: 0.5,
        direction: Math.random() * Math.PI * 2,
        lastDirectionChange: 0,
        isMoving: true,
        restTime: 0,
        isResting: false,
        
        draw: function(ctx) {
            // Try to use image first, fallback to programmatic drawing
            if (game.images.kitten && game.images.kitten.loaded) {
                ctx.drawImage(game.images.kitten.img, this.x, this.y, this.width, this.height);
            } else {
                // Programmatic drawing fallback
                this.drawProgrammatic(ctx);
            }
            
            // Always draw status bars and effects
            this.drawStatusBars(ctx);
            
            // Show playing animation if playing with toy
            if (this.isPlaying && this.playingWithToy) {
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'gold';
                ctx.fillText('✨', this.x - 10, this.y);
                ctx.fillText('✨', this.x + this.width + 10, this.y);
            }
        },
        
        drawProgrammatic: function(ctx) {
            const centerX = this.x + this.width/2;
            const centerY = this.y + this.height/2;
            
            // Draw kitten with better proportions
            ctx.fillStyle = '#FFA500'; // Orange tabby
            
            // Main body (oval, lying down cat pose)
            ctx.beginPath();
            ctx.ellipse(centerX, centerY + 5, 16, 10, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Chest (smaller oval)
            ctx.beginPath();
            ctx.ellipse(centerX - 2, centerY, 10, 8, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Head (round but slightly oval)
            ctx.beginPath();
            ctx.ellipse(centerX - 8, centerY - 8, 8, 7, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Ears (pointed triangles)
            ctx.fillStyle = '#FF8C00'; // Darker orange
            ctx.beginPath();
            ctx.moveTo(centerX - 12, centerY - 12);
            ctx.lineTo(centerX - 8, centerY - 18);
            ctx.lineTo(centerX - 4, centerY - 12);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(centerX - 8, centerY - 12);
            ctx.lineTo(centerX - 4, centerY - 18);
            ctx.lineTo(centerX, centerY - 12);
            ctx.fill();
            
            // Inner ears (pink)
            ctx.fillStyle = '#FFB6C1';
            ctx.beginPath();
            ctx.moveTo(centerX - 11, centerY - 13);
            ctx.lineTo(centerX - 8, centerY - 16);
            ctx.lineTo(centerX - 6, centerY - 13);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(centerX - 7, centerY - 13);
            ctx.lineTo(centerX - 4, centerY - 16);
            ctx.lineTo(centerX - 1, centerY - 13);
            ctx.fill();
            
            // Legs (small ovals)
            ctx.fillStyle = '#FFA500';
            // Front legs
            ctx.beginPath();
            ctx.ellipse(centerX - 6, centerY + 8, 3, 6, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 2, centerY + 8, 3, 6, 0, 0, 2 * Math.PI);
            ctx.fill();
            // Back legs (partially hidden)
            ctx.beginPath();
            ctx.ellipse(centerX + 8, centerY + 6, 3, 5, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Paws (small dark circles)
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.arc(centerX - 6, centerY + 12, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + 2, centerY + 12, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + 8, centerY + 9, 2, 0, 2 * Math.PI);
            ctx.fill();
            
            // Tail (curved)
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(centerX + 14, centerY + 2);
            ctx.quadraticCurveTo(centerX + 20, centerY - 5, centerX + 15, centerY - 12);
            ctx.stroke();
            
            // Tabby stripes
            ctx.strokeStyle = '#FF8C00';
            ctx.lineWidth = 2;
            // Body stripes
            ctx.beginPath();
            ctx.moveTo(centerX - 10, centerY - 2);
            ctx.lineTo(centerX + 10, centerY + 3);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(centerX - 8, centerY + 3);
            ctx.lineTo(centerX + 12, centerY + 8);
            ctx.stroke();
            
            // Face features
            // Eyes
            ctx.fillStyle = '#90EE90'; // Light green eyes
            if (this.isPlaying) {
                // Happy closed eyes
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(centerX - 11, centerY - 10, 2, 0, Math.PI);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(centerX - 5, centerY - 10, 2, 0, Math.PI);
                ctx.stroke();
            } else if (this.happiness < 30) {
                // Sad droopy eyes
                ctx.beginPath();
                ctx.ellipse(centerX - 11, centerY - 10, 2, 1.5, 0.3, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(centerX - 5, centerY - 10, 2, 1.5, -0.3, 0, 2 * Math.PI);
                ctx.fill();
            } else {
                // Normal alert eyes
                ctx.beginPath();
                ctx.ellipse(centerX - 11, centerY - 10, 2, 2.5, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(centerX - 5, centerY - 10, 2, 2.5, 0, 0, 2 * Math.PI);
                ctx.fill();
                
                // Pupils (vertical slits)
                ctx.fillStyle = 'black';
                ctx.fillRect(centerX - 11.5, centerY - 11, 1, 3);
                ctx.fillRect(centerX - 5.5, centerY - 11, 1, 3);
            }
            
            // Nose (pink triangle)
            ctx.fillStyle = '#FFB6C1';
            ctx.beginPath();
            ctx.moveTo(centerX - 8, centerY - 6);
            ctx.lineTo(centerX - 9, centerY - 4);
            ctx.lineTo(centerX - 7, centerY - 4);
            ctx.fill();
            
            // Mouth (W shape)
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(centerX - 9, centerY - 4);
            ctx.lineTo(centerX - 8, centerY - 3);
            ctx.lineTo(centerX - 7, centerY - 4);
            ctx.stroke();
            
            // Whiskers (longer and more realistic)
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            // Left whiskers
            ctx.beginPath();
            ctx.moveTo(centerX - 15, centerY - 8);
            ctx.lineTo(centerX - 10, centerY - 7);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(centerX - 15, centerY - 6);
            ctx.lineTo(centerX - 10, centerY - 5);
            ctx.stroke();
            // Right whiskers
            ctx.beginPath();
            ctx.moveTo(centerX - 6, centerY - 7);
            ctx.lineTo(centerX - 1, centerY - 8);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(centerX - 6, centerY - 5);
            ctx.lineTo(centerX - 1, centerY - 6);
            ctx.stroke();
        },
        
        drawStatusBars: function(ctx) {
            const barWidth = 30;
            const barHeight = 4;
            const barY = this.y - 15;
            
            // Happiness bar (green)
            ctx.fillStyle = 'lightgray';
            ctx.fillRect(this.x + 5, barY, barWidth, barHeight);
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(this.x + 5, barY, (this.happiness / 100) * barWidth, barHeight);
            
            // Hunger bar (orange)
            ctx.fillStyle = 'lightgray';
            ctx.fillRect(this.x + 5, barY - 8, barWidth, barHeight);
            ctx.fillStyle = '#FF9800';
            ctx.fillRect(this.x + 5, barY - 8, (this.hunger / 100) * barWidth, barHeight);
        },
        
        update: function() {
            // Movement behavior
            this.updateMovement();
            
            // Slowly decrease happiness and increase hunger over time
            if (Date.now() % 100 === 0) { // Every 100ms
                this.happiness = Math.max(0, this.happiness - 0.1);
                this.hunger = Math.min(100, this.hunger + 0.05);
            }
            
            // Random meowing
            if (Date.now() - this.lastMeow > 8000 + Math.random() * 10000) {
                const meows = ['Meow!', 'Mew!', 'Purr~', 'Mrow!'];
                speechBubble.showForKitten(meows[Math.floor(Math.random() * meows.length)]);
                this.lastMeow = Date.now();
            }
            
            // Stop playing after a while
            if (this.isPlaying && Date.now() - this.playStartTime > 3000) {
                this.isPlaying = false;
                this.playingWithToy = null;
                this.isMoving = true; // Start moving again after playing
            }
            
            this.checkInteraction();
        },
        
        updateMovement: function() {
            // Don't move if playing with toy
            if (this.isPlaying) {
                return;
            }
            
            const now = Date.now();
            
            // Handle resting behavior
            if (this.isResting) {
                if (now - this.restTime > 2000 + Math.random() * 3000) { // Rest 2-5 seconds
                    this.isResting = false;
                    this.isMoving = true;
                    this.direction = Math.random() * Math.PI * 2; // New random direction
                }
                return;
            }
            
            // Move around if not resting
            if (this.isMoving) {
                // Change direction occasionally
                if (now - this.lastDirectionChange > 3000 + Math.random() * 4000) {
                    this.direction = Math.random() * Math.PI * 2;
                    this.lastDirectionChange = now;
                    
                    // Sometimes stop to rest
                    if (Math.random() < 0.3) {
                        this.isMoving = false;
                        this.isResting = true;
                        this.restTime = now;
                        return;
                    }
                }
                
                // Calculate movement
                const newX = this.x + Math.cos(this.direction) * this.speed;
                const newY = this.y + Math.sin(this.direction) * this.speed;
                
                // Bounce off walls
                if (newX < 10 || newX > game.canvas.width - this.width - 10) {
                    this.direction = Math.PI - this.direction; // Reflect horizontally
                } else if (newY < 50 || newY > game.canvas.height - this.height - 10) {
                    this.direction = -this.direction; // Reflect vertically
                } else {
                    this.x = newX;
                    this.y = newY;
                }
            }
        },
        
        checkInteraction: function() {
            if (girl.x < this.x + this.width + 20 &&
                girl.x + girl.width > this.x - 20 &&
                girl.y < this.y + this.height + 20 &&
                girl.y + girl.height > this.y - 20) {
                
                // Check if girl has cat food or milk
                if (girl.heldItem) {
                    if (girl.heldItem.name === 'Cat Food') {
                        this.feed();
                        girl.heldItem = null;
                    } else if (girl.heldItem.name === 'Milk') {
                        this.giveMilk();
                        girl.heldItem = null;
                    } else if (girl.heldItem.type === 'cat_toy') {
                        this.playWith(girl.heldItem);
                    }
                }
            }
        },
        
        feed: function() {
            this.hunger = Math.max(0, this.hunger - 40);
            this.happiness = Math.min(100, this.happiness + 20);
            speechBubble.showForKitten('Nom nom! Purr~ 😸');
        },
        
        giveMilk: function() {
            this.hunger = Math.max(0, this.hunger - 20);
            this.happiness = Math.min(100, this.happiness + 15);
            speechBubble.showForKitten('Lap lap! Mew~ 🥛');
        },
        
        playWith: function(toy) {
            this.happiness = Math.min(100, this.happiness + 30);
            this.isPlaying = true;
            this.playingWithToy = toy;
            this.playStartTime = Date.now();
            speechBubble.showForKitten(`Playing with ${toy.icon}! Purr purr!`);
        }
    };

    const mamaCat = {
        x: -100, // Starts off-screen
        y: 150,
        width: 55,
        height: 40,
        speed: 0.8,
        isVisiting: false,
        isLeaving: false,
        groomingKitten: false,
        groomStartTime: 0,
        groomDuration: 4000, // 4 seconds
        nextVisitTime: 8000, // 8 seconds until first visit
        visitDuration: 0,
        maxVisitTime: 12000, // 12 seconds max visit
        lastMeow: 0,
        
        update: function() {
            if (this.isLeaving) {
                this.updateLeaving();
                return;
            }
            
            if (!this.isVisiting) {
                // Check if it's time for mama to visit
                this.nextVisitTime -= 16; // Assuming 60fps
                if (this.nextVisitTime <= 0) {
                    this.startVisit();
                }
            } else {
                this.visitDuration += 16;
                
                if (!this.groomingKitten) {
                    // Move towards kitten
                    const targetX = kitten.x - 25;
                    const targetY = kitten.y + 5;
                    
                    if (Math.abs(this.x - targetX) > 8) {
                        this.x += (targetX > this.x) ? this.speed : -this.speed;
                    }
                    if (Math.abs(this.y - targetY) > 8) {
                        this.y += (targetY > this.y) ? this.speed : -this.speed;
                    }
                    
                    // Start grooming if close enough or after some time
                    if ((Math.abs(this.x - targetX) <= 8 && Math.abs(this.y - targetY) <= 8) ||
                        this.visitDuration > 5000) { // Start grooming after 5 seconds even if not perfectly positioned
                        this.startGrooming();
                    }
                } else {
                    // Grooming behavior
                    if (Date.now() - this.groomStartTime > this.groomDuration) {
                        this.stopGrooming();
                    }
                }
                
                // Random mama cat meowing
                if (Date.now() - this.lastMeow > 6000 + Math.random() * 8000) {
                    const mamaVocalizations = ['Mrrow', 'Purr purr~', 'Mrow mrow', 'Come here baby~'];
                    speechBubble.showForMamaCat(mamaVocalizations[Math.floor(Math.random() * mamaVocalizations.length)]);
                    this.lastMeow = Date.now();
                }
                
                // End visit if time is up
                if (this.visitDuration > this.maxVisitTime) {
                    this.endVisit();
                }
            }
        },
        
        startVisit: function() {
            this.isVisiting = true;
            this.visitDuration = 0;
            this.x = game.canvas.width + 50; // Start from right side
            this.y = 150 + Math.random() * 100; // Random Y position
            speechBubble.showForMamaCat('Time to check on my baby~');
        },
        
        startGrooming: function() {
            this.groomingKitten = true;
            this.groomStartTime = Date.now();
            kitten.isMoving = false; // Stop kitten movement during grooming
            kitten.isResting = true;
            speechBubble.showForMamaCat('*lick lick* Clean baby!');
            
            // Increase kitten happiness
            kitten.happiness = Math.min(100, kitten.happiness + 20);
        },
        
        stopGrooming: function() {
            this.groomingKitten = false;
            kitten.isResting = false; // Allow kitten to move again
            speechBubble.showForMamaCat('All clean now sweetie!');
        },
        
        endVisit: function() {
            this.isVisiting = false;
            this.groomingKitten = false;
            this.visitDuration = 0;
            this.isLeaving = true; // New state for walking away
            this.nextVisitTime = 10000 + Math.random() * 15000; // 10-25 seconds until next visit
            kitten.isResting = false; // Make sure kitten can move
            speechBubble.showForMamaCat('Bye sweetie! Be good!');
        },
        
        updateLeaving: function() {
            // Walk off-screen to the left
            this.x -= this.speed * 1.5; // Walk away faster
            if (this.x < -100) {
                this.isLeaving = false;
            }
        },
        
        draw: function(ctx) {
            if (!this.isVisiting && !this.isLeaving) return;
            
            // Try to use image first, fallback to programmatic drawing
            if (game.images.mamaCat && game.images.mamaCat.loaded) {
                ctx.drawImage(game.images.mamaCat.img, this.x, this.y, this.width, this.height);
            } else {
                this.drawProgrammatic(ctx);
            }
            
            // Show grooming animation
            if (this.groomingKitten) {
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'pink';
                // Animated hearts
                const heartOffset = Math.sin(Date.now() / 300) * 3;
                ctx.fillText('💕', this.x + this.width/2, this.y - 10 + heartOffset);
                ctx.fillText('💕', kitten.x + kitten.width/2, kitten.y - 5 - heartOffset);
            }
        },
        
        drawProgrammatic: function(ctx) {
            const centerX = this.x + this.width/2;
            const centerY = this.y + this.height/2;
            
            // Draw mama cat - larger and more mature looking
            ctx.fillStyle = '#8B7355'; // Brown/grey mama cat
            
            // Main body (larger oval)
            ctx.beginPath();
            ctx.ellipse(centerX, centerY + 5, 22, 14, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Chest
            ctx.beginPath();
            ctx.ellipse(centerX - 5, centerY, 14, 10, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Head (larger)
            ctx.beginPath();
            ctx.ellipse(centerX - 12, centerY - 8, 10, 9, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Ears
            ctx.fillStyle = '#654321'; // Darker brown
            ctx.beginPath();
            ctx.moveTo(centerX - 18, centerY - 14);
            ctx.lineTo(centerX - 12, centerY - 22);
            ctx.lineTo(centerX - 6, centerY - 14);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(centerX - 10, centerY - 14);
            ctx.lineTo(centerX - 4, centerY - 22);
            ctx.lineTo(centerX + 2, centerY - 14);
            ctx.fill();
            
            // Inner ears
            ctx.fillStyle = '#FFB6C1';
            ctx.beginPath();
            ctx.moveTo(centerX - 16, centerY - 15);
            ctx.lineTo(centerX - 12, centerY - 19);
            ctx.lineTo(centerX - 8, centerY - 15);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(centerX - 8, centerY - 15);
            ctx.lineTo(centerX - 4, centerY - 19);
            ctx.lineTo(centerX, centerY - 15);
            ctx.fill();
            
            // Legs
            ctx.fillStyle = '#8B7355';
            ctx.beginPath();
            ctx.ellipse(centerX - 8, centerY + 12, 4, 8, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 4, centerY + 12, 4, 8, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + 12, centerY + 8, 4, 7, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Paws
            ctx.fillStyle = '#654321';
            ctx.beginPath();
            ctx.arc(centerX - 8, centerY + 18, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + 4, centerY + 18, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + 12, centerY + 13, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Tail (elegant curve)
            ctx.strokeStyle = '#8B7355';
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(centerX + 20, centerY);
            ctx.quadraticCurveTo(centerX + 30, centerY - 10, centerX + 25, centerY - 20);
            ctx.stroke();
            
            // Stripes
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX - 15, centerY - 3);
            ctx.lineTo(centerX + 15, centerY + 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(centerX - 12, centerY + 5);
            ctx.lineTo(centerX + 18, centerY + 10);
            ctx.stroke();
            
            // Eyes (wise and motherly)
            ctx.fillStyle = '#228B22'; // Green eyes
            ctx.beginPath();
            ctx.ellipse(centerX - 15, centerY - 10, 3, 3, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX - 9, centerY - 10, 3, 3, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            // Pupils
            ctx.fillStyle = 'black';
            ctx.fillRect(centerX - 16, centerY - 11, 1, 2);
            ctx.fillRect(centerX - 10, centerY - 11, 1, 2);
            
            // Nose
            ctx.fillStyle = '#FFB6C1';
            ctx.beginPath();
            ctx.moveTo(centerX - 12, centerY - 6);
            ctx.lineTo(centerX - 13, centerY - 4);
            ctx.lineTo(centerX - 11, centerY - 4);
            ctx.fill();
            
            // Mouth
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(centerX - 13, centerY - 4);
            ctx.lineTo(centerX - 12, centerY - 3);
            ctx.lineTo(centerX - 11, centerY - 4);
            ctx.stroke();
            
            // Whiskers
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            // Left whiskers
            ctx.beginPath();
            ctx.moveTo(centerX - 20, centerY - 8);
            ctx.lineTo(centerX - 14, centerY - 7);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(centerX - 20, centerY - 6);
            ctx.lineTo(centerX - 14, centerY - 5);
            ctx.stroke();
            // Right whiskers
            ctx.beginPath();
            ctx.moveTo(centerX - 10, centerY - 7);
            ctx.lineTo(centerX - 4, centerY - 8);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(centerX - 10, centerY - 5);
            ctx.lineTo(centerX - 4, centerY - 6);
            ctx.stroke();
        }
    };

    const trash = {
        items: [
            { name: 'Empty Bottle', x: 400, y: 200, width: 20, height: 30, collected: false, icon: '🍼', smell: 'medium' },
            { name: 'Banana Peel', x: 250, y: 350, width: 25, height: 15, collected: false, icon: '🍌', smell: 'high' },
            { name: 'Tissue', x: 150, y: 250, width: 15, height: 15, collected: false, icon: '🧻', smell: 'low' },
            { name: 'Apple Core', x: 500, y: 300, width: 18, height: 20, collected: false, icon: '🍎', smell: 'medium' },
            { name: 'Pizza Box', x: 350, y: 150, width: 40, height: 30, collected: false, icon: '📦', smell: 'high' }
        ],
        
        draw: function(ctx) {
            this.items.forEach(item => {
                if (!item.collected) {
                    ctx.font = '20px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(item.icon, item.x + item.width/2, item.y + item.height);
                    
                    // Draw small label
                    ctx.font = '8px Arial';
                    ctx.fillStyle = '#666';
                    ctx.fillText(item.name, item.x + item.width/2, item.y - 5);
                    ctx.fillStyle = 'black';
                }
            });
        },
        
        interact: function() {
            this.items.forEach(item => {
                if (!item.collected &&
                    girl.x < item.x + item.width + 10 &&
                    girl.x + girl.width > item.x - 10 &&
                    girl.y < item.y + item.height + 10 &&
                    girl.y + girl.height > item.y - 10) {
                    
                    item.collected = true;
                    const trashItem = {
                        name: item.name,
                        type: 'trash',
                        icon: item.icon,
                        smell: item.smell
                    };
                    
                    // Add smell reactions
                    if (item.smell === 'high') {
                        speechBubble.show(`Eww! This ${item.name} stinks! 🤢`);
                    } else if (item.smell === 'medium') {
                        speechBubble.show(`Ugh, this ${item.name} smells! 😷`);
                    } else {
                        speechBubble.show(`Picked up ${item.name}`);
                    }
                    
                    handInventory.pickupItem(trashItem);
                }
            });
        }
    };

    const garbageCan = {
        x: 500,
        y: 200,
        width: 60,
        height: 80,
        
        draw: function(ctx) {
            // Draw garbage can
            ctx.fillStyle = '#444';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Lid
            ctx.fillStyle = '#666';
            ctx.fillRect(this.x - 5, this.y - 10, this.width + 10, 15);
            
            // Handle
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y - 5, 8, Math.PI, 0);
            ctx.stroke();
            
            // Garbage can label
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🗑️ TRASH', this.x + this.width/2, this.y + this.height + 15);
            
            // Interaction hint when nearby with trash
            if (this.hasTrashInHand() &&
                girl.x < this.x + this.width + 30 &&
                girl.x + girl.width > this.x - 30 &&
                girl.y < this.y + this.height + 30 &&
                girl.y + girl.height > this.y - 30) {
                ctx.fillStyle = 'yellow';
                ctx.font = '10px Arial';
                ctx.fillText('Walk close to throw away trash!', this.x + this.width/2, this.y - 20);
            }
        },
        
        hasTrashInHand: function() {
            return girl.heldItem && girl.heldItem.type === 'trash';
        },
        
        checkTrashDisposal: function() {
            if (this.hasTrashInHand() &&
                girl.x < this.x + this.width + 20 &&
                girl.x + girl.width > this.x - 20 &&
                girl.y < this.y + this.height + 20 &&
                girl.y + girl.height > this.y - 20) {
                
                const trashItem = girl.heldItem;
                girl.heldItem = null;
                
                // Smell reactions when throwing away
                const reactions = {
                    high: ['Yuck! That smells awful! 🤮', 'So gross! 🤢', 'Ew, so stinky! 😷'],
                    medium: ['Ugh, smells bad! 😷', 'Not pleasant at all! 🙄', 'Glad to get rid of that!'],
                    low: ['Good, all clean now!', 'Much better!', 'Trash disposed properly! ♻️']
                };
                
                const reactionList = reactions[trashItem.smell] || reactions.low;
                const reaction = reactionList[Math.floor(Math.random() * reactionList.length)];
                speechBubble.show(reaction);
                
                // Show disposal animation
                this.showDisposalAnimation();
            }
        },
        
        showDisposalAnimation: function() {
            // Simple animation - show some sparkles
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    // This would need to be integrated with the game loop for proper animation
                    // For now, just the speech bubble provides feedback
                }, i * 200);
            }
        }
    };

    const taxi = {
        x: 600,
        y: 300,
        width: 100,
        height: 60,
        called: false,
        arrived: false,
        arrivalTimer: 0,
        
        draw: function(ctx) {
            if (!this.called) {
                // Draw taxi call button/sign
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(this.x, this.y, 80, 40);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x, this.y, 80, 40);
                
                ctx.fillStyle = 'black';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('CALL TAXI', this.x + 40, this.y + 25);
            } else if (this.arrived) {
                // Draw the taxi - try image first, then programmatic
                if (game.images.taxi && game.images.taxi.loaded) {
                    ctx.drawImage(game.images.taxi.img, this.x - 20, this.y - 20, this.width, this.height);
                } else {
                    // Draw programmatic taxi
                    // Car body
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(this.x - 20, this.y - 10, this.width, this.height - 20);
                    
                    // Roof
                    ctx.fillStyle = '#FFA500';
                    ctx.fillRect(this.x, this.y - 20, this.width - 40, 20);
                    
                    // Windows
                    ctx.fillStyle = '#87CEEB';
                    ctx.fillRect(this.x + 5, this.y - 15, 25, 15);
                    ctx.fillRect(this.x + 35, this.y - 15, 25, 15);
                    
                    // Wheels
                    ctx.fillStyle = '#333';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y + 30, 8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(this.x + 60, this.y + 30, 8, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // TAXI sign
                    ctx.fillStyle = 'black';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('TAXI', this.x + 30, this.y + 5);
                }
                
                // Show interaction hint
                if (girl.x < this.x + this.width + 30 &&
                    girl.x + girl.width > this.x - 30 &&
                    girl.y < this.y + this.height + 30 &&
                    girl.y + girl.height > this.y - 30) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.fillRect(this.x - 10, this.y - 40, 120, 20);
                    ctx.fillStyle = 'black';
                    ctx.font = '10px Arial';
                    ctx.fillText('Press SPACE to enter', this.x + 50, this.y - 27);
                }
            } else {
                // Taxi is on the way
                ctx.fillStyle = 'white';
                ctx.fillRect(this.x - 10, this.y - 10, 100, 30);
                ctx.fillStyle = 'black';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                const dots = '.'.repeat((Math.floor(this.arrivalTimer / 30) % 3) + 1);
                ctx.fillText(`Taxi arriving${dots}`, this.x + 40, this.y + 5);
            }
        },
        
        update: function() {
            if (this.called && !this.arrived) {
                this.arrivalTimer++;
                if (this.arrivalTimer >= 180) { // 3 seconds at 60fps
                    this.arrived = true;
                    speechBubble.show('Taxi has arrived! Press SPACE to get in.');
                }
            }
        },
        
        interact: function() {
            if (!this.called) {
                // Check if girl is near the call button
                if (girl.x < this.x + 80 &&
                    girl.x + girl.width > this.x &&
                    girl.y < this.y + 40 &&
                    girl.y + girl.height > this.y) {
                    this.called = true;
                    this.arrivalTimer = 0;
                    speechBubble.show('Calling taxi... Please wait.');
                }
            } else if (this.arrived) {
                // Check if girl is near the taxi
                if (girl.x < this.x + this.width &&
                    girl.x + girl.width > this.x - 20 &&
                    girl.y < this.y + this.height &&
                    girl.y + girl.height > this.y - 20) {
                    // Transport to airport
                    game.currentScene = 'airport';
                    girl.x = 100;
                    girl.y = 300;
                    speechBubble.show('Welcome to the airport!');
                    // Reset taxi for when we come back
                    this.called = false;
                    this.arrived = false;
                    this.arrivalTimer = 0;
                }
            }
        }
    };

    const catItems = {
        catFood: {
            x: 100,
            y: 150,
            width: 25,
            height: 25,
            taken: false,
            
            draw: function(ctx) {
                if (!this.taken) {
                    if (game.images.catFood && game.images.catFood.loaded) {
                        ctx.drawImage(game.images.catFood.img, this.x, this.y, this.width, this.height);
                    } else {
                        // Fallback to emoji
                        ctx.font = '25px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('🥫', this.x + this.width/2, this.y + this.height);
                    }
                }
            },
            
            interact: function() {
                if (!this.taken && 
                    girl.x < this.x + this.width + 10 &&
                    girl.x + girl.width > this.x - 10 &&
                    girl.y < this.y + this.height + 10 &&
                    girl.y + girl.height > this.y - 10) {
                    this.taken = true;
                    const catFoodItem = {name: 'Cat Food', type: 'cat_item', icon: '🥫'};
                    handInventory.pickupItem(catFoodItem);
                }
            }
        },
        
        milk: {
            x: 200,
            y: 150,
            width: 25,
            height: 25,
            taken: false,
            
            draw: function(ctx) {
                if (!this.taken) {
                    if (game.images.milk && game.images.milk.loaded) {
                        ctx.drawImage(game.images.milk.img, this.x, this.y, this.width, this.height);
                    } else {
                        // Fallback to emoji
                        ctx.font = '25px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('🥛', this.x + this.width/2, this.y + this.height);
                    }
                }
            },
            
            interact: function() {
                if (!this.taken && 
                    girl.x < this.x + this.width + 10 &&
                    girl.x + girl.width > this.x - 10 &&
                    girl.y < this.y + this.height + 10 &&
                    girl.y + girl.height > this.y - 10) {
                    this.taken = true;
                    const milkItem = {name: 'Milk', type: 'cat_item', icon: '🥛'};
                    handInventory.pickupItem(milkItem);
                }
            }
        },
        
        ballToy: {
            x: 300,
            y: 180,
            width: 20,
            height: 20,
            taken: false,
            
            draw: function(ctx) {
                if (!this.taken) {
                    if (game.images.ballToy && game.images.ballToy.loaded) {
                        ctx.drawImage(game.images.ballToy.img, this.x, this.y, this.width, this.height);
                    } else {
                        // Fallback to emoji
                        ctx.font = '20px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('⚽', this.x + this.width/2, this.y + this.height);
                    }
                }
            },
            
            interact: function() {
                if (!this.taken && 
                    girl.x < this.x + this.width + 10 &&
                    girl.x + girl.width > this.x - 10 &&
                    girl.y < this.y + this.height + 10 &&
                    girl.y + girl.height > this.y - 10) {
                    this.taken = true;
                    const toyItem = {name: 'Ball Toy', type: 'cat_toy', icon: '⚽'};
                    handInventory.pickupItem(toyItem);
                }
            }
        },
        
        featherToy: {
            x: 350,
            y: 180,
            width: 20,
            height: 20,
            taken: false,
            
            draw: function(ctx) {
                if (!this.taken) {
                    if (game.images.featherToy && game.images.featherToy.loaded) {
                        ctx.drawImage(game.images.featherToy.img, this.x, this.y, this.width, this.height);
                    } else {
                        // Fallback to emoji
                        ctx.font = '20px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('🪶', this.x + this.width/2, this.y + this.height);
                    }
                }
            },
            
            interact: function() {
                if (!this.taken && 
                    girl.x < this.x + this.width + 10 &&
                    girl.x + girl.width > this.x - 10 &&
                    girl.y < this.y + this.height + 10 &&
                    girl.y + girl.height > this.y - 10) {
                    this.taken = true;
                    const toyItem = {name: 'Feather Toy', type: 'cat_toy', icon: '🪶'};
                    handInventory.pickupItem(toyItem);
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

        showForKitten: function(text) {
            this.text = text;
            this.visible = true;
            this.startTime = Date.now();
            this.speaker = kitten;
        },

        showForMamaCat: function(text) {
            this.text = text;
            this.visible = true;
            this.startTime = Date.now();
            this.speaker = mamaCat;
        },

        draw: function(ctx) {
            if (this.visible && this.speaker) {
                const currentTime = Date.now();
                if (currentTime - this.startTime < this.duration) {
                    const centerX = this.speaker.x + this.speaker.width / 2;
                    const bubbleY = this.speaker.y - 50;
                    
                    // Measure text to determine bubble size
                    ctx.font = '14px Arial';
                    const textMetrics = ctx.measureText(this.text);
                    const textWidth = textMetrics.width;
                    const bubbleWidth = Math.max(textWidth + 20, 60); // Min width of 60
                    const bubbleHeight = 30;
                    const textY = bubbleY + 5;
                    
                    // Draw bubble background with border
                    ctx.fillStyle = 'white';
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 2;
                    
                    // Speech bubble tail
                    ctx.beginPath();
                    ctx.moveTo(centerX, bubbleY + bubbleHeight);
                    ctx.lineTo(centerX - 8, bubbleY + bubbleHeight - 5);
                    ctx.lineTo(centerX + 8, bubbleY + bubbleHeight - 5);
                    ctx.fill();
                    ctx.stroke();
                    
                    // Main bubble
                    ctx.beginPath();
                    ctx.roundRect(centerX - bubbleWidth/2, bubbleY - bubbleHeight/2, bubbleWidth, bubbleHeight, 15);
                    ctx.fill();
                    ctx.stroke();
                    
                    // Draw text
                    ctx.fillStyle = 'black';
                    ctx.font = '14px Arial';
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
            { name: 'Sugar', x: 400, y: 80, width: 40, height: 40, collected: false, color: '#F0F8FF' },
            { name: 'Cereal', x: 500, y: 80, width: 40, height: 50, collected: false, color: '#D2691E' },
            { name: 'Bowl', x: 550, y: 200, width: 50, height: 30, collected: false, color: '#E6E6FA' },
            { name: 'Spoon', x: 610, y: 200, width: 30, height: 40, collected: false, color: '#C0C0C0' }
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


        waffleRecipe: {
            name: 'Waffles',
            ingredients: ['Flour', 'Eggs', 'Milk', 'Sugar'],
            completed: false
        },

        cerealBowl: {
            x: 250, y: 300, width: 60, height: 40,
            hasItems: [],
            complete: false
        },

        cerealRecipe: {
            name: 'Cereal Breakfast',
            ingredients: ['Cereal', 'Milk', 'Bowl', 'Spoon'],
            completed: false
        },

        init: function() {
            this.ingredients.forEach(ing => ing.collected = false);
            this.mixingBowl.ingredients = [];
            this.mixingBowl.mixed = false;
            this.waffleMaker.hasBatter = false;
            this.waffleMaker.cooking = false;
            this.waffleMaker.waffleReady = false;
            this.waffleRecipe.completed = false;
            this.cerealBowl.hasItems = [];
            this.cerealBowl.complete = false;
            this.cerealRecipe.completed = false;
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

        getIngredientIcon: function(name) {
            const icons = {
                'Flour': '🌾',
                'Eggs': '🥚', 
                'Milk': '🥛',
                'Sugar': '🍯',
                'Cereal': '🥣',
                'Bowl': '🍜',
                'Spoon': '🥄'
            };
            return icons[name] || '📦';
        },

        interact: function() {
            // Check exit door first (highest priority)
            if (this.checkExitDoor()) {
                return;
            }
            
            // Check ingredient pickup
            this.ingredients.forEach(ingredient => {
                if (!ingredient.collected &&
                    girl.x < ingredient.x + ingredient.width &&
                    girl.x + girl.width > ingredient.x &&
                    girl.y < ingredient.y + ingredient.height &&
                    girl.y + girl.height > ingredient.y) {
                    ingredient.collected = true;
                    
                    // Add to hand/inventory system
                    const ingredientItem = {
                        name: ingredient.name, 
                        type: 'ingredient', 
                        icon: this.getIngredientIcon(ingredient.name)
                    };
                    handInventory.pickupItem(ingredientItem);
                }
            });
            
            // Check mixing bowl interaction
            if (girl.x < this.mixingBowl.x + this.mixingBowl.width &&
                girl.x + girl.width > this.mixingBowl.x &&
                girl.y < this.mixingBowl.y + this.mixingBowl.height &&
                girl.y + girl.height > this.mixingBowl.y) {
                
                // Check if girl has an ingredient in hand
                if (girl.heldItem && girl.heldItem.type === 'ingredient') {
                    this.mixingBowl.ingredients.push(girl.heldItem.name);
                    speechBubble.show(`Added ${girl.heldItem.name} to bowl!`);
                    girl.heldItem = null; // Remove from hand
                    return; // Exit after adding ingredient
                }
                
                // Try to mix if not carrying anything
                if (!girl.heldItem && !this.mixingBowl.mixed) {
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
                    this.waffleRecipe.completed = false;  // Reset so you can make more
                    speechBubble.show('Yummy waffle! Delicious! 🧇😋');
                    
                    // Optional: Add some visual effect or score
                    girl.health = Math.min((girl.health || 100) + 25, 100);
                } else if (this.mixingBowl.mixed && !this.waffleMaker.hasBatter && !this.waffleMaker.cooking) {
                    this.waffleMaker.hasBatter = true;
                    this.waffleMaker.cooking = true;
                    this.waffleMaker.cookTime = 0;
                    this.mixingBowl.ingredients = [];
                    this.mixingBowl.mixed = false;
                    speechBubble.show('Cooking waffle...');
                }
            }

            // Check cereal bowl interaction
            if (girl.x < this.cerealBowl.x + this.cerealBowl.width &&
                girl.x + girl.width > this.cerealBowl.x &&
                girl.y < this.cerealBowl.y + this.cerealBowl.height &&
                girl.y + girl.height > this.cerealBowl.y) {
                
                // If cereal is complete and ready, eat it!
                if (this.cerealBowl.complete && !girl.heldItem) {
                    this.cerealBowl.complete = false;
                    this.cerealBowl.hasItems = [];
                    this.cerealRecipe.completed = false;
                    speechBubble.show('Yum! That was a delicious breakfast! 🥣😋');
                    
                    // Optional: Add some visual effect or score
                    girl.health = Math.min((girl.health || 100) + 20, 100);
                    return;
                }
                
                // Check if girl has a cereal-related item in hand
                if (girl.heldItem && ['Cereal', 'Milk', 'Bowl', 'Spoon'].includes(girl.heldItem.name)) {
                    if (!this.cerealBowl.hasItems.includes(girl.heldItem.name)) {
                        this.cerealBowl.hasItems.push(girl.heldItem.name);
                        speechBubble.show(`Added ${girl.heldItem.name} to breakfast area!`);
                        girl.heldItem = null; // Remove from hand
                        
                        // Check if all items are present
                        if (this.cerealBowl.hasItems.length === 4) {
                            const hasAllItems = this.cerealRecipe.ingredients.every(ing => 
                                this.cerealBowl.hasItems.includes(ing)
                            );
                            
                            if (hasAllItems) {
                                this.cerealBowl.complete = true;
                                this.cerealRecipe.completed = true;
                                speechBubble.show('Cereal breakfast is ready! Press SPACE to eat! 🥣');
                            }
                        }
                    } else {
                        speechBubble.show(`${girl.heldItem.name} is already there!`);
                    }
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
                    // Try to draw with image first, fallback to programmatic
                    let imageKey = ingredient.name.toLowerCase();
                    if (game.images[imageKey] && game.images[imageKey].loaded) {
                        ctx.drawImage(game.images[imageKey].img, ingredient.x, ingredient.y, ingredient.width, ingredient.height);
                    } else {
                        // Fallback to programmatic rendering
                        ctx.fillStyle = ingredient.color;
                        ctx.fillRect(ingredient.x, ingredient.y, ingredient.width, ingredient.height);
                        ctx.strokeStyle = '#333';
                        ctx.strokeRect(ingredient.x, ingredient.y, ingredient.width, ingredient.height);
                        
                        // Draw emoji icon
                        ctx.font = '24px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(this.getIngredientIcon(ingredient.name), 
                                    ingredient.x + ingredient.width/2, 
                                    ingredient.y + ingredient.height/2 + 8);
                    }
                    
                    // Draw name label
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

            // Draw cereal bowl area
            ctx.fillStyle = this.cerealBowl.complete ? '#90EE90' : '#FFE4E1';
            ctx.fillRect(this.cerealBowl.x - 10, this.cerealBowl.y - 10, this.cerealBowl.width + 20, this.cerealBowl.height + 20);
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.cerealBowl.x - 10, this.cerealBowl.y - 10, this.cerealBowl.width + 20, this.cerealBowl.height + 20);
            
            // Draw cereal bowl items
            if (this.cerealBowl.hasItems.includes('Bowl')) {
                ctx.fillStyle = '#E6E6FA';
                ctx.beginPath();
                ctx.ellipse(this.cerealBowl.x + 30, this.cerealBowl.y + 20, 25, 15, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
            if (this.cerealBowl.hasItems.includes('Cereal')) {
                ctx.fillStyle = '#D2691E';
                ctx.fillRect(this.cerealBowl.x + 20, this.cerealBowl.y + 10, 20, 15);
            }
            if (this.cerealBowl.hasItems.includes('Milk')) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(this.cerealBowl.x + 25, this.cerealBowl.y + 12, 10, 10);
            }
            if (this.cerealBowl.hasItems.includes('Spoon')) {
                ctx.strokeStyle = '#C0C0C0';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(this.cerealBowl.x + 45, this.cerealBowl.y + 20);
                ctx.lineTo(this.cerealBowl.x + 55, this.cerealBowl.y + 20);
                ctx.stroke();
            }
            
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('CEREAL AREA', this.cerealBowl.x + this.cerealBowl.width/2, this.cerealBowl.y - 15);

            // Draw exit door
            this.drawExitDoor(ctx);

            // Draw recipe status panel
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(520, 50, 250, 320);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(520, 50, 250, 320);
            
            ctx.fillStyle = 'black';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('RECIPES', 645, 75);
            
            // Waffle Recipe
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillStyle = this.waffleRecipe.completed ? 'green' : 'blue';
            ctx.fillText(`${this.waffleRecipe.name}${this.waffleRecipe.completed ? ' ✓' : ''}`, 530, 100);
            
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            ctx.fillText('Ingredients:', 530, 115);
            this.waffleRecipe.ingredients.forEach((ing, i) => {
                const inBowl = this.mixingBowl.ingredients.includes(ing);
                ctx.fillStyle = inBowl ? 'green' : 'gray';
                ctx.fillText(`• ${ing}`, 535, 130 + i * 12);
            });
            
            // Show mixing bowl status
            if (this.mixingBowl.ingredients.length > 0 || this.mixingBowl.mixed) {
                ctx.fillStyle = 'black';
                ctx.fillText('Mixing Bowl:', 530, 180);
                if (this.mixingBowl.mixed) {
                    ctx.fillStyle = 'green';
                    ctx.fillText('✓ Batter ready!', 535, 195);
                } else {
                    this.mixingBowl.ingredients.forEach((ing, i) => {
                        ctx.fillStyle = 'blue';
                        ctx.fillText(`• ${ing}`, 535, 195 + i * 12);
                    });
                }
            }
            
            // Cereal Recipe
            ctx.font = '14px Arial';
            ctx.fillStyle = this.cerealRecipe.completed ? 'green' : 'blue';
            ctx.fillText(`${this.cerealRecipe.name}${this.cerealRecipe.completed ? ' ✓' : ''}`, 530, 240);
            
            ctx.fillStyle = 'black';
            ctx.font = '10px Arial';
            ctx.fillText('Ingredients:', 530, 255);
            this.cerealRecipe.ingredients.forEach((ing, i) => {
                const hasItem = this.cerealBowl.hasItems.includes(ing);
                ctx.fillStyle = hasItem ? 'green' : 'gray';
                ctx.fillText(`• ${ing}`, 535, 270 + i * 12);
            });
            
            // Show cereal bowl status
            if (this.cerealBowl.hasItems.length > 0) {
                ctx.fillStyle = 'black';
                ctx.fillText('Cereal Area:', 530, 320);
                this.cerealBowl.hasItems.forEach((ing, i) => {
                    ctx.fillStyle = 'blue';
                    ctx.fillText(`• ${ing}`, 535, 335 + i * 12);
                });
            }
        },
        
        drawExitDoor: function(ctx) {
            const doorX = 10;
            const doorY = 350;
            const doorWidth = 50;
            const doorHeight = 100;
            
            // Door frame
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
            
            // Door panel
            ctx.fillStyle = '#D2691E';
            ctx.fillRect(doorX + 5, doorY + 5, doorWidth - 10, doorHeight - 10);
            
            // Door handle
            ctx.fillStyle = 'gold';
            ctx.beginPath();
            ctx.arc(doorX + doorWidth - 10, doorY + doorHeight/2, 2, 0, 2 * Math.PI);
            ctx.fill();
            
            // Exit label
            ctx.fillStyle = 'white';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🏠 EXIT', doorX + doorWidth/2, doorY - 5);
            
            // Interaction hint when nearby
            if (girl.x < 80 && girl.y > 300) {
                ctx.fillStyle = 'yellow';
                ctx.font = '10px Arial';
                ctx.fillText('← Walk left to exit', doorX + doorWidth/2, doorY - 15);
                ctx.fillText('or press SPACE', doorX + doorWidth/2, doorY - 5);
            }
        },
        
        checkExitDoor: function() {
            // Alternative exit method using space key near door
            const doorX = 10;
            const doorY = 350;
            const doorWidth = 50;
            const doorHeight = 100;
            
            if (girl.x < doorX + doorWidth + 20 &&
                girl.x + girl.width > doorX - 10 &&
                girl.y < doorY + doorHeight &&
                girl.y + girl.height > doorY &&
                input.spacePressed) {
                game.currentScene = 'indoor';
                girl.x = kitchenDoor.x + kitchenDoor.width + 5;
                girl.y = kitchenDoor.y + 20;
                input.spacePressed = false;
                return true;
            }
            return false;
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
            pooping: false,
            poopProgress: 0,
            bathing: false,
            bathProgress: 0,
            washingHands: false,
            washProgress: 0,
            usingToiletPaper: false,
            wipingProgress: 0,
            justFinishedWiping: false,
            wipingCooldown: 0
        },

        init: function() {
            this.toilet.inUse = false;
            this.bathtub.hasWater = false;
            this.bathtub.temperature = 'cold';
            this.sink.hasWater = false;
            this.toiletPaper.rolls = 3;
            this.girl.peeing = false;
            this.girl.peeProgress = 0;
            this.girl.pooping = false;
            this.girl.poopProgress = 0;
            this.girl.bathing = false;
            this.girl.bathProgress = 0;
            this.girl.washingHands = false;
            this.girl.washProgress = 0;
            this.girl.usingToiletPaper = false;
            this.girl.wipingProgress = 0;
            this.girl.justFinishedWiping = false;
            this.girl.wipingCooldown = 0;
        },

        update: function() {
            // Handle wiping cooldown
            if (this.girl.wipingCooldown > 0) {
                this.girl.wipingCooldown--;
                if (this.girl.wipingCooldown === 0) {
                    this.girl.justFinishedWiping = false;
                }
            }
            
            // Update peeing progress
            if (this.girl.peeing && input.spacePressed) {
                this.girl.peeProgress += 2;
                if (this.girl.peeProgress >= 100) {
                    this.girl.peeing = false;
                    this.girl.peeProgress = 0;
                    girl.needsBathroom = 0;
                    girl.handsClean = false; // Hands dirty after using toilet
                    speechBubble.show('Done peeing! Now I need toilet paper.');
                }
            } else if (this.girl.peeing) {
                // Stop peeing if space not held
                this.girl.peeing = false;
                this.girl.peeProgress = 0;
                speechBubble.show('Hold space to finish!');
            }

            // Update pooping progress
            if (this.girl.pooping && input.spacePressed) {
                this.girl.poopProgress += 1.5; // Slower than peeing
                if (this.girl.poopProgress >= 100) {
                    this.girl.pooping = false;
                    this.girl.poopProgress = 0;
                    girl.needsPoop = 0;
                    girl.handsClean = false; // Hands dirty after using toilet
                    speechBubble.show('Done pooping! Definitely need toilet paper now.');
                }
            } else if (this.girl.pooping) {
                // Stop pooping if space not held
                this.girl.pooping = false;
                this.girl.poopProgress = 0;
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
                    this.girl.justFinishedWiping = true;
                    this.girl.wipingCooldown = 120; // 2 seconds at 60 fps
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
            // Check exit door first (highest priority)
            if (this.checkExitDoor()) {
                return;
            }
            
            // Don't start new interactions if already doing something
            if (this.girl.peeing || this.girl.pooping || this.girl.bathing || this.girl.washingHands || this.girl.usingToiletPaper) {
                return;
            }

            // Toilet paper interaction
            if (girl.x < this.toiletPaper.x + this.toiletPaper.width &&
                girl.x + girl.width > this.toiletPaper.x &&
                girl.y < this.toiletPaper.y + this.toiletPaper.height &&
                girl.y + girl.height > this.toiletPaper.y) {
                
                // Don't allow using toilet paper immediately after wiping
                if (this.girl.justFinishedWiping) {
                    return;  // Don't do anything during cooldown
                }
                
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
                
                // Check what kind of bathroom need is most urgent
                if (girl.needsPoop > 30 && girl.needsBathroom > 20) {
                    // Both needs - let user choose or default to poop (more urgent)
                    if (girl.needsPoop > girl.needsBathroom) {
                        this.girl.pooping = true;
                        this.girl.poopProgress = 0;
                        speechBubble.show('Hold space to poop!');
                    } else {
                        this.girl.peeing = true;
                        this.girl.peeProgress = 0;
                        speechBubble.show('Hold space to pee!');
                    }
                } else if (girl.needsPoop > 30) {
                    this.girl.pooping = true;
                    this.girl.poopProgress = 0;
                    speechBubble.show('Hold space to poop!');
                } else if (girl.needsBathroom > 20) {
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
            if (this.girl.pooping && this.girl.poopProgress > 0) {
                this.drawProgressBar(ctx, 50, 80, this.girl.poopProgress, 'Pooping...');
            }
            if (this.girl.bathing && this.girl.bathProgress > 0) {
                this.drawProgressBar(ctx, 50, 110, this.girl.bathProgress/2, 'Bathing...'); // /2 because bath takes 200
            }
            if (this.girl.washingHands && this.girl.washProgress > 0) {
                this.drawProgressBar(ctx, 50, 140, this.girl.washProgress, 'Washing hands...');
            }
            if (this.girl.usingToiletPaper && this.girl.wipingProgress > 0) {
                this.drawProgressBar(ctx, 50, 170, this.girl.wipingProgress, 'Using toilet paper...');
            }

            // Draw hygiene status
            this.drawHygieneStatus(ctx);
            
            // Draw exit door
            this.drawExitDoor(ctx);
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
            ctx.fillRect(600, 50, 180, 190);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(600, 50, 180, 190);
            
            ctx.fillStyle = 'black';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('HYGIENE STATUS', 690, 70);
            
            ctx.font = '10px Arial';
            ctx.textAlign = 'left';
            
            // Dirtiness
            ctx.fillStyle = girl.dirtiness > 50 ? 'red' : (girl.dirtiness > 25 ? 'orange' : 'green');
            ctx.fillText(`Cleanliness: ${Math.max(0, 100 - girl.dirtiness)}%`, 610, 90);
            
            // Pee need
            ctx.fillStyle = girl.needsBathroom > 75 ? 'red' : (girl.needsBathroom > 50 ? 'orange' : 'green');
            ctx.fillText(`Pee need: ${Math.round(girl.needsBathroom)}%`, 610, 110);
            
            // Poop need
            ctx.fillStyle = girl.needsPoop > 75 ? 'red' : (girl.needsPoop > 50 ? 'orange' : 'green');
            ctx.fillText(`Poop need: ${Math.round(girl.needsPoop)}%`, 610, 130);
            
            // Hand cleanliness
            ctx.fillStyle = girl.handsClean ? 'green' : 'red';
            ctx.fillText(`Hands: ${girl.handsClean ? 'Clean' : 'Dirty'}`, 610, 150);
            
            // Soap availability
            ctx.fillStyle = this.sink.hasSoap ? 'green' : 'red';
            ctx.fillText(`Soap: ${this.sink.hasSoap ? 'Available' : 'Empty'}`, 610, 170);
            
            // Toilet paper availability
            ctx.fillStyle = this.toiletPaper.rolls > 0 ? 'green' : 'red';
            ctx.fillText(`Toilet Paper: ${this.toiletPaper.rolls} rolls`, 610, 190);
        },
        
        drawExitDoor: function(ctx) {
            const doorX = 10;
            const doorY = 350;
            const doorWidth = 50;
            const doorHeight = 100;
            
            // Door frame
            ctx.fillStyle = '#4169E1';
            ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
            
            // Door panel
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(doorX + 5, doorY + 5, doorWidth - 10, doorHeight - 10);
            
            // Door handle
            ctx.fillStyle = 'chrome';
            ctx.beginPath();
            ctx.arc(doorX + doorWidth - 10, doorY + doorHeight/2, 2, 0, 2 * Math.PI);
            ctx.fill();
            
            // Exit label
            ctx.fillStyle = 'white';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🏠 EXIT', doorX + doorWidth/2, doorY - 5);
            
            // Interaction hint when nearby
            if (girl.x < 80 && girl.y > 300) {
                ctx.fillStyle = 'yellow';
                ctx.font = '10px Arial';
                ctx.fillText('← Walk left to exit', doorX + doorWidth/2, doorY - 15);
                ctx.fillText('or press SPACE', doorX + doorWidth/2, doorY - 5);
            }
        },
        
        checkExitDoor: function() {
            // Alternative exit method using space key near door
            const doorX = 10;
            const doorY = 350;
            const doorWidth = 50;
            const doorHeight = 100;
            
            if (girl.x < doorX + doorWidth + 20 &&
                girl.x + girl.width > doorX - 10 &&
                girl.y < doorY + doorHeight &&
                girl.y + girl.height > doorY &&
                input.spacePressed) {
                game.currentScene = 'indoor';
                girl.x = bathroomDoor.x + bathroomDoor.width + 5;
                girl.y = bathroomDoor.y + 20;
                input.spacePressed = false;
                return true;
            }
            return false;
        }
    };

    const airport = {
        girlLuggage: null,
        luggageCheckedIn: false,
        checkInCounter: {
            x: 100, y: 100, width: 150, height: 80
        },
        destinations: ['Paris', 'Rainforest', 'New York City', 'Rainbow Unicorn Land', 'China'],
        gates: [
            { id: 1, x: 300, y: 50, width: 90, height: 60, planeReady: false, destination: 'Paris' },
            { id: 2, x: 400, y: 50, width: 90, height: 60, planeReady: true, destination: 'Rainforest' },
            { id: 3, x: 500, y: 50, width: 90, height: 60, planeReady: false, destination: 'New York City' },
            { id: 4, x: 600, y: 50, width: 90, height: 60, planeReady: false, destination: 'Rainbow Unicorn Land' },
            { id: 5, x: 700, y: 50, width: 90, height: 60, planeReady: true, destination: 'China' }
        ],
        planes: [
            { x: -200, y: 300, width: 120, height: 60, speed: 2, taking_off: true },
            { x: 900, y: 250, width: 100, height: 50, speed: -1.5, landing: true }
        ],
        exitTaxi: {
            x: 50, y: 400, width: 80, height: 40
        },
        
        init: function() {
            // Initialize girl's luggage near entrance
            this.girlLuggage = {
                x: 100, y: 350, width: 35, height: 45, 
                color: '#FF69B4', // Pink for the girl's luggage
                pickedUp: false
            };
            this.luggageCheckedIn = false;
            
            // Randomize gate destinations
            this.shuffleDestinations();
        },
        
        shuffleDestinations: function() {
            // Randomly assign destinations to gates
            const shuffled = [...this.destinations].sort(() => Math.random() - 0.5);
            this.gates.forEach((gate, index) => {
                gate.destination = shuffled[index];
            });
        },
        
        update: function() {
            // Update plane animations
            this.planes.forEach(plane => {
                plane.x += plane.speed;
                
                // Reset planes that go off screen
                if (plane.taking_off && plane.x > 900) {
                    plane.x = -200;
                    plane.y = 300 + Math.random() * 100;
                } else if (plane.landing && plane.x < -200) {
                    plane.x = 900;
                    plane.y = 250 + Math.random() * 100;
                }
            });
            
            // Randomly toggle gate readiness
            if (Math.random() < 0.005) { // Small chance each frame
                const randomGate = this.gates[Math.floor(Math.random() * this.gates.length)];
                randomGate.planeReady = !randomGate.planeReady;
                if (randomGate.planeReady) {
                    speechBubble.show(`Flight to ${randomGate.destination} is now boarding at Gate ${randomGate.id}!`);
                }
            }
        },
        
        draw: function(ctx) {
            // Draw airport background
            if (game.images.airport && game.images.airport.loaded) {
                ctx.drawImage(game.images.airport.img, 0, 0, game.canvas.width, game.canvas.height);
            } else {
                // Programmatic airport background
                ctx.fillStyle = '#E8E8E8';
                ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
                
                // Floor tiles
                ctx.strokeStyle = '#CCC';
                for (let x = 0; x < game.canvas.width; x += 50) {
                    for (let y = 0; y < game.canvas.height; y += 50) {
                        ctx.strokeRect(x, y, 50, 50);
                    }
                }
            }
            
            // Draw check-in counter
            ctx.fillStyle = '#4682B4';
            ctx.fillRect(this.checkInCounter.x, this.checkInCounter.y, this.checkInCounter.width, this.checkInCounter.height);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.checkInCounter.x, this.checkInCounter.y, this.checkInCounter.width, this.checkInCounter.height);
            
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('CHECK-IN', this.checkInCounter.x + this.checkInCounter.width/2, this.checkInCounter.y + 30);
            ctx.font = '10px Arial';
            ctx.fillText('Drop luggage here', this.checkInCounter.x + this.checkInCounter.width/2, this.checkInCounter.y + 50);
            
            // Draw boarding gates
            this.gates.forEach(gate => {
                ctx.fillStyle = gate.planeReady ? '#90EE90' : '#FFB6C1';
                ctx.fillRect(gate.x, gate.y, gate.width, gate.height);
                ctx.strokeStyle = '#333';
                ctx.strokeRect(gate.x, gate.y, gate.width, gate.height);
                
                ctx.fillStyle = 'black';
                ctx.font = '11px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`Gate ${gate.id}`, gate.x + gate.width/2, gate.y + 20);
                ctx.font = '9px Arial';
                ctx.fillText(gate.destination, gate.x + gate.width/2, gate.y + 35);
                ctx.font = '8px Arial';
                ctx.fillText(gate.planeReady ? 'BOARDING' : 'WAITING', gate.x + gate.width/2, gate.y + 50);
            });
            
            // Draw windows showing planes outside
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(300, 150, 400, 100);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 3;
            ctx.strokeRect(300, 150, 400, 100);
            
            // Draw dividers for window panes
            for (let i = 1; i < 4; i++) {
                ctx.beginPath();
                ctx.moveTo(300 + i * 100, 150);
                ctx.lineTo(300 + i * 100, 250);
                ctx.stroke();
            }
            
            // Draw planes visible through windows
            this.planes.forEach(plane => {
                if (plane.y >= 150 && plane.y <= 350) {
                    // Only draw if plane would be visible through window
                    if (plane.x > 250 && plane.x < 750) {
                        this.drawPlane(ctx, plane.x, plane.y, plane.width * 0.5, plane.height * 0.5);
                    }
                }
            });
            
            // Draw girl's luggage if not picked up or checked in
            if (this.girlLuggage && !this.girlLuggage.pickedUp && !this.luggageCheckedIn) {
                const bag = this.girlLuggage;
                if (game.images.luggage && game.images.luggage.loaded) {
                    ctx.drawImage(game.images.luggage.img, bag.x, bag.y, bag.width, bag.height);
                } else {
                    // Draw programmatic luggage
                    ctx.fillStyle = bag.color;
                    ctx.fillRect(bag.x, bag.y, bag.width, bag.height);
                    ctx.strokeStyle = '#333';
                    ctx.strokeRect(bag.x, bag.y, bag.width, bag.height);
                    
                    // Handle
                    ctx.strokeStyle = '#666';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(bag.x + 5, bag.y);
                    ctx.lineTo(bag.x + bag.width - 5, bag.y);
                    ctx.stroke();
                    
                    // Zipper
                    ctx.strokeStyle = '#999';
                    ctx.beginPath();
                    ctx.moveTo(bag.x + bag.width/2, bag.y + 5);
                    ctx.lineTo(bag.x + bag.width/2, bag.y + bag.height - 5);
                    ctx.stroke();
                    
                    // Label showing it's the girl's
                    ctx.fillStyle = 'white';
                    ctx.font = '8px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('MY BAG', bag.x + bag.width/2, bag.y + bag.height/2);
                }
            }
            
            // Show check-in status
            if (this.luggageCheckedIn) {
                ctx.fillStyle = 'green';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('✓ Luggage checked in!', this.checkInCounter.x + this.checkInCounter.width/2, this.checkInCounter.y + 70);
            }
            
            // Draw exit/taxi button
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(this.exitTaxi.x, this.exitTaxi.y, this.exitTaxi.width, this.exitTaxi.height);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(this.exitTaxi.x, this.exitTaxi.y, this.exitTaxi.width, this.exitTaxi.height);
            
            ctx.fillStyle = 'black';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('EXIT/TAXI', this.exitTaxi.x + this.exitTaxi.width/2, this.exitTaxi.y + 25);
            
            // Draw airport info panel
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(650, 300, 140, 120);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(650, 300, 140, 120);
            
            ctx.fillStyle = 'black';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('TRAVEL GUIDE', 720, 320);
            ctx.font = '10px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('• Pick up MY luggage', 660, 340);
            ctx.fillText('• Check in at counter', 660, 355);
            ctx.fillText('• Choose destination', 660, 370);
            ctx.fillText('• Board when ready', 660, 385);
            ctx.fillText('• Exit to call taxi', 660, 400);
        },
        
        drawPlane: function(ctx, x, y, width, height) {
            if (game.images.airplane && game.images.airplane.loaded) {
                ctx.drawImage(game.images.airplane.img, x, y, width, height);
            } else {
                // Draw programmatic airplane
                // Fuselage
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(x, y + height * 0.3, width * 0.7, height * 0.4);
                
                // Cockpit
                ctx.fillStyle = '#4169E1';
                ctx.beginPath();
                ctx.arc(x + width * 0.7, y + height * 0.5, height * 0.2, -Math.PI/2, Math.PI/2);
                ctx.fill();
                
                // Wings
                ctx.fillStyle = '#A0A0A0';
                ctx.fillRect(x + width * 0.2, y, width * 0.3, height * 0.3);
                ctx.fillRect(x + width * 0.2, y + height * 0.7, width * 0.3, height * 0.3);
                
                // Tail
                ctx.fillStyle = '#808080';
                ctx.beginPath();
                ctx.moveTo(x, y + height * 0.3);
                ctx.lineTo(x - width * 0.1, y);
                ctx.lineTo(x, y + height * 0.5);
                ctx.closePath();
                ctx.fill();
                
                // Windows
                ctx.fillStyle = '#87CEEB';
                for (let i = 0; i < 4; i++) {
                    ctx.fillRect(x + width * 0.15 + i * width * 0.12, y + height * 0.4, width * 0.05, height * 0.1);
                }
            }
        },
        
        interact: function() {
            // Check exit/taxi button
            if (girl.x < this.exitTaxi.x + this.exitTaxi.width &&
                girl.x + girl.width > this.exitTaxi.x &&
                girl.y < this.exitTaxi.y + this.exitTaxi.height &&
                girl.y + girl.height > this.exitTaxi.y) {
                // Return to outdoor scene
                game.currentScene = 'outdoor';
                girl.x = 600;
                girl.y = 250;
                speechBubble.show('Back outside! The taxi left.');
                // Reset airport for next visit
                this.girlLuggage.pickedUp = false;
                this.luggageCheckedIn = false;
                girl.carryingLuggage = null;
                return true;
            }
            
            // Check luggage pickup
            if (this.girlLuggage && !this.girlLuggage.pickedUp && !this.luggageCheckedIn && !girl.carryingLuggage &&
                girl.x < this.girlLuggage.x + this.girlLuggage.width &&
                girl.x + girl.width > this.girlLuggage.x &&
                girl.y < this.girlLuggage.y + this.girlLuggage.height &&
                girl.y + girl.height > this.girlLuggage.y) {
                this.girlLuggage.pickedUp = true;
                girl.carryingLuggage = this.girlLuggage;
                speechBubble.show('Picked up my luggage! Now I need to check it in.');
            }
            
            // Check luggage check-in
            if (girl.carryingLuggage &&
                girl.x < this.checkInCounter.x + this.checkInCounter.width &&
                girl.x + girl.width > this.checkInCounter.x &&
                girl.y < this.checkInCounter.y + this.checkInCounter.height &&
                girl.y + girl.height > this.checkInCounter.y) {
                this.luggageCheckedIn = true;
                girl.carryingLuggage = null;
                speechBubble.show('Luggage checked in! Now I can board a plane!');
            }
            
            // Check boarding gates
            this.gates.forEach(gate => {
                if (gate.planeReady &&
                    girl.x < gate.x + gate.width &&
                    girl.x + girl.width > gate.x &&
                    girl.y < gate.y + gate.height &&
                    girl.y + girl.height > gate.y) {
                    
                    if (!this.luggageCheckedIn) {
                        speechBubble.show('I need to check in my luggage first!');
                        return;
                    }
                    
                    // Board the plane to the destination!
                    const destination = gate.destination;
                    speechBubble.show(`Boarding flight to ${destination}! ✈️`);
                    
                    // Travel to the plane interior first
                    setTimeout(() => {
                        this.boardPlane(destination);
                    }, 1000);
                    
                    gate.planeReady = false;
                }
            });
            
            return false;
        },
        
        boardPlane: function(destination) {
            game.currentScene = 'airplane';
            girl.x = 100;
            girl.y = 350;
            airplane.destination = destination;
            airplane.seatAssigned = false;
            airplane.isSeated = false;
            airplane.hasSnacks = false;
            airplane.hasWater = false;
            airplane.assignedSeat = null;
            airplane.arrivalTimer = 30; // Reset timer to 30 seconds
            speechBubble.show('Welcome aboard! Finding your seat assignment...');
        },
        
        travelToDestination: function(destination) {
            // Map destinations to scene names
            const sceneMap = {
                'Paris': 'paris',
                'Rainforest': 'rainforest',
                'New York City': 'nyc',
                'Rainbow Unicorn Land': 'unicornland',
                'China': 'china'
            };
            
            const scene = sceneMap[destination];
            if (scene) {
                game.currentScene = scene;
                girl.x = 100;
                girl.y = 300;
                speechBubble.show(`Welcome to ${destination}!`);
                
                // Reset airport for return trip
                this.girlLuggage.pickedUp = false;
                this.luggageCheckedIn = false;
                girl.carryingLuggage = null;
            }
        }
    };

    const airplane = {
        destination: '',
        seatAssigned: false,
        isSeated: false,
        hasSnacks: false,
        hasWater: false,
        assignedSeat: null,
        arrivalTimer: 30, // 30 seconds
        flightAttendant: { x: 400, y: 150, moving: true, direction: 1 },
        
        seats: [
            // Left side seats (A, B) - Row 10
            { x: 50, y: 120, width: 60, height: 60, number: '10A', occupied: true, passenger: '👨' },
            { x: 120, y: 120, width: 60, height: 60, number: '10B', occupied: false },
            
            // Left side seats (A, B) - Row 11
            { x: 50, y: 190, width: 60, height: 60, number: '11A', occupied: true, passenger: '👩' },
            { x: 120, y: 190, width: 60, height: 60, number: '11B', occupied: false },
            
            // Left side seats (A, B) - Row 12
            { x: 50, y: 260, width: 60, height: 60, number: '12A', occupied: false },
            { x: 120, y: 260, width: 60, height: 60, number: '12B', occupied: true, passenger: '👴' },
            
            // Left side seats (A, B) - Row 13
            { x: 50, y: 330, width: 60, height: 60, number: '13A', occupied: false },
            { x: 120, y: 330, width: 60, height: 60, number: '13B', occupied: false },
            
            // Right side seats (C, D) - Row 10
            { x: 420, y: 120, width: 60, height: 60, number: '10C', occupied: true, passenger: '👩‍💼' },
            { x: 490, y: 120, width: 60, height: 60, number: '10D', occupied: false },
            
            // Right side seats (C, D) - Row 11
            { x: 420, y: 190, width: 60, height: 60, number: '11C', occupied: false },
            { x: 490, y: 190, width: 60, height: 60, number: '11D', occupied: true, passenger: '👨‍💻' },
            
            // Right side seats (C, D) - Row 12
            { x: 420, y: 260, width: 60, height: 60, number: '12C', occupied: true, passenger: '👦' },
            { x: 490, y: 260, width: 60, height: 60, number: '12D', occupied: false },
            
            // Right side seats (C, D) - Row 13
            { x: 420, y: 330, width: 60, height: 60, number: '13C', occupied: false },
            { x: 490, y: 330, width: 60, height: 60, number: '13D', occupied: false }
        ],
        
        availableSeats: ['10B', '10D', '11B', '11C', '12A', '12D', '13A', '13B', '13C', '13D'],
        
        tvScreen: { x: 300, y: 80, width: 100, height: 60, channel: 0 },
        
        update: function() {
            // Move flight attendant
            if (this.flightAttendant.moving) {
                this.flightAttendant.x += this.flightAttendant.direction * 1;
                if (this.flightAttendant.x > 500 || this.flightAttendant.x < 200) {
                    this.flightAttendant.direction *= -1;
                }
            }
            
            // Update arrival timer if seated
            if (this.isSeated && this.arrivalTimer > 0) {
                this.arrivalTimer -= 1/60; // Decrement by 1/60th per frame (60 FPS)
                if (this.arrivalTimer <= 0) {
                    this.arrivalTimer = 0;
                    speechBubble.show('We have arrived! Please gather your belongings.');
                    setTimeout(() => {
                        airport.travelToDestination(this.destination);
                    }, 2000);
                }
            }
            
            // Assign seat on first frame if not assigned
            if (!this.seatAssigned && !this.assignedSeat) {
                this.assignRandomSeat();
            }
        },
        
        assignRandomSeat: function() {
            const randomSeatNumber = this.availableSeats[Math.floor(Math.random() * this.availableSeats.length)];
            this.assignedSeat = this.seats.find(seat => seat.number === randomSeatNumber);
            this.seatAssigned = true;
            speechBubble.show(`Your seat is ${randomSeatNumber}. Please find and sit in it!`);
        },
        
        draw: function(ctx) {
            // Airplane interior background
            ctx.fillStyle = '#E6E6FA'; // Lavender
            ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
            
            // Cabin walls
            ctx.fillStyle = '#D3D3D3';
            ctx.fillRect(0, 0, game.canvas.width, 50);
            ctx.fillRect(0, game.canvas.height - 50, game.canvas.width, 50);
            
            // Aisle
            ctx.fillStyle = '#4169E1';
            ctx.fillRect(250, 0, 100, game.canvas.height);
            
            // Draw seats
            this.seats.forEach(seat => {
                if (seat === this.assignedSeat) {
                    ctx.fillStyle = '#FFD700'; // Assigned seat - gold
                } else if (seat.occupied) {
                    ctx.fillStyle = '#8B0000'; // Occupied - dark red
                } else {
                    ctx.fillStyle = '#4682B4'; // Available - steel blue
                }
                
                ctx.fillRect(seat.x, seat.y, seat.width, seat.height);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeRect(seat.x, seat.y, seat.width, seat.height);
                
                // Seat number
                ctx.fillStyle = 'white';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(seat.number, seat.x + seat.width/2, seat.y + seat.height/2 + 3);
                
                // Draw passengers properly positioned in seats
                if (seat.occupied && seat.passenger) {
                    ctx.font = '20px Arial';
                    ctx.fillText(seat.passenger, seat.x + seat.width/2, seat.y + seat.height/2 - 5);
                }
                
                // Show interaction hint for assigned seat
                if (seat === this.assignedSeat && !this.isSeated &&
                    girl.x < seat.x + seat.width + 10 && girl.x + girl.width > seat.x - 10 &&
                    girl.y < seat.y + seat.height + 10 && girl.y + girl.height > seat.y - 10) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.fillRect(seat.x - 10, seat.y - 25, seat.width + 20, 15);
                    ctx.fillStyle = 'black';
                    ctx.font = '10px Arial';
                    ctx.fillText('Press SPACE to sit', seat.x + seat.width/2, seat.y - 15);
                }
            });
            
            // Draw TV screen
            ctx.fillStyle = '#000';
            ctx.fillRect(this.tvScreen.x, this.tvScreen.y, this.tvScreen.width, this.tvScreen.height);
            ctx.strokeStyle = '#C0C0C0';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.tvScreen.x, this.tvScreen.y, this.tvScreen.width, this.tvScreen.height);
            
            // TV content with actual content
            ctx.fillStyle = '#00FF00';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            
            const tvContent = [
                { title: '✈️ Flight Map', content: [`To: ${this.destination}`, 'Speed: 550 mph', 'Altitude: 35,000 ft'] },
                { title: '🎬 Movies', content: ['🎬 Top Gun: Maverick', '🎬 Spider-Man', '🎬 Avatar'] },
                { title: '🎵 Music', content: ['🎵 Classical Radio', '🎵 Jazz Lounge', '🎵 Pop Hits'] },
                { title: '📰 News', content: ['📰 Weather: Sunny', '📰 Sports Scores', '📰 World News'] }
            ];
            
            const currentContent = tvContent[this.tvScreen.channel];
            ctx.fillText(currentContent.title, this.tvScreen.x + this.tvScreen.width/2, this.tvScreen.y + 15);
            
            currentContent.content.forEach((line, index) => {
                ctx.fillText(line, this.tvScreen.x + this.tvScreen.width/2, this.tvScreen.y + 30 + index * 10);
            });
            
            ctx.fillText('Press T to change', this.tvScreen.x + this.tvScreen.width/2, this.tvScreen.y + 55);
            
            // Draw flight attendant
            ctx.fillStyle = '#0000FF'; // Blue uniform
            ctx.fillRect(this.flightAttendant.x, this.flightAttendant.y, 30, 50);
            ctx.fillStyle = '#FFB6C1'; // Pink face
            ctx.fillRect(this.flightAttendant.x + 5, this.flightAttendant.y - 10, 20, 15);
            
            // Cart with snacks
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(this.flightAttendant.x + 35, this.flightAttendant.y + 10, 40, 30);
            ctx.font = '12px Arial';
            ctx.fillText('🥜🥤', this.flightAttendant.x + 55, this.flightAttendant.y + 30);
            
            // Show interaction hint near flight attendant
            if (girl.x < this.flightAttendant.x + 80 && girl.x + girl.width > this.flightAttendant.x - 10 &&
                girl.y < this.flightAttendant.y + 60 && girl.y + girl.height > this.flightAttendant.y - 10) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(this.flightAttendant.x - 10, this.flightAttendant.y - 30, 100, 15);
                ctx.fillStyle = 'black';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Press SPACE for service', this.flightAttendant.x + 40, this.flightAttendant.y - 20);
            }
            
            // Flight info panel
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(550, 50, 200, 160);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(550, 50, 200, 160);
            
            ctx.fillStyle = 'black';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Flight to ${this.destination}`, 650, 75);
            
            ctx.font = '10px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`Seat: ${this.assignedSeat ? this.assignedSeat.number + (this.isSeated ? ' ✓' : '') : 'Assigning...'}`, 560, 100);
            ctx.fillText(`Seated: ${this.isSeated ? 'Yes ✓' : 'No'}`, 560, 115);
            ctx.fillText(`Snacks: ${this.hasSnacks ? 'Received ✓' : 'Available'}`, 560, 130);
            ctx.fillText(`Water: ${this.hasWater ? 'Received ✓' : 'Available'}`, 560, 145);
            
            // Arrival timer
            if (this.isSeated) {
                const minutes = Math.floor(this.arrivalTimer / 60);
                const seconds = Math.floor(this.arrivalTimer % 60);
                ctx.fillStyle = this.arrivalTimer <= 30 ? 'red' : 'blue';
                ctx.fillText(`Arrival: ${minutes}:${seconds.toString().padStart(2, '0')}`, 560, 160);
                
                if (this.hasSnacks && this.hasWater) {
                    ctx.fillStyle = 'green';
                    ctx.fillText('Enjoy your flight!', 560, 175);
                }
            } else {
                ctx.fillStyle = 'orange';
                ctx.fillText('Please take your seat', 560, 160);
            }
        },
        
        interact: function() {
            // Check sitting in assigned seat
            if (this.assignedSeat && !this.isSeated &&
                girl.x < this.assignedSeat.x + this.assignedSeat.width + 10 && girl.x + girl.width > this.assignedSeat.x - 10 &&
                girl.y < this.assignedSeat.y + this.assignedSeat.height + 10 && girl.y + girl.height > this.assignedSeat.y - 10) {
                this.isSeated = true;
                speechBubble.show(`Seated in ${this.assignedSeat.number}! The flight will take ${this.arrivalTimer} seconds.`);
                return;
            }
            
            // Check flight attendant interaction
            if (girl.x < this.flightAttendant.x + 80 && girl.x + girl.width > this.flightAttendant.x - 10 &&
                girl.y < this.flightAttendant.y + 60 && girl.y + girl.height > this.flightAttendant.y - 10) {
                
                if (!this.hasSnacks) {
                    this.hasSnacks = true;
                    speechBubble.show('Here are some complimentary peanuts! 🥜');
                } else if (!this.hasWater) {
                    this.hasWater = true;
                    speechBubble.show('And here\'s some water! 🥤');
                } else {
                    speechBubble.show('Enjoy your flight! We\'ll be landing soon.');
                }
                return;
            }
            
            // Landing is now handled by the timer in update function
        },
        
        changeChannel: function() {
            this.tvScreen.channel = (this.tvScreen.channel + 1) % 4;
            speechBubble.show('Channel changed!');
        }
    };

    // Destination scenes
    const destinations = {
        paris: {
            draw: function(ctx) {
                // Paris background - beautiful gradient sky
                const gradient = ctx.createLinearGradient(0, 0, 0, game.canvas.height);
                gradient.addColorStop(0, '#87CEEB'); // Sky blue
                gradient.addColorStop(0.7, '#FFB6C1'); // Light pink
                gradient.addColorStop(1, '#DDA0DD'); // Plum
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
                
                // Clouds
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                for (let i = 0; i < 4; i++) {
                    const x = i * 180 + 100;
                    const y = 80 + Math.sin(i) * 20;
                    ctx.beginPath();
                    ctx.arc(x, y, 25, 0, Math.PI * 2);
                    ctx.arc(x + 15, y, 30, 0, Math.PI * 2);
                    ctx.arc(x + 30, y, 25, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Realistic Eiffel Tower with see-through lattice structure
                this.drawEiffelTower(ctx, 380, 80);
                
                // Beautiful French Hotel
                const hotelX = 100;
                const hotelY = 180;
                
                // Hotel main building
                ctx.fillStyle = '#F5F5DC'; // Beige
                ctx.fillRect(hotelX, hotelY, 120, 120);
                
                // Hotel roof
                ctx.fillStyle = '#8B0000'; // Dark red
                ctx.beginPath();
                ctx.moveTo(hotelX - 10, hotelY);
                ctx.lineTo(hotelX + 60, hotelY - 30);
                ctx.lineTo(hotelX + 130, hotelY);
                ctx.closePath();
                ctx.fill();
                
                // Hotel sign
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(hotelX + 20, hotelY + 20, 80, 25);
                ctx.fillStyle = '#8B0000';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('HÔTEL PARIS', hotelX + 60, hotelY + 38);
                
                // Hotel windows
                ctx.fillStyle = '#87CEEB';
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 4; col++) {
                        const winX = hotelX + 15 + col * 25;
                        const winY = hotelY + 60 + row * 20;
                        ctx.fillRect(winX, winY, 12, 15);
                        ctx.strokeStyle = '#8B4513';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(winX, winY, 12, 15);
                        // Window cross
                        ctx.beginPath();
                        ctx.moveTo(winX + 6, winY);
                        ctx.lineTo(winX + 6, winY + 15);
                        ctx.moveTo(winX, winY + 7);
                        ctx.lineTo(winX + 12, winY + 7);
                        ctx.stroke();
                    }
                }
                
                // Hotel entrance
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(hotelX + 50, hotelY + 100, 20, 20);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(hotelX + 52, hotelY + 102, 16, 16);
                
                // French flag
                const flagX = hotelX - 20;
                const flagY = hotelY + 30;
                // Flag pole
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(flagX, flagY, 3, 80);
                // Flag
                ctx.fillStyle = '#0055A4'; // Blue
                ctx.fillRect(flagX + 3, flagY, 15, 10);
                ctx.fillStyle = '#FFFFFF'; // White
                ctx.fillRect(flagX + 18, flagY, 15, 10);
                ctx.fillStyle = '#EF4135'; // Red
                ctx.fillRect(flagX + 33, flagY, 15, 10);
                
                // Parisian street lamp
                const lampX = 280;
                const lampY = 200;
                ctx.fillStyle = '#2F2F2F';
                ctx.fillRect(lampX, lampY, 5, 100);
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(lampX + 2.5, lampY, 15, 0, Math.PI * 2);
                ctx.fill();
                
                // Café tables
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(320, 280, 30, 20);
                ctx.fillRect(370, 275, 30, 20);
                // Umbrellas
                ctx.fillStyle = '#FF6347';
                ctx.beginPath();
                ctx.arc(335, 270, 20, 0, Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(385, 265, 20, 0, Math.PI);
                ctx.fill();
                
                // Hotel interaction hint
                if (girl.x < hotelX + 130 && girl.x + girl.width > hotelX &&
                    girl.y < hotelY + 130 && girl.y + girl.height > hotelY + 100) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.fillRect(hotelX + 10, hotelY - 20, 100, 15);
                    ctx.fillStyle = 'black';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('Press SPACE to enter hotel', hotelX + 60, hotelY - 10);
                }
                
                // Return button
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(50, 350, 100, 40);
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 2;
                ctx.strokeRect(50, 350, 100, 40);
                ctx.fillStyle = 'black';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('RETURN HOME', 100, 375);
                
                // Title
                ctx.fillStyle = 'white';
                ctx.font = '24px Arial';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
                ctx.strokeText('Bonjour Paris! 🗼', 400, 40);
                ctx.fillText('Bonjour Paris! 🗼', 400, 40);
            },
            
            drawEiffelTower: function(ctx, towerX, towerY) {
                const towerColor = '#2F2F2F';
                const highlightColor = '#404040';
                
                // Main tower structure - four legs with see-through design
                ctx.strokeStyle = towerColor;
                ctx.lineWidth = 4;
                
                // Tower legs (four main pillars)
                // Left front leg
                ctx.beginPath();
                ctx.moveTo(towerX - 50, towerY + 220);
                ctx.lineTo(towerX - 25, towerY + 160);
                ctx.lineTo(towerX - 15, towerY + 100);
                ctx.lineTo(towerX - 8, towerY + 40);
                ctx.lineTo(towerX, towerY);
                ctx.stroke();
                
                // Right front leg
                ctx.beginPath();
                ctx.moveTo(towerX + 50, towerY + 220);
                ctx.lineTo(towerX + 25, towerY + 160);
                ctx.lineTo(towerX + 15, towerY + 100);
                ctx.lineTo(towerX + 8, towerY + 40);
                ctx.lineTo(towerX, towerY);
                ctx.stroke();
                
                // Left back leg
                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(towerX - 45, towerY + 215);
                ctx.lineTo(towerX - 20, towerY + 155);
                ctx.lineTo(towerX - 10, towerY + 95);
                ctx.lineTo(towerX - 4, towerY + 35);
                ctx.lineTo(towerX, towerY);
                ctx.stroke();
                
                // Right back leg
                ctx.beginPath();
                ctx.moveTo(towerX + 45, towerY + 215);
                ctx.lineTo(towerX + 20, towerY + 155);
                ctx.lineTo(towerX + 10, towerY + 95);
                ctx.lineTo(towerX + 4, towerY + 35);
                ctx.lineTo(towerX, towerY);
                ctx.stroke();
                
                // Horizontal platforms (see-through)
                ctx.strokeStyle = towerColor;
                ctx.lineWidth = 6;
                
                // First level platform
                ctx.beginPath();
                ctx.moveTo(towerX - 50, towerY + 220);
                ctx.lineTo(towerX + 50, towerY + 220);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(towerX - 45, towerY + 215);
                ctx.lineTo(towerX + 45, towerY + 215);
                ctx.stroke();
                
                // Second level platform
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(towerX - 25, towerY + 160);
                ctx.lineTo(towerX + 25, towerY + 160);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(towerX - 20, towerY + 155);
                ctx.lineTo(towerX + 20, towerY + 155);
                ctx.stroke();
                
                // Third level platform
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(towerX - 15, towerY + 100);
                ctx.lineTo(towerX + 15, towerY + 100);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(towerX - 10, towerY + 95);
                ctx.lineTo(towerX + 10, towerY + 95);
                ctx.stroke();
                
                // Fourth level platform
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(towerX - 8, towerY + 40);
                ctx.lineTo(towerX + 8, towerY + 40);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(towerX - 4, towerY + 35);
                ctx.lineTo(towerX + 4, towerY + 35);
                ctx.stroke();
                
                // Cross-bracing and lattice work (creates see-through effect)
                ctx.strokeStyle = towerColor;
                ctx.lineWidth = 2;
                
                // Bottom section lattice
                for (let level = 0; level < 4; level++) {
                    const baseY = towerY + 220 - level * 40;
                    const topY = baseY - 40;
                    const leftX = towerX - 50 + level * 8;
                    const rightX = towerX + 50 - level * 8;
                    
                    // Diagonal cross-bracing
                    for (let i = 0; i < 5; i++) {
                        const segmentWidth = (rightX - leftX) / 5;
                        const x1 = leftX + i * segmentWidth;
                        const x2 = leftX + (i + 1) * segmentWidth;
                        
                        // X pattern cross-bracing
                        ctx.beginPath();
                        ctx.moveTo(x1, baseY);
                        ctx.lineTo(x2, topY);
                        ctx.stroke();
                        
                        ctx.beginPath();
                        ctx.moveTo(x2, baseY);
                        ctx.lineTo(x1, topY);
                        ctx.stroke();
                    }
                }
                
                // Vertical connecting struts
                ctx.lineWidth = 1;
                for (let i = 0; i < 3; i++) {
                    const x = towerX - 30 + i * 30;
                    ctx.beginPath();
                    ctx.moveTo(x, towerY + 220);
                    ctx.lineTo(x - 5 + i * 2, towerY + 160);
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.moveTo(x - 5 + i * 2, towerY + 160);
                    ctx.lineTo(x - 8 + i * 3, towerY + 100);
                    ctx.stroke();
                }
                
                // Antenna/spire
                ctx.strokeStyle = '#8B0000';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(towerX, towerY);
                ctx.lineTo(towerX, towerY - 25);
                ctx.stroke();
                
                // Radio antenna details
                ctx.lineWidth = 1;
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.moveTo(towerX - 2, towerY - 5 - i * 5);
                    ctx.lineTo(towerX + 2, towerY - 5 - i * 5);
                    ctx.stroke();
                }
                
                // Golden evening lighting effect
                ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
                ctx.beginPath();
                ctx.arc(towerX, towerY + 120, 70, 0, Math.PI * 2);
                ctx.fill();
                
                // Subtle shadow/depth effect for realism
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.lineWidth = 1;
                
                // Shadow lines to show depth
                ctx.beginPath();
                ctx.moveTo(towerX - 48, towerY + 218);
                ctx.lineTo(towerX - 23, towerY + 158);
                ctx.lineTo(towerX - 13, towerY + 98);
                ctx.lineTo(towerX - 6, towerY + 38);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(towerX + 48, towerY + 218);
                ctx.lineTo(towerX + 23, towerY + 158);
                ctx.lineTo(towerX + 13, towerY + 98);
                ctx.lineTo(towerX + 6, towerY + 38);
                ctx.stroke();
            },
            
            interact: function() {
                // Check hotel entry
                if (girl.x < 220 && girl.x + girl.width > 100 &&
                    girl.y < 300 && girl.y + girl.height > 280) {
                    game.currentScene = 'paris_hotel';
                    girl.x = 100;
                    girl.y = 350;
                    speechBubble.show('Welcome to Hôtel Paris! Très chic! 🏨✨');
                    return;
                }
                
                // Check return button
                if (girl.x < 150 && girl.x + girl.width > 50 &&
                    girl.y < 390 && girl.y + girl.height > 350) {
                    game.currentScene = 'outdoor';
                    girl.x = 600;
                    girl.y = 250;
                    speechBubble.show('Au revoir Paris! Back home safely!');
                }
            }
        },
        
        paris_hotel: {
            draw: function(ctx) {
                // Elegant hotel lobby background
                const gradient = ctx.createLinearGradient(0, 0, 0, game.canvas.height);
                gradient.addColorStop(0, '#F5F5DC'); // Beige ceiling
                gradient.addColorStop(0.3, '#FFFACD'); // Lemon chiffon walls
                gradient.addColorStop(1, '#8B4513'); // Brown marble floor
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
                
                // Elegant marble floor pattern
                ctx.fillStyle = '#A0522D';
                for (let x = 0; x < game.canvas.width; x += 80) {
                    for (let y = 300; y < game.canvas.height; y += 40) {
                        ctx.fillRect(x, y, 40, 20);
                    }
                }
                
                // Grand chandelier
                const chandelierX = 400;
                const chandelierY = 80;
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(chandelierX, chandelierY, 30, 0, Math.PI * 2);
                ctx.fill();
                
                // Chandelier crystals
                ctx.fillStyle = '#E0E0E0';
                for (let i = 0; i < 8; i++) {
                    const angle = (i * Math.PI * 2) / 8;
                    const x = chandelierX + Math.cos(angle) * 25;
                    const y = chandelierY + Math.sin(angle) * 25;
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Chandelier chain
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(chandelierX, 50);
                ctx.lineTo(chandelierX, chandelierY - 30);
                ctx.stroke();
                
                // Reception desk
                const deskX = 300;
                const deskY = 200;
                ctx.fillStyle = '#8B4513'; // Dark wood
                ctx.fillRect(deskX, deskY, 200, 60);
                ctx.fillStyle = '#D2691E'; // Wood top
                ctx.fillRect(deskX, deskY, 200, 15);
                
                // Reception sign
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(deskX + 60, deskY - 30, 80, 25);
                ctx.fillStyle = '#8B0000';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('RÉCEPTION', deskX + 100, deskY - 12);
                
                // Reception bell
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(deskX + 170, deskY + 30, 8, 0, Math.PI * 2);
                ctx.fill();
                
                // Elegant French furniture
                // Luxury armchair 1
                ctx.fillStyle = '#8B0000'; // Deep red velvet
                ctx.fillRect(120, 250, 50, 40);
                ctx.fillRect(115, 245, 60, 10); // Armrests
                ctx.fillRect(140, 230, 10, 20); // Back
                
                // Luxury armchair 2
                ctx.fillStyle = '#000080'; // Navy blue velvet
                ctx.fillRect(580, 250, 50, 40);
                ctx.fillRect(575, 245, 60, 10); // Armrests
                ctx.fillRect(600, 230, 10, 20); // Back
                
                // Coffee table
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(200, 275, 80, 40);
                ctx.fillStyle = '#D2691E';
                ctx.fillRect(200, 275, 80, 8);
                
                // Fresh flowers on table
                ctx.font = '20px Arial';
                ctx.fillText('🌹', 240, 270);
                
                // Grand staircase
                const stairX = 600;
                const stairY = 150;
                ctx.fillStyle = '#8B4513';
                for (let i = 0; i < 6; i++) {
                    ctx.fillRect(stairX, stairY + i * 15, 150 - i * 15, 15);
                }
                
                // Staircase banister
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(stairX + 150, stairY);
                ctx.lineTo(stairX + 60, stairY + 90);
                ctx.stroke();
                
                // Elegant wall art
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(50, 150, 60, 80);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(55, 155, 50, 70);
                ctx.fillStyle = '#8B0000';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Mona Lisa', 80, 200);
                ctx.font = '8px Arial';
                ctx.fillText('(Reproduction)', 80, 215);
                
                // French windows with view
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(450, 120, 80, 100);
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 3;
                ctx.strokeRect(450, 120, 80, 100);
                // Window cross
                ctx.beginPath();
                ctx.moveTo(490, 120);
                ctx.lineTo(490, 220);
                ctx.moveTo(450, 170);
                ctx.lineTo(530, 170);
                ctx.stroke();
                // Eiffel Tower view through window
                ctx.fillStyle = '#2F2F2F';
                ctx.font = '16px Arial';
                ctx.fillText('🗼', 490, 160);
                
                // Hotel services area
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(50, 50, 200, 80);
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 2;
                ctx.strokeRect(50, 50, 200, 80);
                
                ctx.fillStyle = '#8B0000';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Services de l\'Hôtel', 150, 70);
                ctx.font = '10px Arial';
                ctx.textAlign = 'left';
                ctx.fillText('🛎️ Concierge Service', 60, 90);
                ctx.fillText('🍽️ Restaurant Français', 60, 105);
                ctx.fillText('🛁 Luxury Spa', 60, 120);
                
                // Interaction hint at reception
                if (girl.x < deskX + 200 && girl.x + girl.width > deskX &&
                    girl.y < deskY + 60 && girl.y + girl.height > deskY) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.fillRect(deskX + 20, deskY - 50, 160, 15);
                    ctx.fillStyle = 'black';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('Press SPACE for hotel services', deskX + 100, deskY - 40);
                }
                
                // Exit door
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(50, 350, 60, 50);
                ctx.fillStyle = '#D2691E';
                ctx.fillRect(55, 355, 50, 40);
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(95, 375, 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Exit hint
                if (girl.x < 110 && girl.x + girl.width > 50 &&
                    girl.y < 400 && girl.y + girl.height > 350) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.fillRect(60, 320, 80, 15);
                    ctx.fillStyle = 'black';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('Exit to Paris', 100, 332);
                }
                
                // Title
                ctx.fillStyle = '#8B0000';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Hôtel Paris - Lobby 🏨', 400, 30);
            },
            
            interact: function() {
                // Reception interaction
                if (girl.x < 500 && girl.x + girl.width > 300 &&
                    girl.y < 260 && girl.y + girl.height > 200) {
                    const services = [
                        'Bonjour! Welcome to Hôtel Paris! 🇫🇷',
                        'Would you like our French pastry breakfast? 🥐',
                        'Our concierge can arrange Louvre tickets! 🎨',
                        'The hotel spa offers lavender treatments! 🌿',
                        'Bon séjour! Enjoy your stay in Paris! ✨'
                    ];
                    const randomService = services[Math.floor(Math.random() * services.length)];
                    speechBubble.show(randomService);
                    return;
                }
                
                // Exit hotel
                if (girl.x < 110 && girl.x + girl.width > 50 &&
                    girl.y < 400 && girl.y + girl.height > 350) {
                    game.currentScene = 'paris';
                    girl.x = 160;
                    girl.y = 280;
                    speechBubble.show('Back to the beautiful streets of Paris!');
                }
            }
        },
        
        rainforest: {
            trees: [ // Static tree positions to prevent shaking
                {x: 50, y: 170}, {x: 150, y: 160}, {x: 250, y: 180}, {x: 350, y: 165},
                {x: 450, y: 175}, {x: 550, y: 155}, {x: 650, y: 185}, {x: 750, y: 170}
            ],
            
            animals: [
                // Monkeys - they move and can steal fruit
                {type: '🐒', x: 200, y: 140, size: 45, speed: 0.8, direction: 1, behavior: 'monkey', 
                 targetX: 200, range: 100, wantsFood: true},
                {type: '🐒', x: 450, y: 135, size: 45, speed: 0.6, direction: -1, behavior: 'monkey', 
                 targetX: 450, range: 120, wantsFood: true},
                {type: '🐒', x: 650, y: 145, size: 45, speed: 0.7, direction: 1, behavior: 'monkey', 
                 targetX: 650, range: 80, wantsFood: true},
                 
                // Flying birds
                {type: '🦜', x: 350, y: 120, size: 40, speed: 1.2, direction: 1, behavior: 'bird', 
                 targetX: 350, range: 200},
                {type: '🦅', x: 550, y: 110, size: 40, speed: 1.5, direction: -1, behavior: 'bird', 
                 targetX: 550, range: 150},
                {type: '🐦', x: 100, y: 130, size: 35, speed: 1.0, direction: 1, behavior: 'bird', 
                 targetX: 100, range: 100},
                 
                // Ground animals
                {type: '🐅', x: 300, y: 280, size: 50, speed: 0.5, direction: 1, behavior: 'prowl', 
                 targetX: 300, range: 150},
                {type: '🐆', x: 600, y: 290, size: 45, speed: 0.6, direction: -1, behavior: 'prowl', 
                 targetX: 600, range: 100},
                {type: '🦌', x: 150, y: 270, size: 40, speed: 0.4, direction: 1, behavior: 'graze', 
                 targetX: 150, range: 80},
                {type: '🐗', x: 500, y: 285, size: 40, speed: 0.3, direction: -1, behavior: 'root', 
                 targetX: 500, range: 60},
                {type: '🐸', x: 250, y: 300, size: 30, speed: 0.2, direction: 1, behavior: 'hop', 
                 targetX: 250, range: 40, hopTimer: 0},
                {type: '🦎', x: 400, y: 295, size: 35, speed: 0.8, direction: 1, behavior: 'dart', 
                 targetX: 400, range: 70, dartTimer: 0},
                 
                // River animals
                {type: '🐊', x: 200, y: 325, size: 50, speed: 0.3, direction: 1, behavior: 'swim', 
                 targetX: 200, range: 200},
                {type: '🐢', x: 400, y: 328, size: 35, speed: 0.1, direction: -1, behavior: 'swim', 
                 targetX: 400, range: 100},
                {type: '🐠', x: 600, y: 322, size: 25, speed: 1.0, direction: 1, behavior: 'swim', 
                 targetX: 600, range: 150}
            ],
            
            butterflies: [
                {x: 180, y: 180, size: 25, speed: 0.5, direction: Math.PI/4, flutterTimer: 0, 
                 landedOnGirl: false, landTimer: 0},
                {x: 420, y: 190, size: 25, speed: 0.6, direction: Math.PI/3, flutterTimer: 0, 
                 landedOnGirl: false, landTimer: 0},
                {x: 620, y: 175, size: 25, speed: 0.4, direction: Math.PI/6, flutterTimer: 0, 
                 landedOnGirl: false, landTimer: 0}
            ],
            
            girlStillTimer: 0,
            girlLastX: 0,
            girlLastY: 0,
            
            update: function() {
                // Track if girl is moving
                if (girl.x === this.girlLastX && girl.y === this.girlLastY) {
                    this.girlStillTimer++;
                } else {
                    this.girlStillTimer = 0;
                    // Make butterflies fly away when girl moves
                    this.butterflies.forEach(butterfly => {
                        if (butterfly.landedOnGirl) {
                            butterfly.landedOnGirl = false;
                            butterfly.landTimer = 0;
                        }
                    });
                }
                this.girlLastX = girl.x;
                this.girlLastY = girl.y;
                
                // Update animals
                this.animals.forEach(animal => {
                    this.updateAnimal(animal);
                    
                    // Check for fruit stealing by monkeys
                    if (animal.behavior === 'monkey' && animal.wantsFood && girl.heldItem) {
                        const fruitItems = ['apple', 'orange', 'banana'];
                        if (fruitItems.includes(girl.heldItem.name.toLowerCase())) {
                            const dist = Math.sqrt((animal.x - girl.x) ** 2 + (animal.y - girl.y) ** 2);
                            if (dist < 60) {
                                speechBubble.show(`The monkey stole your ${girl.heldItem.name}! 🐒`);
                                girl.heldItem = null;
                                animal.wantsFood = false;
                                setTimeout(() => { animal.wantsFood = true; }, 10000); // Reset after 10 seconds
                            }
                        }
                    }
                });
                
                // Update butterflies
                this.butterflies.forEach(butterfly => {
                    this.updateButterfly(butterfly);
                });
            },
            
            updateAnimal: function(animal) {
                // Different behaviors for different animals
                switch(animal.behavior) {
                    case 'monkey':
                        // Swing back and forth in trees
                        animal.x += animal.speed * animal.direction;
                        if (animal.x > animal.targetX + animal.range || animal.x < animal.targetX - animal.range) {
                            animal.direction *= -1;
                        }
                        break;
                        
                    case 'bird':
                        // Fly in patterns
                        animal.x += animal.speed * animal.direction;
                        animal.y += Math.sin(animal.x * 0.01) * 0.5;
                        if (animal.x > animal.targetX + animal.range || animal.x < animal.targetX - animal.range) {
                            animal.direction *= -1;
                        }
                        break;
                        
                    case 'prowl':
                        // Predators prowl slowly
                        animal.x += animal.speed * animal.direction;
                        if (animal.x > animal.targetX + animal.range || animal.x < animal.targetX - animal.range) {
                            animal.direction *= -1;
                        }
                        break;
                        
                    case 'graze':
                        // Grazers move slowly, pause sometimes
                        if (Math.random() < 0.98) { // Move 98% of the time
                            animal.x += animal.speed * animal.direction;
                        }
                        if (animal.x > animal.targetX + animal.range || animal.x < animal.targetX - animal.range) {
                            animal.direction *= -1;
                        }
                        break;
                        
                    case 'hop':
                        // Frogs hop occasionally
                        animal.hopTimer++;
                        if (animal.hopTimer > 60) { // Hop every 60 frames
                            animal.x += animal.speed * animal.direction * 10; // Big hop
                            animal.hopTimer = 0;
                            if (animal.x > animal.targetX + animal.range || animal.x < animal.targetX - animal.range) {
                                animal.direction *= -1;
                            }
                        }
                        break;
                        
                    case 'dart':
                        // Lizards dart quickly then stop
                        animal.dartTimer++;
                        if (animal.dartTimer < 20) { // Dart for 20 frames
                            animal.x += animal.speed * animal.direction * 2;
                        } else if (animal.dartTimer > 80) { // Then wait 60 frames
                            animal.dartTimer = 0;
                            if (Math.random() < 0.3) animal.direction *= -1; // Sometimes change direction
                        }
                        if (animal.x > animal.targetX + animal.range || animal.x < animal.targetX - animal.range) {
                            animal.direction *= -1;
                        }
                        break;
                        
                    case 'swim':
                        // Swimming animals move smoothly
                        animal.x += animal.speed * animal.direction;
                        animal.y += Math.sin(animal.x * 0.02) * 0.3; // Gentle bobbing
                        if (animal.x > animal.targetX + animal.range || animal.x < animal.targetX - animal.range) {
                            animal.direction *= -1;
                        }
                        break;
                }
            },
            
            updateButterfly: function(butterfly) {
                if (butterfly.landedOnGirl) {
                    // Butterfly landed on girl
                    butterfly.x = girl.x + girl.width/2;
                    butterfly.y = girl.y - 20;
                    butterfly.landTimer++;
                    if (butterfly.landTimer > 180) { // Fly away after 3 seconds
                        butterfly.landedOnGirl = false;
                        butterfly.landTimer = 0;
                    }
                } else {
                    // Normal butterfly flight
                    butterfly.flutterTimer++;
                    
                    // Change direction occasionally
                    if (butterfly.flutterTimer % 120 === 0) {
                        butterfly.direction += (Math.random() - 0.5) * Math.PI/2;
                    }
                    
                    // Flutter movement
                    butterfly.x += Math.cos(butterfly.direction) * butterfly.speed;
                    butterfly.y += Math.sin(butterfly.direction) * butterfly.speed + Math.sin(butterfly.flutterTimer * 0.1) * 0.5;
                    
                    // Keep butterflies in bounds
                    if (butterfly.x < 50 || butterfly.x > game.canvas.width - 50) {
                        butterfly.direction = Math.PI - butterfly.direction;
                    }
                    if (butterfly.y < 100 || butterfly.y > 250) {
                        butterfly.direction = -butterfly.direction;
                    }
                    
                    // Check if girl is still and butterfly can land
                    if (this.girlStillTimer > 120 && !butterfly.landedOnGirl) { // Girl still for 2 seconds
                        const dist = Math.sqrt((butterfly.x - girl.x) ** 2 + (butterfly.y - girl.y) ** 2);
                        if (dist < 80 && Math.random() < 0.02) { // 2% chance per frame when close
                            butterfly.landedOnGirl = true;
                            butterfly.landTimer = 0;
                            speechBubble.show('A beautiful butterfly landed on you! 🦋 Stay still!');
                        }
                    }
                }
            },
            
            draw: function(ctx) {
                // Rainforest background - gradient from dark to light green
                const gradient = ctx.createLinearGradient(0, 0, 0, game.canvas.height);
                gradient.addColorStop(0, '#004225'); // Darker green for deep jungle
                gradient.addColorStop(0.5, '#1B5E20'); // Forest green
                gradient.addColorStop(1, '#2E7D32'); // Lime green
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
                
                // Add dappled sunlight/shade effect
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                for (let i = 0; i < 8; i++) {
                    const x = i * 100 + Math.sin(i) * 30;
                    const y = i * 40 + 50;
                    ctx.beginPath();
                    ctx.ellipse(x, y, 40, 80, Math.PI/6, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Heavy canopy shade patches
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                for (let i = 0; i < 6; i++) {
                    const x = i * 130 + 65;
                    const y = 60 + Math.sin(i) * 20;
                    ctx.beginPath();
                    ctx.ellipse(x, y, 60, 40, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Draw static trees with enhanced canopy
                this.trees.forEach(tree => {
                    // Tree trunk - larger and more detailed
                    ctx.fillStyle = '#654321'; // Darker brown trunk
                    ctx.fillRect(tree.x, tree.y, 25, 120);
                    
                    // Tree texture
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(tree.x + 2, tree.y + 10, 3, 100);
                    ctx.fillRect(tree.x + 20, tree.y + 20, 3, 80);
                    
                    // Large tree crown - multiple layers for thick canopy
                    ctx.fillStyle = '#1B5E20'; // Very dark green base
                    ctx.beginPath();
                    ctx.arc(tree.x + 12, tree.y, 60, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.fillStyle = '#2E7D32'; // Medium green middle
                    ctx.beginPath();
                    ctx.arc(tree.x + 12, tree.y - 10, 50, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.fillStyle = '#4CAF50'; // Bright green top
                    ctx.beginPath();
                    ctx.arc(tree.x + 12, tree.y - 15, 40, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Many more hanging vines
                    ctx.strokeStyle = '#2E7D32';
                    ctx.lineWidth = 4;
                    // Main vine
                    ctx.beginPath();
                    ctx.moveTo(tree.x + 15, tree.y + 20);
                    ctx.quadraticCurveTo(tree.x + 35, tree.y + 60, tree.x + 25, tree.y + 120);
                    ctx.stroke();
                    
                    // Secondary vines
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(tree.x + 5, tree.y + 30);
                    ctx.quadraticCurveTo(tree.x - 10, tree.y + 70, tree.x + 5, tree.y + 110);
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.moveTo(tree.x + 20, tree.y + 25);
                    ctx.quadraticCurveTo(tree.x + 40, tree.y + 65, tree.x + 30, tree.y + 105);
                    ctx.stroke();
                    
                    // Thin vine tendrils
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#388E3C';
                    for (let v = 0; v < 3; v++) {
                        ctx.beginPath();
                        ctx.moveTo(tree.x + 8 + v * 6, tree.y + 35);
                        ctx.quadraticCurveTo(tree.x + 12 + v * 8, tree.y + 75, tree.x + 10 + v * 5, tree.y + 100);
                        ctx.stroke();
                    }
                });
                
                // Additional hanging vines between trees
                ctx.strokeStyle = '#2E7D32';
                ctx.lineWidth = 5;
                for (let i = 0; i < 5; i++) {
                    const x = 120 + i * 150;
                    ctx.beginPath();
                    ctx.moveTo(x, 80);
                    ctx.quadraticCurveTo(x + 20, 150, x + 10, 280);
                    ctx.stroke();
                    
                    // Add vine leaves
                    ctx.fillStyle = '#4CAF50';
                    for (let leaf = 0; leaf < 4; leaf++) {
                        const leafY = 100 + leaf * 40;
                        ctx.beginPath();
                        ctx.ellipse(x + 15, leafY, 8, 12, Math.PI/4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                
                // Dense jungle floor vegetation
                ctx.fillStyle = '#1B5E20'; // Dark green undergrowth
                for (let i = 0; i < 30; i++) {
                    const x = i * 25 + 10;
                    const y = 270 + (i % 4) * 8;
                    // Large ferns
                    ctx.fillRect(x, y, 12, 30);
                    ctx.fillRect(x + 15, y + 8, 8, 22);
                    ctx.fillRect(x + 25, y + 5, 10, 25);
                }
                
                // River with realistic water
                ctx.fillStyle = '#1565C0'; // Deeper blue for jungle river
                ctx.fillRect(0, 310, game.canvas.width, 35);
                // Water ripples
                ctx.strokeStyle = '#42A5F5';
                ctx.lineWidth = 1;
                for (let i = 0; i < 10; i++) {
                    ctx.beginPath();
                    ctx.arc(i * 80 + 40, 325, 15, 0, Math.PI);
                    ctx.stroke();
                }
                
                // Draw moving animals with bigger sizes
                ctx.textAlign = 'center';
                this.animals.forEach(animal => {
                    ctx.font = `${animal.size}px Arial`;
                    ctx.fillText(animal.type, animal.x, animal.y);
                });
                
                // Draw butterflies
                this.butterflies.forEach(butterfly => {
                    ctx.font = `${butterfly.size}px Arial`;
                    ctx.fillText('🦋', butterfly.x, butterfly.y);
                });
                
                // Additional small flying insects
                ctx.font = '15px Arial';
                ctx.fillText('🐝', 320, 165); // Bee
                
                // Return button
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(50, 350, 100, 40);
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 2;
                ctx.strokeRect(50, 350, 100, 40);
                ctx.fillStyle = 'black';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('RETURN HOME', 100, 375);
                
                // Title
                ctx.fillStyle = 'white';
                ctx.font = '24px Arial';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
                ctx.strokeText('Amazon Rainforest! 🌳', 400, 40);
                ctx.fillText('Amazon Rainforest! 🌳', 400, 40);
                
                // Animal sounds text
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(550, 60, 200, 80);
                ctx.fillStyle = 'green';
                ctx.font = '10px Arial';
                ctx.textAlign = 'left';
                ctx.fillText('Listen! The jungle is alive:', 560, 80);
                ctx.fillText('🐒 "Ooh ooh ah ah!"', 560, 95);
                ctx.fillText('🦜 "Squawk squawk!"', 560, 110);
                ctx.fillText('🐅 "Roaaaaar!"', 560, 125);
            },
            
            interact: function() {
                if (girl.x < 150 && girl.x + girl.width > 50 &&
                    girl.y < 390 && girl.y + girl.height > 350) {
                    game.currentScene = 'outdoor';
                    girl.x = 600;
                    girl.y = 250;
                    speechBubble.show('Back home from the amazing rainforest!');
                }
            }
        },
        
        nyc: {
            windowPattern: null, // Static window pattern to prevent flashing
            
            init: function() {
                // Generate static window pattern once
                this.windowPattern = [];
                const buildings = [
                    {x: 100, y: 50, w: 80, h: 300, color: '#708090', type: 'office'},
                    {x: 200, y: 100, w: 60, h: 250, color: '#2F4F4F', type: 'hotel'},
                    {x: 280, y: 80, w: 70, h: 270, color: '#696969', type: 'apartment'},
                    {x: 370, y: 60, w: 90, h: 290, color: '#778899', type: 'office'},
                    {x: 480, y: 90, w: 75, h: 260, color: '#708090', type: 'restaurant'},
                    {x: 570, y: 70, w: 85, h: 280, color: '#2F4F4F', type: 'office'}
                ];
                
                buildings.forEach((building, buildingIndex) => {
                    this.windowPattern[buildingIndex] = [];
                    for (let row = 0; row < building.h / 20; row++) {
                        this.windowPattern[buildingIndex][row] = [];
                        for (let col = 0; col < building.w / 15; col++) {
                            // Create static pattern - most windows lit, some dark
                            this.windowPattern[buildingIndex][row][col] = Math.random() > 0.25;
                        }
                    }
                });
            },
            
            draw: function(ctx) {
                // Initialize pattern if not done
                if (!this.windowPattern) {
                    this.init();
                }
                
                // NYC background - evening sky gradient
                const gradient = ctx.createLinearGradient(0, 0, 0, game.canvas.height);
                gradient.addColorStop(0, '#191970'); // Midnight blue
                gradient.addColorStop(0.7, '#4169E1'); // Royal blue
                gradient.addColorStop(1, '#87CEEB'); // Sky blue
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
                
                // City lights glow
                ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
                ctx.fillRect(0, game.canvas.height - 100, game.canvas.width, 100);
                
                // Skyscrapers with static windows
                const buildings = [
                    {x: 100, y: 50, w: 80, h: 300, color: '#708090', type: 'office', name: 'Office Tower'},
                    {x: 200, y: 100, w: 60, h: 250, color: '#2F4F4F', type: 'hotel', name: 'NYC Hotel'},
                    {x: 280, y: 80, w: 70, h: 270, color: '#696969', type: 'apartment', name: 'Apartments'},
                    {x: 370, y: 60, w: 90, h: 290, color: '#778899', type: 'office', name: 'Corp Building'},
                    {x: 480, y: 90, w: 75, h: 260, color: '#708090', type: 'restaurant', name: 'Food Court'},
                    {x: 570, y: 70, w: 85, h: 280, color: '#2F4F4F', type: 'office', name: 'Finance Tower'}
                ];
                
                buildings.forEach((building, buildingIndex) => {
                    // Building body
                    ctx.fillStyle = building.color;
                    ctx.fillRect(building.x, building.y, building.w, building.h);
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(building.x, building.y, building.w, building.h);
                    
                    // Static windows
                    if (this.windowPattern[buildingIndex]) {
                        for (let row = 0; row < building.h / 20; row++) {
                            for (let col = 0; col < building.w / 15; col++) {
                                if (this.windowPattern[buildingIndex][row] && this.windowPattern[buildingIndex][row][col]) {
                                    ctx.fillStyle = '#FFD700'; // Lit window
                                } else {
                                    ctx.fillStyle = '#4169E1'; // Dark window
                                }
                                ctx.fillRect(building.x + col * 15 + 2, building.y + row * 20 + 2, 10, 12);
                            }
                        }
                    }
                    
                    // Building entrance
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(building.x + building.w/2 - 10, building.y + building.h - 20, 20, 20);
                    
                    // Building sign
                    if (building.type === 'hotel') {
                        ctx.fillStyle = '#FF1493'; // Hot pink for hotel
                        ctx.fillRect(building.x + 5, building.y + 20, building.w - 10, 25);
                        ctx.fillStyle = 'white';
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('HOTEL NYC', building.x + building.w/2, building.y + 37);
                    } else if (building.type === 'restaurant') {
                        ctx.fillStyle = '#FF6347'; // Tomato for restaurant
                        ctx.fillRect(building.x + 5, building.y + 20, building.w - 10, 25);
                        ctx.fillStyle = 'white';
                        ctx.font = '10px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('FOOD COURT', building.x + building.w/2, building.y + 37);
                    }
                    
                    // Entrance interaction hint
                    if (girl.x < building.x + building.w &&
                        girl.x + girl.width > building.x &&
                        girl.y < building.y + building.h &&
                        girl.y + girl.height > building.y + building.h - 30) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                        ctx.fillRect(building.x - 10, building.y + building.h - 60, building.w + 20, 15);
                        ctx.fillStyle = 'black';
                        ctx.font = '10px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(`Press SPACE: Enter ${building.name}`, building.x + building.w/2, building.y + building.h - 50);
                    }
                });
                
                // Street level details
                ctx.fillStyle = '#696969'; // Gray street
                ctx.fillRect(0, game.canvas.height - 50, game.canvas.width, 50);
                
                // Street lamps
                for (let i = 0; i < 4; i++) {
                    const lampX = 150 + i * 150;
                    ctx.fillStyle = '#2F2F2F';
                    ctx.fillRect(lampX, game.canvas.height - 80, 5, 30);
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(lampX + 2.5, game.canvas.height - 80, 8, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Yellow taxi
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(350, game.canvas.height - 45, 60, 25);
                ctx.fillStyle = '#000';
                ctx.fillRect(355, game.canvas.height - 35, 50, 10);
                ctx.font = '8px Arial';
                ctx.fillText('TAXI', 375, game.canvas.height - 27);
                
                // Return button
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(50, 350, 100, 40);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeRect(50, 350, 100, 40);
                ctx.fillStyle = 'black';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('RETURN HOME', 100, 375);
                
                // Title
                ctx.fillStyle = 'white';
                ctx.font = '24px Arial';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
                ctx.strokeText('New York City! 🏙️', 400, 30);
                ctx.fillText('New York City! 🏙️', 400, 30);
            },
            
            interact: function() {
                // Check building entrances
                const buildings = [
                    {x: 100, y: 50, w: 80, h: 300, type: 'office', scene: 'nyc_office'},
                    {x: 200, y: 100, w: 60, h: 250, type: 'hotel', scene: 'nyc_hotel'},
                    {x: 280, y: 80, w: 70, h: 270, type: 'apartment', scene: 'nyc_apartment'},
                    {x: 370, y: 60, w: 90, h: 290, type: 'office', scene: 'nyc_office2'},
                    {x: 480, y: 90, w: 75, h: 260, type: 'restaurant', scene: 'nyc_restaurant'},
                    {x: 570, y: 70, w: 85, h: 280, type: 'office', scene: 'nyc_office3'}
                ];
                
                for (let building of buildings) {
                    if (girl.x < building.x + building.w &&
                        girl.x + girl.width > building.x &&
                        girl.y < building.y + building.h &&
                        girl.y + girl.height > building.y + building.h - 30) {
                        
                        if (building.type === 'hotel') {
                            game.currentScene = 'nyc_hotel';
                            girl.x = 100;
                            girl.y = 300;
                            speechBubble.show('Welcome to Hotel NYC! 🏨');
                        } else if (building.type === 'restaurant') {
                            game.currentScene = 'nyc_restaurant';
                            girl.x = 100;
                            girl.y = 300;
                            speechBubble.show('Welcome to NYC Food Court! 🍕');
                        } else {
                            speechBubble.show('This building is closed for now. Try the hotel or restaurant!');
                        }
                        return;
                    }
                }
                
                // Check return button
                if (girl.x < 150 && girl.x + girl.width > 50 &&
                    girl.y < 390 && girl.y + girl.height > 350) {
                    game.currentScene = 'outdoor';
                    girl.x = 600;
                    girl.y = 250;
                    speechBubble.show('Goodbye Big Apple! Back home!');
                }
            }
        },
        
        nyc_hotel: {
            draw: function(ctx) {
                // Hotel lobby background
                ctx.fillStyle = '#F5F5DC'; // Beige
                ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
                
                // Marble floor pattern
                ctx.fillStyle = '#E0E0E0';
                for (let x = 0; x < game.canvas.width; x += 50) {
                    for (let y = 0; y < game.canvas.height; y += 50) {
                        ctx.fillRect(x, y, 25, 25);
                    }
                }
                
                // Reception desk
                ctx.fillStyle = '#8B4513'; // Brown wood
                ctx.fillRect(300, 200, 200, 80);
                ctx.fillStyle = '#DAA520'; // Gold trim
                ctx.fillRect(295, 195, 210, 90);
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(300, 200, 200, 80);
                
                // Reception sign
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(350, 150, 100, 40);
                ctx.fillStyle = 'black';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('RECEPTION', 400, 175);
                
                // Hotel receptionist
                ctx.fillStyle = '#FFB6C1'; // Pink face
                ctx.fillRect(390, 180, 20, 25);
                ctx.fillStyle = '#000080'; // Navy uniform
                ctx.fillRect(385, 205, 30, 40);
                ctx.fillStyle = 'black';
                ctx.font = '10px Arial';
                ctx.fillText('👩‍💼', 400, 220);
                
                // Fancy chandelier
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(400, 100, 40, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFF8DC';
                for (let i = 0; i < 8; i++) {
                    const angle = (i * Math.PI * 2) / 8;
                    const x = 400 + Math.cos(angle) * 30;
                    const y = 100 + Math.sin(angle) * 30;
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Elevator
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(100, 150, 60, 100);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                ctx.strokeRect(100, 150, 60, 100);
                ctx.fillStyle = 'black';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('ELEVATOR', 130, 205);
                ctx.font = '20px Arial';
                ctx.fillText('🛗', 130, 180);
                
                // Luxury seating area
                ctx.fillStyle = '#8B0000'; // Dark red velvet
                ctx.fillRect(550, 250, 80, 40); // Sofa
                ctx.fillRect(550, 200, 80, 40); // Another sofa
                ctx.fillStyle = '#DAA520';
                ctx.fillRect(580, 240, 20, 30); // Coffee table
                
                // Plants
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(200, 300, 15, 30);
                ctx.fillStyle = '#228B22';
                ctx.beginPath();
                ctx.arc(207, 290, 20, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(680, 180, 15, 30);
                ctx.fillStyle = '#228B22';
                ctx.beginPath();
                ctx.arc(687, 170, 20, 0, Math.PI * 2);
                ctx.fill();
                
                // Hotel services sign
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(50, 50, 200, 120);
                ctx.strokeStyle = '#DAA520';
                ctx.lineWidth = 3;
                ctx.strokeRect(50, 50, 200, 120);
                
                ctx.fillStyle = 'black';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('HOTEL NYC SERVICES', 150, 75);
                ctx.font = '10px Arial';
                ctx.textAlign = 'left';
                ctx.fillText('🛏️ Luxury Rooms', 60, 95);
                ctx.fillText('🍽️ Room Service', 60, 110);
                ctx.fillText('🏊 Pool & Spa', 60, 125);
                ctx.fillText('🅿️ Valet Parking', 60, 140);
                ctx.fillText('🎭 Broadway Tickets', 60, 155);
                
                // Exit button
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(650, 350, 100, 40);
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 2;
                ctx.strokeRect(650, 350, 100, 40);
                ctx.fillStyle = 'black';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('EXIT HOTEL', 700, 375);
                
                // Interaction hint for reception
                if (girl.x < 500 && girl.x + girl.width > 300 &&
                    girl.y < 280 && girl.y + girl.height > 200) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.fillRect(350, 120, 100, 15);
                    ctx.fillStyle = 'black';
                    ctx.font = '10px Arial';
                    ctx.fillText('Press SPACE to check in', 400, 132);
                }
            },
            
            interact: function() {
                // Reception interaction
                if (girl.x < 500 && girl.x + girl.width > 300 &&
                    girl.y < 280 && girl.y + girl.height > 200) {
                    speechBubble.show('Welcome to Hotel NYC! Enjoy your stay in the Big Apple! 🗽');
                    return;
                }
                
                // Exit hotel
                if (girl.x < 750 && girl.x + girl.width > 650 &&
                    girl.y < 390 && girl.y + girl.height > 350) {
                    game.currentScene = 'nyc';
                    girl.x = 230;
                    girl.y = 320;
                    speechBubble.show('Back to the NYC streets!');
                }
            }
        },
        
        nyc_restaurant: {
            draw: function(ctx) {
                // Restaurant background
                ctx.fillStyle = '#FFF8DC'; // Cornsilk
                ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
                
                // Checkered floor
                for (let x = 0; x < game.canvas.width; x += 40) {
                    for (let y = 0; y < game.canvas.height; y += 40) {
                        ctx.fillStyle = ((x + y) / 40) % 2 === 0 ? '#000' : '#FFF';
                        ctx.fillRect(x, y, 40, 40);
                    }
                }
                
                // Food counter
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(200, 150, 400, 60);
                ctx.fillStyle = '#FF6347';
                ctx.fillRect(195, 145, 410, 70);
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(200, 150, 400, 60);
                
                // Food display
                ctx.font = '30px Arial';
                ctx.fillText('🍕', 230, 185);
                ctx.fillText('🍔', 280, 185);
                ctx.fillText('🌭', 330, 185);
                ctx.fillText('🍟', 380, 185);
                ctx.fillText('🥤', 430, 185);
                ctx.fillText('🍰', 480, 185);
                ctx.fillText('🍪', 530, 185);
                
                // Restaurant sign
                ctx.fillStyle = '#FF6347';
                ctx.fillRect(300, 100, 200, 40);
                ctx.fillStyle = 'white';
                ctx.font = '18px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('NYC FOOD COURT', 400, 125);
                
                // Food worker
                ctx.fillStyle = '#FFB6C1'; // Pink face
                ctx.fillRect(390, 120, 20, 25);
                ctx.fillStyle = '#FFFFFF'; // White uniform
                ctx.fillRect(385, 145, 30, 40);
                ctx.fillStyle = 'black';
                ctx.font = '10px Arial';
                ctx.fillText('👨‍🍳', 400, 160);
                
                // Tables and chairs
                const tables = [
                    {x: 100, y: 250},
                    {x: 300, y: 280},
                    {x: 500, y: 250},
                    {x: 650, y: 280}
                ];
                
                tables.forEach(table => {
                    // Table
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(table.x, table.y, 60, 40);
                    // Chairs
                    ctx.fillStyle = '#DAA520';
                    ctx.fillRect(table.x - 15, table.y + 10, 15, 20);
                    ctx.fillRect(table.x + 60, table.y + 10, 15, 20);
                });
                
                // Menu board
                ctx.fillStyle = '#000';
                ctx.fillRect(50, 50, 150, 180);
                ctx.fillStyle = 'white';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('MENU', 125, 75);
                ctx.font = '10px Arial';
                ctx.textAlign = 'left';
                ctx.fillText('🍕 Pizza Slice - $3', 60, 100);
                ctx.fillText('🍔 Burger - $8', 60, 120);
                ctx.fillText('🌭 Hot Dog - $5', 60, 140);
                ctx.fillText('🍟 Fries - $4', 60, 160);
                ctx.fillText('🥤 Soda - $2', 60, 180);
                ctx.fillText('🍰 Cake - $6', 60, 200);
                ctx.fillText('🍪 Cookie - $3', 60, 220);
                
                // NYC skyline view through window
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(650, 50, 150, 120);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                ctx.strokeRect(650, 50, 150, 120);
                ctx.fillStyle = '#696969';
                ctx.fillRect(670, 80, 20, 80);
                ctx.fillRect(700, 70, 25, 90);
                ctx.fillRect(730, 90, 18, 70);
                ctx.fillRect(755, 75, 22, 85);
                
                // Exit button
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(650, 350, 100, 40);
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 2;
                ctx.strokeRect(650, 350, 100, 40);
                ctx.fillStyle = 'black';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('EXIT RESTAURANT', 700, 375);
                
                // Interaction hint for food counter
                if (girl.x < 600 && girl.x + girl.width > 200 &&
                    girl.y < 210 && girl.y + girl.height > 150) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.fillRect(350, 230, 100, 15);
                    ctx.fillStyle = 'black';
                    ctx.font = '10px Arial';
                    ctx.fillText('Press SPACE to order', 400, 242);
                }
            },
            
            interact: function() {
                // Food counter interaction
                if (girl.x < 600 && girl.x + girl.width > 200 &&
                    girl.y < 210 && girl.y + girl.height > 150) {
                    const foods = ['pizza slice 🍕', 'burger 🍔', 'hot dog 🌭', 'fries 🍟', 'cake 🍰'];
                    const randomFood = foods[Math.floor(Math.random() * foods.length)];
                    speechBubble.show(`Here's your ${randomFood}! Enjoy your NYC meal!`);
                    return;
                }
                
                // Exit restaurant
                if (girl.x < 750 && girl.x + girl.width > 650 &&
                    girl.y < 390 && girl.y + girl.height > 350) {
                    game.currentScene = 'nyc';
                    girl.x = 520;
                    girl.y = 320;
                    speechBubble.show('Back to the busy NYC streets!');
                }
            }
        },
        
        unicornland: {
            draw: function(ctx) {
                // Rainbow background
                const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
                for (let i = 0; i < colors.length; i++) {
                    ctx.fillStyle = colors[i];
                    ctx.fillRect(0, i * game.canvas.height / colors.length, game.canvas.width, game.canvas.height / colors.length);
                }
                
                // Clouds
                ctx.fillStyle = 'white';
                for (let i = 0; i < 6; i++) {
                    const x = i * 120 + 60;
                    const y = 100 + Math.sin(i) * 50;
                    ctx.beginPath();
                    ctx.arc(x, y, 30, 0, Math.PI * 2);
                    ctx.arc(x + 20, y, 35, 0, Math.PI * 2);
                    ctx.arc(x + 40, y, 30, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Full unicorns with custom art
                this.drawUnicorn(ctx, 200, 220);
                this.drawUnicorn(ctx, 400, 250);
                this.drawUnicorn(ctx, 600, 230);
                
                // Rainbows and stars
                ctx.font = '40px Arial';
                ctx.fillText('🌈', 100, 200);
                ctx.fillText('🌈', 500, 180);
                ctx.fillText('⭐', 150, 150);
                ctx.fillText('⭐', 350, 170);
                ctx.fillText('⭐', 550, 140);
                
                // Return button
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(50, 350, 100, 40);
                ctx.fillStyle = 'black';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('RETURN HOME', 100, 375);
                
                ctx.fillStyle = 'white';
                ctx.font = '24px Arial';
                ctx.fillText('Rainbow Unicorn Land! 🦄🌈', 400, 50);
            },
            
            drawUnicorn: function(ctx, x, y) {
                // Unicorn body
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.ellipse(x, y, 35, 20, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#E0E0E0';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Unicorn legs
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x - 25, y + 15, 8, 25);
                ctx.fillRect(x - 10, y + 15, 8, 25);
                ctx.fillRect(x + 5, y + 15, 8, 25);
                ctx.fillRect(x + 20, y + 15, 8, 25);
                
                // Unicorn neck
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.ellipse(x - 30, y - 10, 15, 25, 0.3, 0, Math.PI * 2);
                ctx.fill();
                
                // Unicorn head
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.ellipse(x - 40, y - 25, 20, 15, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Unicorn horn (magical!)
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.moveTo(x - 40, y - 40);
                ctx.lineTo(x - 35, y - 25);
                ctx.lineTo(x - 45, y - 25);
                ctx.closePath();
                ctx.fill();
                
                // Horn spiral pattern
                ctx.strokeStyle = '#FF69B4';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x - 40, y - 35, 3, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x - 40, y - 30, 2, 0, Math.PI * 2);
                ctx.stroke();
                
                // Unicorn mane (rainbow colors)
                const maneColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF'];
                maneColors.forEach((color, index) => {
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.ellipse(x - 50 + index * 3, y - 20 - index * 2, 8, 12, 0.2 * index, 0, Math.PI * 2);
                    ctx.fill();
                });
                
                // Unicorn tail (also rainbow!)
                maneColors.forEach((color, index) => {
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.ellipse(x + 30 + index * 2, y + 5 - index, 6, 15, -0.3, 0, Math.PI * 2);
                    ctx.fill();
                });
                
                // Eye
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(x - 45, y - 28, 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Eye sparkle
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(x - 44, y - 29, 1, 0, Math.PI * 2);
                ctx.fill();
                
                // Nostril
                ctx.fillStyle = '#FFB6C1';
                ctx.beginPath();
                ctx.arc(x - 50, y - 22, 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Magical sparkles around unicorn (static positions)
                ctx.fillStyle = '#FFD700';
                ctx.font = '12px Arial';
                const sparklePositions = [
                    {x: x - 20, y: y - 40},
                    {x: x + 10, y: y - 35},
                    {x: x - 35, y: y + 10},
                    {x: x + 25, y: y - 15},
                    {x: x - 10, y: y + 30}
                ];
                sparklePositions.forEach(pos => {
                    ctx.fillText('✨', pos.x, pos.y);
                });
            },
            
            interact: function() {
                if (girl.x < 150 && girl.x + girl.width > 50 &&
                    girl.y < 390 && girl.y + girl.height > 350) {
                    game.currentScene = 'outdoor';
                    girl.x = 600;
                    girl.y = 250;
                    speechBubble.show('Back home from Unicorn Land!');
                }
            }
        },
        
        china: {
            draw: function(ctx) {
                // Sky background with warm golden tint
                const gradient = ctx.createLinearGradient(0, 0, 0, game.canvas.height);
                gradient.addColorStop(0, '#FFD700'); // Golden top
                gradient.addColorStop(0.4, '#FFA500'); // Orange middle
                gradient.addColorStop(1, '#DC143C'); // Crimson bottom
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
                
                // Street level
                ctx.fillStyle = '#696969';
                ctx.fillRect(0, 320, game.canvas.width, 80);
                
                // Traditional Chinese buildings with red and gold
                this.drawChineseBuilding(ctx, 50, 150, 120, 170, '#DC143C', '#FFD700', '面馆'); // Noodle Shop
                this.drawChineseBuilding(ctx, 200, 180, 100, 140, '#B22222', '#FFA500', '豆腐'); // Tofu Shop
                this.drawChineseBuilding(ctx, 330, 160, 110, 160, '#8B0000', '#FFD700', '茶楼'); // Tea House
                this.drawChineseBuilding(ctx, 470, 140, 130, 180, '#DC143C', '#FF6347', '餐厅'); // Restaurant
                this.drawChineseBuilding(ctx, 630, 170, 120, 150, '#B22222', '#FFD700', '酒店'); // Hotel
                
                // Red lanterns hanging from buildings
                this.drawLantern(ctx, 110, 120, '#DC143C');
                this.drawLantern(ctx, 250, 150, '#FF0000');
                this.drawLantern(ctx, 380, 130, '#DC143C');
                this.drawLantern(ctx, 530, 110, '#FF0000');
                this.drawLantern(ctx, 690, 140, '#DC143C');
                
                // Street decorations
                ctx.font = '20px Arial';
                ctx.fillText('🏮', 300, 100);
                ctx.fillText('🏮', 450, 85);
                ctx.fillText('🐉', 150, 340);
                ctx.fillText('🐉', 600, 345);
                
                // Noodle shop entrance hint
                if (girl.x < 170 && girl.x + girl.width > 50 &&
                    girl.y < 320 && girl.y + girl.height > 280) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.fillRect(60, 280, 100, 20);
                    ctx.fillStyle = 'black';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('Press SPACE for 🍜', 110, 295);
                }
                
                // Tofu shop entrance hint and progress
                if (girl.x < 300 && girl.x + girl.width > 200 &&
                    girl.y < 320 && girl.y + girl.height > 280) {
                    if (this.tofuIngredients.complete) {
                        ctx.fillStyle = 'rgba(144, 238, 144, 0.9)';
                        ctx.fillRect(210, 280, 80, 20);
                        ctx.fillStyle = 'black';
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('Tofu Ready! 🍚', 250, 295);
                    } else {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                        ctx.fillRect(210, 280, 80, 20);
                        ctx.fillStyle = 'black';
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('Make Tofu!', 250, 295);
                    }
                }
                
                // Tofu progress indicator
                if (this.tofuIngredients.soybeans || this.tofuIngredients.water || this.tofuIngredients.salt) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.fillRect(200, 100, 100, 60);
                    ctx.strokeStyle = '#DC143C';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(200, 100, 100, 60);
                    
                    ctx.fillStyle = '#DC143C';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'left';
                    ctx.fillText('Tofu Progress:', 205, 115);
                    ctx.fillText(`大豆: ${this.tofuIngredients.soybeans ? '✓' : '○'}`, 205, 130);
                    ctx.fillText(`水: ${this.tofuIngredients.water ? '✓' : '○'}`, 205, 145);
                    ctx.fillText(`盐: ${this.tofuIngredients.salt ? '✓' : '○'}`, 205, 155);
                }
                
                // Return button
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(50, 350, 100, 40);
                ctx.strokeStyle = '#DC143C';
                ctx.lineWidth = 3;
                ctx.strokeRect(50, 350, 100, 40);
                ctx.fillStyle = '#DC143C';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('RETURN HOME', 100, 375);
                
                // Title with Chinese characters
                ctx.fillStyle = '#FFD700';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('中国城市 - Chinese City! 🏮', 400, 50);
            },
            
            drawChineseBuilding: function(ctx, x, y, width, height, roofColor, accentColor, chineseText) {
                // Building base
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x, y, width, height);
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, height);
                
                // Traditional roof
                ctx.fillStyle = roofColor;
                ctx.beginPath();
                ctx.moveTo(x - 10, y);
                ctx.lineTo(x + width/2, y - 30);
                ctx.lineTo(x + width + 10, y);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#000';
                ctx.stroke();
                
                // Roof decorations
                ctx.fillStyle = accentColor;
                ctx.fillRect(x + width/2 - 5, y - 35, 10, 8);
                
                // Windows
                ctx.fillStyle = '#FFFF00';
                for (let i = 0; i < 2; i++) {
                    for (let j = 0; j < Math.floor(height/40); j++) {
                        ctx.fillRect(x + 15 + i * (width - 50), y + 20 + j * 40, 20, 20);
                        ctx.strokeStyle = '#000';
                        ctx.strokeRect(x + 15 + i * (width - 50), y + 20 + j * 40, 20, 20);
                    }
                }
                
                // Door
                ctx.fillStyle = '#8B0000';
                ctx.fillRect(x + width/2 - 15, y + height - 40, 30, 40);
                ctx.strokeStyle = '#000';
                ctx.strokeRect(x + width/2 - 15, y + height - 40, 30, 40);
                
                // Chinese sign
                ctx.fillStyle = accentColor;
                ctx.fillRect(x + 10, y + 30, width - 20, 25);
                ctx.strokeStyle = '#000';
                ctx.strokeRect(x + 10, y + 30, width - 20, 25);
                ctx.fillStyle = '#000';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(chineseText, x + width/2, y + 48);
            },
            
            drawLantern: function(ctx, x, y, color) {
                // Lantern body
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.ellipse(x, y, 15, 20, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Lantern top
                ctx.fillStyle = '#000';
                ctx.fillRect(x - 5, y - 25, 10, 8);
                
                // Lantern string
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y - 30);
                ctx.lineTo(x, y - 45);
                ctx.stroke();
                
                // Lantern bottom decoration
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x - 2, y + 15, 4, 10);
            },
            
            tofuIngredients: {
                soybeans: false,
                water: false,
                salt: false,
                complete: false
            },
            
            interact: function() {
                // Return home
                if (girl.x < 150 && girl.x + girl.width > 50 &&
                    girl.y < 390 && girl.y + girl.height > 350) {
                    game.currentScene = 'outdoor';
                    girl.x = 600;
                    girl.y = 250;
                    speechBubble.show('Back home from China! 再见! (Goodbye!)');
                    return;
                }
                
                // Noodle shop interaction
                if (girl.x < 170 && girl.x + girl.width > 50 &&
                    girl.y < 320 && girl.y + girl.height > 280) {
                    const noodleTypes = [
                        '拉面 (Ramen)', '乌冬面 (Udon)', '米粉 (Rice Noodles)', 
                        '炒面 (Chow Mein)', '担担面 (Dan Dan Noodles)'
                    ];
                    const randomNoodle = noodleTypes[Math.floor(Math.random() * noodleTypes.length)];
                    speechBubble.show(`Here's your delicious ${randomNoodle}! 好吃! (Delicious!)`);
                    return;
                }
                
                // Tofu shop interaction
                if (girl.x < 300 && girl.x + girl.width > 200 &&
                    girl.y < 320 && girl.y + girl.height > 280) {
                    
                    if (this.tofuIngredients.complete) {
                        speechBubble.show('Your fresh tofu is ready! 豆腐做好了! So silky and delicious! 🍚');
                        this.tofuIngredients = { soybeans: false, water: false, salt: false, complete: false };
                        return;
                    }
                    
                    if (!this.tofuIngredients.soybeans) {
                        this.tofuIngredients.soybeans = true;
                        speechBubble.show('Added fresh soybeans! 大豆 (Soybeans) are the main ingredient!');
                        return;
                    }
                    
                    if (!this.tofuIngredients.water) {
                        this.tofuIngredients.water = true;
                        speechBubble.show('Added pure mountain water! 水 (Water) to soak the beans!');
                        return;
                    }
                    
                    if (!this.tofuIngredients.salt) {
                        this.tofuIngredients.salt = true;
                        speechBubble.show('Added sea salt! 盐 (Salt) as a coagulant!');
                        
                        // Start tofu making process
                        setTimeout(() => {
                            speechBubble.show('Grinding soybeans... 磨豆 Making soy milk...');
                            setTimeout(() => {
                                speechBubble.show('Heating and adding salt... 加热 Forming curds...');
                                setTimeout(() => {
                                    speechBubble.show('Pressing into tofu blocks... 压制 Almost ready!');
                                    setTimeout(() => {
                                        this.tofuIngredients.complete = true;
                                        speechBubble.show('Tofu making complete! Press SPACE to collect your fresh tofu!');
                                    }, 1500);
                                }, 1500);
                            }, 1500);
                        }, 1000);
                        return;
                    }
                }
            }
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

    const handInventory = {
        // Move item from ground/world to hand or inventory
        pickupItem: function(item) {
            if (!girl.heldItem) {
                // Put in hand if empty
                girl.heldItem = item;
                speechBubble.show(`Picked up ${item.name}! ${item.icon}`);
            } else if (girl.inventory.length < girl.maxInventorySize) {
                // Put in inventory if hand is full
                girl.inventory.push(item);
                speechBubble.show(`Added ${item.name} to inventory! ${item.icon}`);
            } else {
                speechBubble.show('Hand and inventory full!');
                return false;
            }
            return true;
        },

        // Move item from hand to inventory
        storeHeldItem: function() {
            if (!girl.heldItem) {
                speechBubble.show('Nothing in hand!');
                return false;
            }
            
            if (girl.inventory.length >= girl.maxInventorySize) {
                speechBubble.show('Inventory full!');
                return false;
            }
            
            girl.inventory.push(girl.heldItem);
            speechBubble.show(`Stored ${girl.heldItem.name} in inventory`);
            girl.heldItem = null;
            return true;
        },

        // Move item from inventory slot to hand
        takeFromInventory: function(index) {
            if (index < 0 || index >= girl.inventory.length) {
                speechBubble.show('Invalid inventory slot!');
                return false;
            }
            
            const item = girl.inventory[index];
            
            if (girl.heldItem) {
                // Swap items
                girl.inventory[index] = girl.heldItem;
                girl.heldItem = item;
                speechBubble.show(`Swapped ${item.name} with ${girl.inventory[index].name}`);
            } else {
                // Take item to hand
                girl.inventory.splice(index, 1);
                girl.heldItem = item;
                speechBubble.show(`Took ${item.name} from inventory`);
            }
            return true;
        },

        // Drop held item (remove from game)
        dropHeldItem: function() {
            if (!girl.heldItem) {
                speechBubble.show('Nothing to drop!');
                return false;
            }
            
            speechBubble.show(`Dropped ${girl.heldItem.name}`);
            girl.heldItem = null;
            return true;
        },

        // Quick access to take first item of a type from inventory
        takeItemByName: function(name) {
            const index = girl.inventory.findIndex(item => item.name === name);
            if (index !== -1) {
                return this.takeFromInventory(index);
            } else {
                speechBubble.show(`No ${name} in inventory!`);
                return false;
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

        updateHTML: function() {
            // Update HTML sidebar instead of drawing on canvas
            const handSlot = document.getElementById('handSlot');
            if (handSlot) {
                if (girl.heldItem) {
                    handSlot.innerHTML = `${girl.heldItem.icon} ${girl.heldItem.name}`;
                    handSlot.style.backgroundColor = '#ffffcc';
                } else {
                    handSlot.innerHTML = 'Empty';
                    handSlot.style.backgroundColor = '#f5f5f5';
                }
            }
            
            // Update inventory slots
            for (let i = 0; i < girl.maxInventorySize; i++) {
                const slot = document.getElementById(`slot${i}`);
                if (slot) {
                    if (i < girl.inventory.length) {
                        const item = girl.inventory[i];
                        slot.innerHTML = `${item.icon}`;
                        slot.title = `${item.name} (${item.type})`; // Tooltip
                        slot.style.backgroundColor = '#e8f5e8';
                    } else {
                        slot.innerHTML = (i + 1).toString();
                        slot.title = 'Empty slot';
                        slot.style.backgroundColor = '#f5f5f5';
                    }
                }
            }
        },

        draw: function(ctx) {
            if (this.isOpen) {
                // Full inventory overlay
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
            } else if (e.key === 'h' || e.key === 'H') {
                handInventory.storeHeldItem();
            } else if (e.key === 'x' || e.key === 'X') {
                handInventory.dropHeldItem();
            } else if (e.key >= '1' && e.key <= '6') {
                const index = parseInt(e.key) - 1;
                handInventory.takeFromInventory(index);
            } else if (e.key === 'c' || e.key === 'C') {
                if (girl.carryingChicken) {
                    girl.dropChicken();
                }
            } else if (e.key === 't' || e.key === 'T') {
                if (game.currentScene === 'airplane') {
                    airplane.changeChannel();
                }
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
                if (!houseEntrance.interact() && !friend.interact()) {
                    taxi.interact();
                    girl.interactWithChickens();
                }
            } else if (game.currentScene === 'kitchen') {
                kitchen.interact();
            } else if (game.currentScene === 'bathroom') {
                bathroom.interact();
            } else if (game.currentScene === 'airport') {
                airport.interact();
            } else if (game.currentScene === 'airplane') {
                airplane.interact();
            } else if (destinations[game.currentScene]) {
                destinations[game.currentScene].interact();
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

        addToInventory: function(name, type = 'item', icon = '📦') {
            const item = { name, type, icon };
            if (girl.inventory.length < girl.maxInventorySize) {
                girl.inventory.push(item);
                console.log(`Added ${name} ${icon} to inventory`);
            } else {
                console.log('Inventory full!');
            }
        },

        clearInventory: function() {
            girl.inventory = [];
            console.log('Inventory cleared');
        },

        showInventory: function() {
            console.log('=== INVENTORY ===');
            console.log('Hand:', girl.heldItem ? `${girl.heldItem.icon} ${girl.heldItem.name}` : 'Empty');
            console.log('Inventory:');
            if (girl.inventory.length === 0) {
                console.log('  Empty');
            } else {
                girl.inventory.forEach((item, i) => {
                    console.log(`  ${i + 1}. ${item.icon} ${item.name} (${item.type})`);
                });
            }
            console.log(`Slots: ${girl.inventory.length}/${girl.maxInventorySize}`);
        },

        giveItem: function(name, type = 'item', icon = '📦') {
            const item = { name, type, icon };
            girl.heldItem = item;
            console.log(`Given ${name} ${icon} to hand`);
        },

        testHandSystem: function() {
            console.log('Testing hand/inventory system...');
            this.clearInventory();
            this.giveItem('Test Apple', 'food', '🍎');
            console.log('Try: H (store), X (drop), 1-6 (take from slot)');
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
            console.log('debug.addToInventory(name, type, icon) - Add item to inventory');
            console.log('debug.clearInventory() - Clear all items');
            console.log('debug.showInventory() - List all items');
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
    airport.init();
    friend.init();
    destinations.nyc.init();

    // Show debug help on load
    console.log('=== JOJO GAME DEBUG SYSTEM ===');
    console.log('Type debug.showHelp() for available commands');
    console.log('Type debug.logStatus() to see current game state');
})();
