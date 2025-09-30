function createRenderer(canvas) {
    const ctx = canvas.getContext('2d');

    function drawPlayer(player) {
        ctx.fillStyle = '#0ff'; // Neon blue
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    function drawObstacles(obstacles) {
        ctx.fillStyle = '#f0f'; // Neon pink
        obstacles.forEach(obstacle => {
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    }

    function drawScore(score) {
        ctx.fillStyle = '#fff';
        ctx.font = '24px monospace';
        ctx.fillText(`Score: ${score.currentScore}`, 20, 30);
        ctx.fillText(`High Score: ${score.highScore}`, 20, 60);
    }

    function drawGameOver(score) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = '48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
        ctx.font = '24px monospace';
        ctx.fillText(`Final Score: ${score.currentScore}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 40);
        ctx.textAlign = 'left';
    }

    function drawPauseScreen() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = '48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
    }

    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return { drawPlayer, drawObstacles, drawScore, drawGameOver, drawPauseScreen, clear };
}
