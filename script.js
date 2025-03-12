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
    const speedIncreaseInterval = 1000; 
    let lastSpeedIncreaseTime = 0;
    const speedIncreaseFactor = 0.02; 
    const ball = {
        xLocation: canvas.width / 2,
        yLocation: canvas.height / 2,
        radius: 10,
        speedX: 5,
        speedY: 5,
        baseSpeedX: 5,
        baseSpeedY: 5,
        reset: function() {
            this.xLocation = canvas.width / 2;
            this.yLocation = canvas.height / 2;
            this.speedX = this.baseSpeedX * (Math.random() > 0.5 ? 1: -1);
            this.speedY = this.baseSpeedY * (Math.random() > 0.5 ? 1: -1);
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
            const currentSpeed = this.baseSpeed * (ball.baseSpeedX / 5);
            if (direction === 'up' && this.yLocation > 0) {
                this.yLocation -= currentSpeed;
            } else if (direction === 'down' && this.yLocation + this.paddleHeight < canvas.height) {
                this.yLocation += currentSpeed;
            }
        }
    }
    const aiPlayerObject = {
        xLocation: 10,
        yLocation: 200,
        paddleWidth: 15,
        paddleHeight: 100,
        score: 0,
        baseSpeed: 5,
        move: function() {
            const goal = ball.yLocation - (this.yLocation + this.paddleHeight / 2);
            const currentSpeed = this.baseSpeed * (ball.baseSpeedX / 5);
            if (ball.speedX > 0) {
                if(Math.abs(this.yLocation - goal) > currentSpeed) {
                    if (this.yLocation < goal) {
                        this.yLocation += currentSpeed;
                    } else {
                        this.yLocation -= currentSpeed;
                    }
                }
            }
            if (this.yLocation < 0) this.yLocation = 0;
            if (this.yLocation + this.paddleHeight > canvas.height) this.yLocation = canvas.height - this.paddleHeight;
        }
    }
    const keys = {};
    document.addEventListener('keydown', function(e) {
        keys[e.key] = true;
    });
    document.addEventListener('keyup', function(e) {
        keys[e.key] = false;
    });
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
    function drawSpeedDisplay() {
        ctx.font = 'bold 16px Orbitron, Rajdhani, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = secondaryColor;
        const speedPercentage = Math.round((ball.baseSpeedX / 5 - 1) * 100);
        ctx.fillText(`Speed: +${speedPercentage}%`, canvas.width / 2, 20);
        const playerSpeedPercentage = Math.round((playerObject.baseSpeed * (ball.baseSpeedX / 5) / 6 - 1) * 100);
        ctx.fillText(`Paddle Speed: +${playerSpeedPercentage}%`, canvas.width / 2, 40);
    }
    function increaseSpeed() {
        ball.baseSpeedX += ball.baseSpeedX * speedIncreaseFactor;
        ball.baseSpeedY += ball.baseSpeedY * speedIncreaseFactor;
        const directionX = Math.sign(ball.speedX);
        const directionY = Math.sign(ball.speedY);
        ball.speedX = ball.baseSpeedX * directionX;
        ball.speedY = ball.baseSpeedY * directionY;
        if (ball.baseSpeedX > 15) ball.baseSpeedX = 15;
        if (ball.baseSpeedY > 10) ball.baseSpeedY = 10;
    }
    function game(timestamp) {
        if (!lastSpeedIncreaseTime) {
            lastSpeedIncreaseTime = timestamp;
        }
        if (timestamp - lastSpeedIncreaseTime > speedIncreaseInterval) {
            increaseSpeed();
            lastSpeedIncreaseTime = timestamp;
        }
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
        if (
            (ball.xLocation + ball.radius > playerObject.xLocation &&
            ball.xLocation - ball.radius < playerObject.xLocation + playerObject.paddleWidth &&
            ball.yLocation + ball.radius > playerObject.yLocation &&
            ball.yLocation - ball.radius < playerObject.yLocation + playerObject.paddleHeight)
            ||
            (ball.xLocation - ball.radius < aiPlayerObject.xLocation + aiPlayerObject.paddleWidth &&
            ball.xLocation + ball.radius > aiPlayerObject.xLocation &&
            ball.yLocation + ball.radius > aiPlayerObject.yLocation &&
            ball.yLocation - ball.radius < aiPlayerObject.yLocation + aiPlayerObject.paddleHeight)
        ) {
            ball.speedX = -ball.speedX;
            ball.speedY += (Math.random() * 2 - 1);
            ball.speedX *= 1.05;
            if (Math.abs(ball.speedX) > 15) ball.speedX = 15 * Math.sign(ball.speedX);
            if (Math.abs(ball.speedY) > 10) ball.speedY = 10 * Math.sign(ball.speedY);
        }
        if (ball.xLocation - ball.radius < 0) {
            playerObject.score++;
            ball.reset();
        } else if (ball.xLocation + ball.radius > canvas.width) {
            aiPlayerObject.score++;
            ball.reset();
        }
    }
    function loop(timestamp) {
        clearCanvas();
        drawMiddleLine();
        drawAIPaddle();
        drawPlayerPaddle();
        drawBall();
        drawScores();
        drawSpeedDisplay();
        game(timestamp);
        requestAnimationFrame(loop);
    }
    loop();
});

