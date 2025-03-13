document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const computedStyle = getComputedStyle(document.documentElement);
    const primaryColor = computedStyle.getPropertyValue('--primary-color').trim();
    const secondaryColor = computedStyle.getPropertyValue('--secondary-color').trim();
    const aiPaddleColor = computedStyle.getPropertyValue('--ai-paddle-color').trim();
    const playerPaddleColor = computedStyle.getPropertyValue('--player-paddle-color').trim();
    const textColor = computedStyle.getPropertyValue('--text-color').trim();
    
    let gameTime = 0;
    let currentLevel = 1;
    let gameState = 'playing';
    const pointsToWin = 20;
    const baseSpeedPerLevel = 0.4;
    
    const ball = {
        xLocation: canvas.width / 2,
        yLocation: canvas.height / 2,
        radius: 10,
        speedX: 3,
        speedY: 3,
        baseSpeedX: 3,
        baseSpeedY: 3,
        lastCollisionTime: 0, 
        collisionDebounceTime: 200, 
        reset: function() {
            this.xLocation = canvas.width / 2;
            this.yLocation = canvas.height / 2;
            this.speedX = this.baseSpeedX * (Math.random() > 0.5 ? 1: -1);
            this.speedY = this.baseSpeedY * (Math.random() > 0.5 ? 1: -1);
        },
        updateSpeedForLevel: function(level) {
            const speedMultiplier = 1 + ((level - 1) * baseSpeedPerLevel);
            this.baseSpeedX = 3 * speedMultiplier;
            this.baseSpeedY = 3 * speedMultiplier;
            this.speedX = this.baseSpeedX * Math.sign(this.speedX);
            this.speedY = this.baseSpeedY * Math.sign(this.speedY);
        }
    }
    
    const playerObject = {
        xLocation: 775, 
        yLocation: 200,
        paddleWidth: 15,
        paddleHeight: 100,
        score: 0,
        baseSpeed: 6,
        move: function(direction) {
            const currentSpeed = this.baseSpeed * (ball.baseSpeedX / 3);
            if (direction === 'up' && this.yLocation > 0) {
                this.yLocation -= currentSpeed;
            } else if (direction === 'down' && this.yLocation + this.paddleHeight < canvas.height) {
                this.yLocation += currentSpeed;
            }
        },
        reset: function() {
            this.yLocation = 200;
        }
    }
    
    const aiPlayerObject = {
        xLocation: 10,
        yLocation: 200,
        paddleWidth: 15,
        paddleHeight: 100,
        score: 0,
        baseSpeed: 3.5,
        difficultyFactor: 0.65,
        reactionDistance: 200,
        errorFactor: 0.7,
        move: function() {
            let predictedY = ball.yLocation;
            
            if (ball.speedX < 0) {
                const timeToReach = (ball.xLocation - this.xLocation - this.paddleWidth) / -ball.speedX;
                if (timeToReach > 0) {
                    predictedY = ball.yLocation + (ball.speedY * timeToReach);
                    
                    const bounceIterations = 1;
                    let tempY = predictedY;
                    let tempSpeedY = ball.speedY;
                    
                    for (let i = 0; i < bounceIterations; i++) {
                        if (tempY < 0 || tempY > canvas.height) {
                            tempSpeedY = -tempSpeedY;
                            tempY = tempY < 0 ? -tempY : 2 * canvas.height - tempY;
                        }
                    }
                    predictedY = tempY;
                    
                    const distanceRatio = Math.min(1, (ball.xLocation / this.reactionDistance));
                    const maxError = canvas.height * this.errorFactor * distanceRatio;
                    predictedY += (Math.random() * maxError) - (maxError / 2);
                }
            } 
            
            let targetY = predictedY - (this.paddleHeight / 2);
            
            let moveIntensity = 0.7;
            if (ball.speedX >= 0) {
                moveIntensity = 0.25 * this.difficultyFactor;
                targetY = ball.yLocation - (this.paddleHeight / 2);
            } else {
                moveIntensity = this.difficultyFactor;
            }
            
            if (ball.speedX < 0) {
                const distanceRatio = Math.max(0, 1 - (ball.xLocation / this.reactionDistance));
                moveIntensity *= (0.4 + (0.3 * distanceRatio));
            }
            
            if (Math.random() < 0.07) {
                moveIntensity *= 0.5;
            }
            
            const currentSpeed = this.baseSpeed * (ball.baseSpeedX / 3) * moveIntensity;
            const goal = targetY - this.yLocation;
            
            if(Math.abs(goal) > currentSpeed) {
                if (goal > 0) {
                    this.yLocation += currentSpeed;
                } else {
                    this.yLocation -= currentSpeed;
                }
            } else {
                this.yLocation += goal;
            }
            
            if (this.yLocation < 0) this.yLocation = 0;
            if (this.yLocation + this.paddleHeight > canvas.height) this.yLocation = canvas.height - this.paddleHeight;
        },
        updateDifficultyForLevel: function(level) {
            this.difficultyFactor = 0.65 + ((level - 1) * 0.05);
            if (this.difficultyFactor > 0.95) this.difficultyFactor = 0.95;
            
            this.errorFactor = Math.max(0.2, 0.7 - ((level - 1) * 0.05));
        },
        reset: function() {
            this.yLocation = 200;
        }
    }
    
    const keys = {};
    document.addEventListener('keydown', function(e) {
        keys[e.key] = true;
        e.preventDefault();
        if ((e.key === ' ' || e.key === 'Enter') && gameState !== 'playing') {
            startNewRound();
        }
    });
    document.addEventListener('keyup', function(e) {
        keys[e.key] = false;
    });
    
    function startNewRound() {
        playerObject.score = 0;
        aiPlayerObject.score = 0;
        ball.reset();
        playerObject.reset();
        aiPlayerObject.reset();
        ball.updateSpeedForLevel(currentLevel);
        aiPlayerObject.updateDifficultyForLevel(currentLevel);
        gameState = 'playing';
    }
    
    function nextLevel() {
        currentLevel++;
        startNewRound();
    }
    
    function restartLevel() {
        startNewRound();
    }
    
    function clearCanvas() {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0f0f30');
        gradient.addColorStop(1, '#1a1a40');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    function drawBall() {
        ctx.shadowBlur = 15;
        ctx.shadowColor = primaryColor;
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.arc(ball.xLocation, ball.yLocation, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    function drawMiddleLine() {
        ctx.strokeStyle = secondaryColor;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    function drawAIPaddle() {
        ctx.fillStyle = aiPaddleColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = aiPaddleColor;
        ctx.fillRect(aiPlayerObject.xLocation, aiPlayerObject.yLocation, aiPlayerObject.paddleWidth, aiPlayerObject.paddleHeight);
        ctx.shadowBlur = 0;
    }
    
    function drawPlayerPaddle() {
        ctx.fillStyle = playerPaddleColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = playerPaddleColor;
        ctx.fillRect(playerObject.xLocation, playerObject.yLocation, playerObject.paddleWidth, playerObject.paddleHeight);
        ctx.shadowBlur = 0;
    }
    
    function drawScores() {
        ctx.font = 'bold 30px Orbitron, Rajdhani, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = textColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = aiPaddleColor;
        ctx.fillText(aiPlayerObject.score, canvas.width / 4, 50);
        ctx.shadowBlur = 10;
        ctx.shadowColor = playerPaddleColor;
        ctx.fillText(playerObject.score, canvas.width * 3/4, 50);
        ctx.shadowBlur = 0;
    }
    
    function drawLevelInfo() {
        ctx.font = 'bold 16px Orbitron, Rajdhani, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = secondaryColor;
        ctx.fillText(`Level: ${currentLevel}`, canvas.width / 2, 20);
        
        const speedPercentage = Math.round(((ball.baseSpeedX / 3) - 1) * 100);
        ctx.fillText(`Speed: +${speedPercentage}%`, canvas.width / 2, 40);
    }
    
    function drawEndRoundMessage() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width / 2 - 200, canvas.height / 2 - 80, 400, 160);
        
        ctx.font = 'bold 24px Orbitron, Rajdhani, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = textColor;
        
        if (gameState === 'win') {
            ctx.fillText(`You Win!`, canvas.width / 2, canvas.height / 2 - 30);
            ctx.fillText(`Level ${currentLevel} Complete`, canvas.width / 2, canvas.height / 2);
            ctx.fillText(`Press Space for Level ${currentLevel + 1}`, canvas.width / 2, canvas.height / 2 + 40);
        } else if (gameState === 'lose') {
            ctx.fillText(`You Lose!`, canvas.width / 2, canvas.height / 2 - 30);
            ctx.fillText(`Try Level ${currentLevel} Again`, canvas.width / 2, canvas.height / 2);
            ctx.fillText(`Press Space to Continue`, canvas.width / 2, canvas.height / 2 + 40);
        }
    }
    
    function game(timestamp) {
        if (gameState === 'playing') {
            if (keys['w'] || keys['W'] || keys['ArrowUp']) {
                playerObject.move('up');
            }
            if (keys['s'] || keys['S'] || keys['ArrowDown']) {
                playerObject.move('down');
            }
            
            aiPlayerObject.move();
            ball.xLocation += ball.speedX;
            ball.yLocation += ball.speedY;
            
            if (ball.yLocation - ball.radius < 0 || ball.yLocation + ball.radius > canvas.height) {
                ball.speedY = -ball.speedY;
            }
            
            const currentTime = timestamp;
            if (currentTime - ball.lastCollisionTime > ball.collisionDebounceTime) {
                const hitPlayerPaddle = (
                    ball.xLocation + ball.radius > playerObject.xLocation &&
                    ball.xLocation - ball.radius < playerObject.xLocation + playerObject.paddleWidth &&
                    ball.yLocation + ball.radius > playerObject.yLocation &&
                    ball.yLocation - ball.radius < playerObject.yLocation + playerObject.paddleHeight
                );
                const hitAiPaddle = (
                    ball.xLocation - ball.radius < aiPlayerObject.xLocation + aiPlayerObject.paddleWidth &&
                    ball.xLocation + ball.radius > aiPlayerObject.xLocation &&
                    ball.yLocation + ball.radius > aiPlayerObject.yLocation &&
                    ball.yLocation - ball.radius < aiPlayerObject.yLocation + aiPlayerObject.paddleHeight
                );
                if (hitPlayerPaddle || hitAiPaddle) {
                    ball.speedX = -ball.speedX;
                    ball.speedY += (Math.random() * 2 - 1);
                    ball.speedX *= 1.02;
                    if (Math.abs(ball.speedX) > 15) ball.speedX = 15 * Math.sign(ball.speedX);
                    if (Math.abs(ball.speedY) > 10) ball.speedY = 10 * Math.sign(ball.speedY);
                    ball.lastCollisionTime = currentTime;
                }
            }
            
            if (ball.xLocation - ball.radius < 0) {
                playerObject.score++;
                if (playerObject.score >= pointsToWin) {
                    gameState = 'win';
                } else {
                    ball.reset();
                }
            } else if (ball.xLocation + ball.radius > canvas.width) {
                aiPlayerObject.score++;
                if (aiPlayerObject.score >= pointsToWin) {
                    gameState = 'lose';
                } else {
                    ball.reset();
                }
            }
        }
    }
    
    function loop(timestamp) {
        clearCanvas();
        drawMiddleLine();
        drawAIPaddle();
        drawPlayerPaddle();
        drawBall();
        drawScores();
        drawLevelInfo();
        
        if (gameState === 'playing') {
            game(timestamp);
        } else if (gameState === 'win' || gameState === 'lose') {
            drawEndRoundMessage();
            if (gameState === 'win' && keys[' ']) {
                nextLevel();
            } else if (gameState === 'lose' && keys[' ']) {
                restartLevel();
            }
        }
        
        requestAnimationFrame(loop);
    }
    
    ball.updateSpeedForLevel(currentLevel);
    aiPlayerObject.updateDifficultyForLevel(currentLevel);
    loop();
});
