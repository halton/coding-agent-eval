class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = 800;
    this.canvas.height = 400;
  }

  render(gameState) {
    this.clear();
    this.drawBackground();
    this.drawGround();
    this.drawPlayer(gameState.player);
    this.drawObstacles(gameState.obstacles);
    this.drawUI(gameState);

    if (gameState.gameState === 'gameover') {
      this.drawGameOver(gameState);
    } else if (gameState.gameState === 'ready') {
      this.drawStartScreen();
    } else if (gameState.isPaused) {
      this.drawPauseScreen();
    }
  }

  clear() {
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#1a0033');
    gradient.addColorStop(1, '#0a0a0a');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = '#ff00ff';
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i < 20; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * 40, 0);
      this.ctx.lineTo(i * 40 + 100, 400);
      this.ctx.stroke();
    }
  }

  drawGround() {
    this.ctx.strokeStyle = '#00ffff';
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = '#00ffff';
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 300);
    this.ctx.lineTo(this.canvas.width, 300);
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
  }

  drawPlayer(player) {
    this.ctx.fillStyle = '#00ff00';
    this.ctx.shadowColor = '#00ff00';
    this.ctx.shadowBlur = 15;
    this.ctx.fillRect(
      player.x,
      player.y - player.height,
      player.width,
      player.height
    );

    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      player.x,
      player.y - player.height,
      player.width,
      player.height
    );
    this.ctx.shadowBlur = 0;
  }

  drawObstacles(obstacles) {
    this.ctx.fillStyle = '#ff00ff';
    this.ctx.shadowColor = '#ff00ff';
    this.ctx.shadowBlur = 10;

    for (const obstacle of obstacles) {
      this.ctx.fillRect(
        obstacle.x,
        obstacle.y - obstacle.height,
        obstacle.width,
        obstacle.height
      );

      this.ctx.strokeStyle = '#ff00ff';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        obstacle.x,
        obstacle.y - obstacle.height,
        obstacle.width,
        obstacle.height
      );
    }
    this.ctx.shadowBlur = 0;
  }

  drawUI(gameState) {
    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = 'bold 20px monospace';
    this.ctx.shadowColor = '#00ffff';
    this.ctx.shadowBlur = 5;

    this.ctx.fillText(`SCORE: ${gameState.score}`, 20, 30);
    this.ctx.fillText(`HIGH: ${gameState.highScore}`, 20, 55);
    this.ctx.fillText(`DISTANCE: ${gameState.distance}m`, 200, 30);

    if (gameState.streak > 0) {
      this.ctx.fillStyle = '#ffff00';
      this.ctx.fillText(`STREAK: x${gameState.streak}`, 200, 55);
    }

    this.ctx.fillStyle = '#ff00ff';
    this.ctx.fillText(`LEVEL: ${gameState.difficultyLevel}`, 650, 30);

    this.ctx.shadowBlur = 0;
  }

  drawGameOver(gameState) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#ff0000';
    this.ctx.font = 'bold 48px monospace';
    this.ctx.shadowColor = '#ff0000';
    this.ctx.shadowBlur = 20;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, 150);

    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = 'bold 24px monospace';
    this.ctx.fillText(`FINAL SCORE: ${gameState.score}`, this.canvas.width / 2, 200);

    if (gameState.score >= gameState.highScore) {
      this.ctx.fillStyle = '#ffff00';
      this.ctx.fillText('NEW HIGH SCORE!', this.canvas.width / 2, 235);
    }

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '18px monospace';
    this.ctx.fillText('Press R to restart', this.canvas.width / 2, 280);
    this.ctx.textAlign = 'left';
    this.ctx.shadowBlur = 0;
  }

  drawStartScreen() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#00ffff';
    this.ctx.font = 'bold 48px monospace';
    this.ctx.shadowColor = '#00ffff';
    this.ctx.shadowBlur = 20;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('NEON RUNNER', this.canvas.width / 2, 150);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px monospace';
    this.ctx.shadowBlur = 0;
    this.ctx.fillText('Press SPACE to start', this.canvas.width / 2, 200);
    this.ctx.fillText('SPACE = Jump', this.canvas.width / 2, 240);
    this.ctx.fillText('P = Pause', this.canvas.width / 2, 265);
    this.ctx.fillText('R = Restart', this.canvas.width / 2, 290);
    this.ctx.textAlign = 'left';
  }

  drawPauseScreen() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = 'bold 36px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = '#ffff00';
    this.ctx.shadowBlur = 15;
    this.ctx.fillText('PAUSED', this.canvas.width / 2, 200);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px monospace';
    this.ctx.shadowBlur = 0;
    this.ctx.fillText('Press P to resume', this.canvas.width / 2, 240);
    this.ctx.textAlign = 'left';
  }
}