class Spawner {
  constructor(physics, options = {}) {
    this.physics = physics;
    this.baseSpawnInterval = options.baseSpawnInterval || 2000; // ms
    this.minSpawnInterval = options.minSpawnInterval || 800; // ms
    this.difficultyRampInterval = options.difficultyRampInterval || 30000; // 30s
    this.lastSpawnTime = Date.now(); // Start with current time to prevent immediate spawn
    this.gameStartTime = Date.now();
    this.obstacles = [];
  }

  getCurrentDifficulty(currentTime = Date.now()) {
    const elapsed = currentTime - this.gameStartTime;
    return Math.floor(elapsed / this.difficultyRampInterval);
  }

  getSpawnInterval(currentTime = Date.now()) {
    const difficulty = this.getCurrentDifficulty(currentTime);
    const reduction = difficulty * 200; // Reduce by 200ms each level
    return Math.max(this.minSpawnInterval, this.baseSpawnInterval - reduction);
  }

  getObstacleSpeed(currentTime = Date.now()) {
    const difficulty = this.getCurrentDifficulty(currentTime);
    return 5 + difficulty * 0.5; // Base speed 5, increase by 0.5 each level
  }

  shouldSpawn(currentTime = Date.now()) {
    const spawnInterval = this.getSpawnInterval(currentTime);
    return currentTime - this.lastSpawnTime >= spawnInterval;
  }

  spawnObstacle(screenWidth, currentTime = Date.now()) {
    if (this.shouldSpawn(currentTime)) {
      const obstacle = this.physics.createObstacle(screenWidth);
      this.obstacles.push(obstacle);
      this.lastSpawnTime = currentTime;
      return obstacle;
    }
    return null;
  }

  updateObstacles(deltaTime, currentTime = Date.now()) {
    const speed = this.getObstacleSpeed(currentTime);
    
    this.obstacles.forEach(obstacle => {
      this.physics.updateObstacle(obstacle, deltaTime, speed);
    });

    // Remove off-screen obstacles
    this.obstacles = this.obstacles.filter(obstacle => 
      !this.physics.isObstacleOffScreen(obstacle, 0)
    );
  }

  getObstacles() {
    return this.obstacles;
  }

  reset() {
    this.obstacles = [];
    this.lastSpawnTime = Date.now(); // Reset to current time
    this.gameStartTime = Date.now();
  }

  checkCollisions(player) {
    for (const obstacle of this.obstacles) {
      if (this.physics.checkCollision(player, obstacle)) {
        return obstacle;
      }
    }
    return null;
  }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Spawner;
} else if (typeof window !== 'undefined') {
  window.Spawner = Spawner;
}