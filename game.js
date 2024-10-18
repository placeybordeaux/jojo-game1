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
            orange: { src: 'orange.png' }
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
            }
        },

        draw: function() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (this.currentScene === 'indoor') {
                this.ctx.drawImage(this.images.house.img, 0, 0, this.canvas.width, this.canvas.height);
                door.draw(this.ctx);  // Draw the door
                items.apple.draw(this.ctx);
                items.cookie.draw(this.ctx);
            } else if (this.currentScene === 'outdoor') {
                this.ctx.drawImage(this.images.outdoorBackground.img, 0, 0, this.canvas.width, this.canvas.height);
                orangeTree.draw(this.ctx);
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
            } else if (this.currentScene === 'outdoor' && girl.x < 0) {
                this.currentScene = 'indoor';
                girl.x = this.canvas.width - girl.width - 50;  // Start a bit inside the house
            }
        },
    };

    const door = {
        x: 700,
        y: 200,
        width: 60,
        height: 120,
        
        draw: function(ctx) {
            ctx.fillStyle = 'brown';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };

    const girl = {
        x: 100,
        y: 300,
        width: 50,
        height: 100,
        speed: 5,
        
        move: function() {
            if (input.rightPressed && this.x < game.canvas.width - this.width) {
                this.x += this.speed;
            } else if (input.leftPressed && this.x > 0) {
                this.x -= this.speed;
            } else if (input.upPressed && this.y > 0) {
                this.y -= this.speed;
            } else if (input.downPressed && this.y < game.canvas.height - this.height) {
                this.y += this.speed;
            }
        },

        draw: function(ctx) {
            ctx.drawImage(game.images.girl.img, this.x, this.y, this.width, this.height);
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

        show: function(text) {
            this.text = text;
            this.visible = true;
            this.startTime = Date.now();
        },

        draw: function(ctx) {
            if (this.visible) {
                const currentTime = Date.now();
                if (currentTime - this.startTime < this.duration) {
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.moveTo(girl.x + girl.width / 2, girl.y - 10);
                    ctx.lineTo(girl.x + girl.width / 2 - 5, girl.y - 20);
                    ctx.lineTo(girl.x + girl.width / 2 + 5, girl.y - 20);
                    ctx.fill();
                    
                    ctx.beginPath();
                    ctx.ellipse(girl.x + girl.width / 2, girl.y - 50, 40, 30, 0, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.fillStyle = 'black';
                    ctx.font = '16px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(this.text, girl.x + girl.width / 2, girl.y - 45);
                } else {
                    this.visible = false;
                }
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
            items.apple.interact();
            items.cookie.interact();
        }
    };

    // Initialize the game
    game.init();
    input.init();
    orangeTree.init();
})();
