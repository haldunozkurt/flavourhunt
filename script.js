document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const scoreEl = document.getElementById('score');
    const timerEl = document.getElementById('timer');
    const startScreen = document.getElementById('startScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const restartButton = document.getElementById('restartButton');
    const finalScoreEl = document.getElementById('finalScore');
    
    const endVideo = document.getElementById('endVideo');
    const gameOverTitle = gameOverScreen.querySelector('h1');
    
    // --- Asset Loader (KEPT EXACTLY THE SAME) ---
    const images = {};
    const sounds = {};
    const imageSources = {
        robotWalk1: 'https://static.wixstatic.com/media/9a9184_306b204503a84fd09792f8d7097fe364~mv2.png',
        robotWalk2: 'https://static.wixstatic.com/media/9a9184_1738f53d47554bb9b54eca4dbaa8fbd5~mv2.png',
        robotWalk3: 'https://static.wixstatic.com/media/9a9184_bef7bee6f388459dae18ff87b8cc6e38~mv2.png',
        robotJump: 'https://static.wixstatic.com/media/9a9184_be0bc1d670ce43c399ded721c24b5132~mv2.png',
        robotLand: 'https://static.wixstatic.com/media/9a9184_a4d4719fefe14b31a5849d6a0cbe5345~mv2.png',
        telephone: 'https://static.wixstatic.com/media/9a9184_60a87bc250e847089746d126012be4be~mv2.png',
        wheelieBin: 'https://static.wixstatic.com/media/9a9184_1a0fae92e50948008971ef4d9e5e2445~mv2.png',
        burger: 'https://static.wixstatic.com/media/9a9184_9fcc0f878ffe4d4da863990cc6cc6c9b~mv2.png',
        ramen: 'https://static.wixstatic.com/media/9a9184_3bdb83bd23fa4d72b545f6bc9a4db5e5~mv2.png',
        background: 'https://static.wixstatic.com/media/9a9184_ddccf762df954d958044b490fc6e3922~mv2.png',
        pavement: 'https://static.wixstatic.com/media/9a9184_198559d79ebe4fb784af9fcbb6688874~mv2.png',
        foreground: 'https://static.wixstatic.com/media/9a9184_dd793f62a4c0471c86a4877ed4fc4396~mv2.png',
        flash1: 'https://static.wixstatic.com/media/9a9184_24391fddd6e54194b899ef0320d0ce14~mv2.png',
        flash2: 'https://static.wixstatic.com/media/9a9184_0f920d002b7b4ac7940016e2d5a93be4~mv2.png',
        blackCab1: 'https://static.wixstatic.com/media/9a9184_ac84917141a946a5ae253dcb96821be9~mv2.png',
        blackCab2: 'https://static.wixstatic.com/media/9a9184_a125b0befcc24f79a154826f40fa953c~mv2.png',
        sandwich1: 'https://static.wixstatic.com/media/9a9184_8f8124c13d314cca9306195f4f4d74e9~mv2.png',
        sandwich2: 'https://static.wixstatic.com/media/9a9184_62d5fd8c649343cd81e4bfed9cccec8b~mv2.png',
        sandwich3: 'https://static.wixstatic.com/media/9a9184_eac5b5b47d7f4ea6a39aae18d517493b~mv2.png',
        death1: 'https://static.wixstatic.com/media/9a9184_0f3a5438df474c76b240c5ab26e323cf~mv2.png',
        death2: 'https://static.wixstatic.com/media/9a9184_83ac456d210e46029ad8325ee211c0b4~mv2.png',
        tukTuk1: 'https://static.wixstatic.com/media/9a9184_aa22482ca0384599b96cb17e68cba36c~mv2.png', 
        tukTuk2: 'https://static.wixstatic.com/media/9a9184_3634928d8d0343d3a3dd16dcafc0e747~mv2.png'
    };
    const soundSources = {
        ramenCollect: 'https://static.wixstatic.com/mp3/9a9184_51846c0a6c184fab8fa7ae53d6c9842a.mp3',
        burgerCollect: 'https://static.wixstatic.com/mp3/9a9184_9f4bd31e941241dab16ea6e9dc76f3c1.mp3',
        backgroundMusic: 'https://static.wixstatic.com/mp3/9a9184_8577fd225aea41bd8b1d8ad53c6f7868.wav',
        negativeSound: 'https://static.wixstatic.com/mp3/9a9184_f939d00ba4e74483881da8d8c05d88fa.mp3'
    };

    let assetsLoaded = 0;
    const numImages = Object.keys(imageSources).length;
    const numSounds = Object.keys(soundSources).length;
    const totalAssets = numImages + numSounds;

    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2);

    for (const key in imageSources) {
        images[key] = new Image();
        images[key].src = imageSources[key];
        images[key].onload = assetLoaded;
        images[key].onerror = () => assetError(key, imageSources[key]);
    }

    for (const key in soundSources) {
        sounds[key] = new Audio();
        sounds[key].src = soundSources[key];
        sounds[key].oncanplaythrough = assetLoaded;
        sounds[key].onerror = () => assetError(key, soundSources[key]);
    }
    
    function assetLoaded() {
        assetsLoaded++;
        if (assetsLoaded === totalAssets) {
            initializeGame();
        }
    }

    function assetError(key, src) {
        console.error(`Failed to load asset: ${key} from ${src}`);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'red';
        ctx.fillText(`Error loading: ${src}`, canvas.width / 2, canvas.height / 2);
    }

    // --- Game Variables & Constants ---
    const GRAVITY = 0.6;
    const JUMP_STRENGTH = -15;
    const GAME_SPEED = 5;
    const GROUND_Y = canvas.height - 95;

    let score, timer, gameSpeed, isGameOver, animationFrameId, countdownInterval;
    let player, obstacles, foodItems, backgroundLayers, cab, tukTuk;
    let collectionFlashes = [];
    
    let spawnQueue = [];
    let isGameRunning = false; // State tracker

    class Layer {
        constructor(image, speedModifier) {
            this.x = 0;
            this.y = 0;
            this.width = canvas.width;
            this.height = canvas.height;
            this.image = image;
            this.speedModifier = speedModifier;
            this.speed = gameSpeed * this.speedModifier;
        }
        update() {
            this.speed = gameSpeed * this.speedModifier;
            this.x -= this.speed;
            if (this.x <= -this.width) {
                this.x = 0;
            }
        }
        draw() {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
        }
        reset() {
            this.x = 0;
        }
    }
    class Cab {
        constructor() {
            this.width = 100;
            this.height = 45;
            this.frames = [images.blackCab1, images.blackCab2];
            this.currentFrame = 0;
            this.frameTimer = 0;
            this.animationSpeed = 15;
            this.reset();
        }
        reset() {
            if (Math.random() < 0.5) {
                this.x = -this.width - Math.random() * 500;
                this.speed = Math.random() * 0.5 + 0.5;
            } else {
                this.x = canvas.width + Math.random() * 500;
                this.speed = -(Math.random() * 0.5 + 0.5);
            }
            this.y = canvas.height - 175; 
        }
        update() {
            this.x += this.speed;
            if ((this.speed > 0 && this.x > canvas.width) || (this.speed < 0 && this.x < -this.width)) {
                this.reset();
            }
            this.frameTimer++;
            if (this.frameTimer % this.animationSpeed === 0) {
                this.currentFrame = (this.currentFrame + 1) % this.frames.length;
            }
        }
        draw() {
            ctx.drawImage(this.frames[this.currentFrame], this.x, this.y, this.width, this.height);
        }
    }
    class TukTuk {
        constructor() {
            this.width = 100;
            this.height = 70;
            this.frames = [images.tukTuk1, images.tukTuk2];
            this.currentFrame = 0;
            this.frameTimer = 0;
            this.animationSpeed = 10;
            this.reset();
        }
        reset() {
            if (Math.random() < 0.5) {
                this.x = -this.width - Math.random() * 700;
                this.speed = Math.random() * 0.7 + 0.7;
            } else {
                this.x = canvas.width + Math.random() * 700;
                this.speed = -(Math.random() * 0.7 + 0.7);
            }
            this.y = canvas.height - 185; 
        }
        update() {
            this.x += this.speed;
            if ((this.speed > 0 && this.x > canvas.width) || (this.speed < 0 && this.x < -this.width)) {
                this.reset();
            }
            this.frameTimer++;
            if (this.frameTimer % this.animationSpeed === 0) {
                this.currentFrame = (this.currentFrame + 1) % this.frames.length;
            }
        }
        draw() {
            ctx.drawImage(this.frames[this.currentFrame], this.x, this.y, this.width, this.height);
        }
    }


    function initializeGame() {
        backgroundLayers = [
            new Layer(images.background, 0.2),
            new Layer(images.pavement, 1),
            new Layer(images.foreground, 0.75)
        ];
        
        cab = new Cab();
        tukTuk = new TukTuk();

        player = {
            x: 50,
            baseWidth: 60,
            baseHeight: 75,
            scale: 0.75,
            width: 60 * 0.75,
            height: 75 * 0.75,
            y: GROUND_Y - (75 * 0.75),
            velocityY: 0,
            isJumping: false,
            walkFrames: [images.robotWalk1, images.robotWalk2, images.robotWalk3],
            currentFrame: 0,
            frameCounter: 0,
            animationSpeed: 8, 

            jump: function() {
                if (!this.isJumping) {
                    this.velocityY = JUMP_STRENGTH;
                    this.isJumping = true;
                }
            },
            update: function() {
                this.y += this.velocityY;
                if (this.y + this.height < GROUND_Y) {
                    this.velocityY += GRAVITY;
                } else {
                    this.velocityY = 0;
                    this.isJumping = false;
                    this.y = GROUND_Y - this.height;
                }
            },
            draw: function() {
                this.frameCounter++;
                let imageToDraw;
                if (this.isJumping) {
                    imageToDraw = this.velocityY < 0 ? images.robotJump : images.robotLand;
                } else {
                    imageToDraw = this.walkFrames[this.currentFrame];
                    if (this.frameCounter % this.animationSpeed === 0) {
                        this.currentFrame = (this.currentFrame + 1) % this.walkFrames.length;
                    }
                }
                ctx.drawImage(imageToDraw, this.x, this.y, this.width, this.height);
            }
        };
        
        // --- MOBILE INPUT HANDLING REWRITE ---
        // Instead of canvas.onclick, we listen to the whole document for touches
        function handleInput(e) {
            // If the game is running, taps make the player jump
            if (isGameRunning && !isGameOver && player) {
                // Prevent scrolling/zooming if they tap on the canvas area
                if(e.target === canvas || e.target === document.body) {
                    // e.preventDefault(); // Optional: uncomment if scrolling is an issue
                }
                player.jump();
            } 
            // If we are on the start screen, taps start the game
            else if (startScreen.style.display !== 'none') {
                startCountdown();
            }
        }

        // Mouse click
        document.addEventListener('click', handleInput);
        // Touch (Mobile)
        document.addEventListener('touchstart', (e) => {
            // We pass the event to handleInput
            handleInput(e);
        }, { passive: false });
        
        // Spacebar support
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                handleInput(e);
            }
        });
        
        restartButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop this click from triggering a jump immediately
            startGame();
        });
        restartButton.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            startGame();
        });
    }
    
    function startCountdown() {
        // Prevent double starts
        if (isGameRunning) return;
        
        startScreen.style.display = 'none';
        let count = 3;
        
        const countdownTimer = setInterval(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            backgroundLayers[0].draw();
            cab.draw();
            tukTuk.draw();
            backgroundLayers[1].draw();
            player.draw();
            backgroundLayers[2].draw();

            ctx.fillStyle = "white";
            ctx.font = "bold 96px Arial";
            ctx.textAlign = "center";
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 8;

            let text = count > 0 ? count : "GO!";
            ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);

            if (count < 0) {
                clearInterval(countdownTimer);
                startGame();
            }
            count--;
        }, 800);
    }

    function spawnObstacle() {
        if (spawnQueue.length === 0) return;

        const obstacleType = spawnQueue.pop();
        
        let foodType;
        if (obstacleType === 'wheelieBin') {
            foodType = 'sandwich';
        } else { // telephone
            foodType = Math.random() < 0.5 ? 'burger' : 'ramen';
        }
        
        let obstacleHeight, obstacleWidth;
        if (obstacleType === 'telephone') {
            obstacleHeight = 110; 
            const telephoneAspectRatio = images.telephone.width / images.telephone.height;
            obstacleWidth = obstacleHeight * telephoneAspectRatio;
        } else { // wheelieBin
            obstacleHeight = 65;
            obstacleWidth = 50;
        }

        obstacles.push({
            x: canvas.width,
            y: GROUND_Y - obstacleHeight,
            width: obstacleWidth,
            height: obstacleHeight,
            image: images[obstacleType]
        });
        
        if (foodType) {
            let foodWidth, foodHeight, foodY;
            if (foodType === 'sandwich') {
                foodWidth = 70; 
                foodHeight = 70;
                foodY = GROUND_Y - 150;
            } else {
                foodWidth = 35;
                foodHeight = 35;
                foodY = GROUND_Y - obstacleHeight - 70;
            }

            const foodObject = {
                x: canvas.width + (obstacleWidth / 2) - (foodWidth / 2),
                y: foodY,
                width: foodWidth,
                height: foodHeight,
                type: foodType
            };

            if (foodType === 'sandwich') {
                foodObject.points = -1;
                foodObject.frames = [images.sandwich1, images.sandwich2, images.sandwich3];
                foodObject.currentFrame = 0;
                foodObject.frameTimer = 0;
                foodObject.animationSpeed = 15;
            } else {
                foodObject.points = 5;
                foodObject.image = images[foodType];
            }
            foodItems.push(foodObject);
        }
    }
    
    let obstacleSpawnTimer = 0;
    function handleGameObjects() {
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obs = obstacles[i];
            obs.x -= gameSpeed;
            ctx.drawImage(obs.image, obs.x, obs.y, obs.width, obs.height);
            if (obs.x + obs.width < 0) obstacles.splice(i, 1);
        }

        for (let i = foodItems.length - 1; i >= 0; i--) {
            let food = foodItems[i];
            food.x -= gameSpeed;

            if (food.type === 'sandwich') {
                food.frameTimer++;
                if (food.frameTimer % food.animationSpeed === 0) {
                    food.currentFrame = (food.currentFrame + 1) % food.frames.length;
                }
                ctx.drawImage(food.frames[food.currentFrame], food.x, food.y, food.width, food.height);
            } else {
                ctx.drawImage(food.image, food.x, food.y, food.width, food.height);
            }

            if (player.x < food.x + food.width && player.x + player.width > food.x && player.y < food.y + food.height && player.y + player.height > food.y) {
                score += food.points;
                scoreEl.textContent = `Score: ${score}`;
                
                if (food.type !== 'sandwich' && player.scale < 1.0) {
                    const oldHeight = player.height;
                    player.scale = Math.min(1.0, player.scale + 0.05); 
                    player.width = player.baseWidth * player.scale;
                    player.height = player.baseHeight * player.scale;
                    player.y -= (player.height - oldHeight);
                }

                const flashDuration = 30;
                const flashType = food.type === 'sandwich' ? 'bad' : 'good';
                
                let flashSize;
                if (flashType === 'bad') {
                    flashSize = 30;
                } else {
                    flashSize = 60;
                }
                
                collectionFlashes.push({ x: food.x, y: food.y, width: flashSize, height: flashSize, timer: flashDuration, totalDuration: flashDuration, type: flashType });
                
                if (food.type === 'sandwich') {
                    sounds.negativeSound.currentTime = 0;
                    sounds.negativeSound.play();
                } else if (food.type === 'burger') {
                    sounds.burgerCollect.currentTime = 0;
                    sounds.burgerCollect.play();
                } else {
                    sounds.ramenCollect.currentTime = 0;
                    sounds.ramenCollect.play();
                }

                foodItems.splice(i, 1);
            } else if (food.x + food.width < 0) {
                foodItems.splice(i, 1);
            }
        }
        
        for (let i = collectionFlashes.length - 1; i >= 0; i--) {
            let flash = collectionFlashes[i];
            flash.timer--;
            
            let imageToDraw = null;
            const flashImages = flash.type === 'bad' ? [images.death1, images.death2] : [images.flash1, images.flash2];

            if (flash.timer > flash.totalDuration / 2) {
                imageToDraw = flashImages[0];
            } else if (flash.timer > 0) {
                imageToDraw = flashImages[1];
            }

            if (imageToDraw) {
                ctx.drawImage(imageToDraw, flash.x - flash.width / 4, flash.y - flash.height / 4, flash.width, flash.height);
            }
            if (flash.timer <= 0) {
                collectionFlashes.splice(i, 1);
            }
        }

        obstacleSpawnTimer++;
        if (obstacleSpawnTimer > 100 + Math.random() * 100 && spawnQueue.length > 0) {
            spawnObstacle();
            obstacleSpawnTimer = 0;
        }
    }


    function animate() {
        if (isGameOver) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        backgroundLayers[0].update(); 
        backgroundLayers[0].draw();

        cab.update();
        cab.draw();
        tukTuk.update();
        tukTuk.draw();

        backgroundLayers[1].update(); 
        backgroundLayers[1].draw();

        handleGameObjects();
        player.update();
        player.draw();

        backgroundLayers[2].update(); 
        backgroundLayers[2].draw();

        animationFrameId = requestAnimationFrame(animate);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function startGame() {
        score = 0;
        timer = 60; // CHANGED
        gameSpeed = GAME_SPEED;
        isGameOver = false;
        isGameRunning = true; // NEW: track running state
        obstacles = [];
        foodItems = [];
        collectionFlashes = [];
        
        // This old listener is removed in favor of the global handleInput
        // if (startScreen.style.display !== 'flex') { ... } 
        
        endVideo.pause();
        endVideo.currentTime = 0;

        const numSandwiches = 10;
        const numGoodFoods = 20;

        spawnQueue = [];
        for (let i = 0; i < numSandwiches; i++) {
            spawnQueue.push('wheelieBin');
        }
        for (let i = 0; i < numGoodFoods; i++) {
            spawnQueue.push('telephone');
        }

        shuffleArray(spawnQueue);

        player.scale = 0.75;
        player.width = player.baseWidth * player.scale;
        player.height = player.baseHeight * player.scale; 
        player.y = GROUND_Y - player.height;
        player.velocityY = 0;
        
        backgroundLayers.forEach(layer => layer.reset());
        cab.reset();
        tukTuk.reset();

        scoreEl.textContent = `Score: ${score}`;
        timerEl.textContent = `Time: ${timer}`;
        gameOverScreen.style.display = 'none';

        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (countdownInterval) clearInterval(countdownInterval);
        
        sounds.backgroundMusic.loop = true;
        sounds.backgroundMusic.currentTime = 0;
        sounds.backgroundMusic.play().catch(e => console.log("Audio play blocked until interaction"));

        countdownInterval = setInterval(() => {
            timer--;
            timerEl.textContent = `Time: ${timer}`;
            if (timer <= 0) {
                endGame();
            }
        }, 1000);
        
        animate();
    }
    
    function endGame() {
        isGameOver = true;
        isGameRunning = false;
        clearInterval(countdownInterval);
        cancelAnimationFrame(animationFrameId);
        
        sounds.backgroundMusic.pause();
        
        endVideo.play();
        
        if (score >= 100) {
            gameOverTitle.textContent = "Incredible!";
            finalScoreEl.innerHTML = `You won a FREE Main Course!<br>Your voucher code is: <strong>BANANA MAIN</strong>`;
        } else if (score >= 50) {
            gameOverTitle.textContent = "You Win!";
            finalScoreEl.innerHTML = `Well done, you won a £5 voucher!<br>Your voucher code is: <strong>BANANA 5</strong>`;
        } else {
            gameOverTitle.textContent = "Game Over!";
            finalScoreEl.innerHTML = `Your Final Score: ${score}.<br>Better luck next time, try to avoid the soggy sandwiches!`;
        }
        
        gameOverScreen.style.display = 'flex';
    }
});
