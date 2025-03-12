document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const ball = {
        xLocation: canvas.width / 2,
        yLocation: canvas.height / 2,
        radius: 10,
        speedX: 5,
        speedY: 5,
        reset: function() {
            this.xLocation = canvas.width / 2;
            this.yLocation = canvas.height / 2;
            this.speedX = 5 * (Math.random() > 0.5 ? 1: -1);
            this.speedY = 5 * (Math.random() > 0.5 ? 1: -1);
        }
    }
    const playerObject = {
        xLocation: 775, 
        yLocation: 200,
        paddleWidth: 15,
        paddleHeight: 100,
        score: 0,
        move: function(direction) {
            if (direction === 'up' && this.yLocation > 0) {
                this.yLocation -= 6;
            } else if (direction === 'down' && this.yLocation + this.paddleHeight < canvas.height) {
                this.yLocation += 6;
            }
        }
    }
    const aiPlayerObject = {
        xLocation: 10,
        yLocation: 200,
        paddleWidth: 15,
        paddleHeight: 100,
        score: 0,
        move: function() {
            const goal = ball.yLocation - (this.yLocation + this.paddleHeight / 2);
            const aiSpeed = 5;
            if (ball.speedX > 0) {
                if(Math.abs(this.yLocation - goal) > aiSpeed) {
                    if (this.yLocation < goal) {
                        this.yLocation += aiSpeed;
                    } else {
                        this.yLocation -= aiSpeed;
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
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    function drawBall() {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ball.xLocation, ball.yLocation, 10, 0, Math.PI * 2);
        ctx.fill();
    }
    function drawMiddleLine() {
        ctx.strokeStyle = "white";
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    function drawAIPaddle() {
        ctx.fillStyle = 'red';
        ctx.fillRect(aiPlayerObject.xLocation, aiPlayerObject.yLocation, aiPlayerObject.paddleWidth, aiPlayerObject.paddleHeight);
    }
    function drawPlayerPaddle() {
        ctx.fillStyle = 'green';
        ctx.fillRect(playerObject.xLocation, playerObject.yLocation, playerObject.paddleWidth, playerObject.paddleHeight);
    }
    function drawScores() {
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = "white";
        ctx.fillText(aiPlayerObject.score, canvas.width / 4, 50);
        ctx.fillText(playerObject.score, canvas.width * 3/4, 50);
    }
    function game() {
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
    function loop() {
        clearCanvas();
        drawBall();
        drawMiddleLine();
        drawAIPaddle();
        drawPlayerPaddle();
        drawScores();
        game();
        requestAnimationFrame(loop);
    }
    loop();
});

