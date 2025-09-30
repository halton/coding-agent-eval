class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.renderer = new Renderer(this.canvas);
    this.input = new InputHandler();
    
    // Initialize game systems
    this.physics = new Physics({
      gravity: 0.8,
      jumpForce: -15,
      groundY: 330,
      coyoteTimeMs: 80
    });
    
    this.spawner = new Spawner(this.physics, {
      baseSpawnInterval: 2000,
      minSpawnInterval: 800,
      difficultyRampInterval: 30000
    });
    
    this.score = new Score({
      distanceMultiplier: 1,
      perfectJumpBonus: 10,
      streakMultiplier: 3
    });
    
    // Game state
    this.gameState = 'playing'; // 'playing', 'paused', 'gameOver'
    this.player = this.physics.createPlayer();
    this.lastTime = 0;
    this.gameSpeed = 5;
    this.lastObstacleX = null;
    this.perfectJumpThreshold = 20; // pixels from obstacle edge for perfect jump
    
    this.init();
  }

  init() {
    // Display initial high score
    this.renderer.updateUI(this.score.getStats(), this.score.getHighScore());
    
    // Start game loop
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  gameLoop(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.handleInput();
    
    if (this.gameState === 'playing') {
      this.update(deltaTime);
    }
    
    this.render();
    
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  handleInput() {
    // Pause/Resume
    if (this.input.consumePause()) {
      if (this.gameState === 'playing') {
        this.gameState = 'paused';
      } else if (this.gameState === 'paused') {
        this.gameState = 'playing';
      }
    }
    
    // Restart
    if (this.input.consumeRestart() && this.gameState === 'gameOver') {
      this.restart();
    }
    
    // Jump
    if (this.input.consumeJump() && this.gameState === 'playing') {
      const jumped = this.physics.jump(this.player);
      if (jumped) {
        this.checkPerfectJump();
      }
    }
  }

  update(deltaTime) {
    // Update player physics
    this.physics.updatePlayer(this.player, deltaTime);
    
    // Update distance score
    this.score.updateDistance(this.gameSpeed * deltaTime * 0.01);
    
    // Spawn obstacles
    this.spawner.spawnObstacle(this.canvas.width);
    
    // Update obstacles
    this.spawner.updateObstacles(deltaTime);
    
    // Check collisions
    const collision = this.spawner.checkCollisions(this.player);
    if (collision) {
      this.gameOver();
      return;
    }
    
    // Update UI
    this.renderer.updateUI(this.score.getStats(), this.score.getHighScore());
  }

  checkPerfectJump() {
    const obstacles = this.spawner.getObstacles();
    const playerCenterX = this.player.x + this.player.width / 2;
    
    // Find the closest obstacle that the player might have jumped over
    for (const obstacle of obstacles) {
      const obstacleRightEdge = obstacle.x + obstacle.width;
      const distanceFromEdge = Math.abs(playerCenterX - obstacleRightEdge);
      
      // Check if this was a close jump over an obstacle
      if (obstacleRightEdge < playerCenterX && 
          distanceFromEdge <= this.perfectJumpThreshold &&
          obstacle.x !== this.lastObstacleX) {
        
        this.score.recordPerfectJump();
        this.lastObstacleX = obstacle.x;
        break;
      }
    }
  }

  gameOver() {
    this.gameState = 'gameOver';
    
    // Save high score
    const isNewHighScore = this.score.saveHighScore();
    const highScore = this.score.getHighScore();
    
    // Show game over screen
    this.renderer.showGameOver(
      this.score.getStats(),
      highScore,
      isNewHighScore
    );
  }

  restart() {
    // Reset all game systems
    this.player = this.physics.createPlayer();
    this.spawner.reset();
    this.score.reset();
    this.gameState = 'playing';
    this.lastObstacleX = null;
    
    // Hide game over screen
    this.renderer.hideGameOver();
    
    // Update UI
    this.renderer.updateUI(this.score.getStats(), this.score.getHighScore());
  }

  render() {
    const renderState = {
      player: this.player,
      obstacles: this.spawner.getObstacles(),
      physics: this.physics,
      paused: this.gameState === 'paused'
    };
    
    this.renderer.render(renderState);
  }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
  new Game();
});