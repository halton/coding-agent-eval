document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const renderer = createRenderer(canvas);

    let gameState = 'playing'; // playing, paused, gameOver
    let player, spawner, score, distance;
    let lastTime = 0;
    let gameTime = 0;

    function resetGame() {
        player = createPlayer();
        spawner = createSpawner(canvas.width);
        score = createScore();
        loadHighScore(score, localStorage);
        distance = 0;
        gameTime = 0;
        gameState = 'playing';
    }

    function gameLoop(timestamp) {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        if (inputState.pause) {
            gameState = (gameState === 'playing') ? 'paused' : 'playing';
            inputState.pause = false; // Consume input
        }

        if (gameState === 'paused') {
            renderer.drawPauseScreen();
            requestAnimationFrame(gameLoop);
            return;
        }

        if (gameState === 'gameOver') {
            if (inputState.restart) {
                resetGame();
            }
            renderer.drawGameOver(score);
            requestAnimationFrame(gameLoop);
            return;
        }

        gameTime += deltaTime;
        distance += spawner.speed;

        // Update game objects
        updatePlayer(player, deltaTime);
        updateSpawner(spawner, deltaTime, gameTime);
        updateScore(score, distance);

        // Handle input
        if (inputState.jump) {
            jump(player);
            inputState.jump = false; // Consume jump input
        }

        // Check for collisions
        let perfectJump = false;
        spawner.obstacles.forEach(obstacle => {
            if (player.x < obstacle.x + obstacle.width &&
                player.x + player.width > obstacle.x &&
                player.y < obstacle.y + obstacle.height &&
                player.y + player.height > obstacle.y) {
                gameState = 'gameOver';
                saveHighScore(score, localStorage);
            }

            // Check for perfect jump (clearing an obstacle)
            const obstacleRightEdge = obstacle.x + obstacle.width;
            if (obstacleRightEdge > player.x && obstacleRightEdge < player.x + spawner.speed) {
                perfectJump = true;
            }
        });

        if (perfectJump) {
            recordPerfectJump(score);
        } else {
            resetStreak(score);
        }

        // Draw everything
        renderer.clear();
        renderer.drawPlayer(player);
        renderer.drawObstacles(spawner.obstacles);
        renderer.drawScore(score);

        requestAnimationFrame(gameLoop);
    }

    resetGame();
    requestAnimationFrame(gameLoop);
});
