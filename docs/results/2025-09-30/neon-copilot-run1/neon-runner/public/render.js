class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    // Neon colors
    this.colors = {
      player: '#00ff88',
      playerGlow: '#00ff88',
      obstacle: '#ff0080',
      obstacleGlow: '#ff0080',
      ground: '#0088ff',
      background: '#001122',
      ui: '#00ffff'
    };
  }

  clear() {
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawNeonRect(x, y, width, height, color, glowColor = color) {
    // Draw glow effect
    this.ctx.shadowColor = glowColor;
    this.ctx.shadowBlur = 15;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
    
    // Draw inner highlight
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = `${color}88`; // Semi-transparent
    this.ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
  }

  drawPlayer(player) {
    // Main body
    this.drawNeonRect(
      player.x, 
      player.y, 
      player.width, 
      player.height, 
      this.colors.player,
      this.colors.playerGlow
    );
    
    // Add some detail
    this.ctx.shadowColor = this.colors.playerGlow;
    this.ctx.shadowBlur = 10;
    this.ctx.strokeStyle = this.colors.player;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(player.x + 5, player.y + 5, player.width - 10, player.height - 10);
    this.ctx.shadowBlur = 0;
  }

  drawObstacle(obstacle) {
    this.drawNeonRect(
      obstacle.x,
      obstacle.y,
      obstacle.width,
      obstacle.height,
      this.colors.obstacle,
      this.colors.obstacleGlow
    );
  }

  drawGround(groundY) {
    // Ground line with glow
    this.ctx.shadowColor = this.colors.ground;
    this.ctx.shadowBlur = 20;
    this.ctx.strokeStyle = this.colors.ground;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(0, groundY);
    this.ctx.lineTo(this.width, groundY);
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
    
    // Ground grid pattern
    this.ctx.strokeStyle = `${this.colors.ground}33`;
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, groundY);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
  }

  drawBackground() {
    // Animated background grid
    const time = Date.now() * 0.001;
    this.ctx.strokeStyle = `${this.colors.ui}11`;
    this.ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = (time * 50) % 80 - 80; x < this.width; x += 80) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < this.height; y += 80) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  drawParticles(player) {
    // Simple particle effect when player jumps
    if (!player.onGround && player.velocityY < 0) {
      const particleCount = 3;
      for (let i = 0; i < particleCount; i++) {
        const x = player.x + Math.random() * player.width;
        const y = player.y + player.height;
        const size = Math.random() * 3 + 1;
        
        this.ctx.shadowColor = this.colors.playerGlow;
        this.ctx.shadowBlur = 5;
        this.ctx.fillStyle = this.colors.player;
        this.ctx.fillRect(x, y, size, size);
        this.ctx.shadowBlur = 0;
      }
    }
  }

  drawPauseOverlay() {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Pause text
    this.ctx.font = '48px Courier New';
    this.ctx.fillStyle = this.colors.ui;
    this.ctx.shadowColor = this.colors.ui;
    this.ctx.shadowBlur = 15;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);
    
    // Instructions
    this.ctx.font = '20px Courier New';
    this.ctx.fillText('Press P to resume', this.width / 2, this.height / 2 + 60);
    this.ctx.shadowBlur = 0;
    this.ctx.textAlign = 'start';
  }

  render(gameState) {
    this.clear();
    this.drawBackground();
    this.drawGround(gameState.physics.groundY);
    
    // Draw obstacles
    gameState.obstacles.forEach(obstacle => {
      this.drawObstacle(obstacle);
    });
    
    // Draw player
    this.drawPlayer(gameState.player);
    this.drawParticles(gameState.player);
    
    // Draw pause overlay if paused
    if (gameState.paused) {
      this.drawPauseOverlay();
    }
  }

  updateUI(stats, highScore) {
    document.getElementById('score').textContent = stats.totalScore;
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('distance').textContent = stats.distance;
    document.getElementById('streak').textContent = stats.currentStreak;
  }

  showGameOver(stats, highScore, isNewHighScore) {
    const gameOverDiv = document.getElementById('gameOver');
    
    document.getElementById('finalScore').textContent = stats.totalScore;
    document.getElementById('finalDistance').textContent = stats.distance;
    document.getElementById('finalPerfectJumps').textContent = stats.perfectJumps;
    document.getElementById('finalStreakBonus').textContent = stats.streakBonus;
    
    const newHighScoreDiv = document.getElementById('newHighScore');
    if (isNewHighScore) {
      newHighScoreDiv.style.display = 'block';
    } else {
      newHighScoreDiv.style.display = 'none';
    }
    
    document.getElementById('highScore').textContent = highScore;
    gameOverDiv.style.display = 'block';
  }

  hideGameOver() {
    document.getElementById('gameOver').style.display = 'none';
  }
}