class Spawner {
  constructor() {
    this.obstacles = [];
    this.lastSpawnTime = 0;
    this.spawnInterval = 2000;
    this.minSpawnInterval = 800;
    this.obstacleSpeed = 5;
    this.maxObstacleSpeed = 12;
    this.difficultyIncreaseInterval = 30000;
    this.lastDifficultyIncrease = Date.now();
    this.difficultyLevel = 1;
  }

  update(currentTime) {
    this.updateDifficulty(currentTime);

    if (currentTime - this.lastSpawnTime > this.spawnInterval) {
      this.spawnObstacle();
      this.lastSpawnTime = currentTime;
    }

    this.obstacles = this.obstacles.filter(obstacle => {
      obstacle.x -= this.obstacleSpeed;
      return obstacle.x > -50;
    });
  }

  updateDifficulty(currentTime) {
    if (currentTime - this.lastDifficultyIncrease > this.difficultyIncreaseInterval) {
      this.difficultyLevel++;
      this.lastDifficultyIncrease = currentTime;

      this.spawnInterval = Math.max(
        this.minSpawnInterval,
        this.spawnInterval - 150
      );

      this.obstacleSpeed = Math.min(
        this.maxObstacleSpeed,
        this.obstacleSpeed + 0.5
      );
    }
  }

  spawnObstacle() {
    const heightVariation = Math.random() < 0.5;
    this.obstacles.push({
      x: 800,
      y: 300,
      width: 30,
      height: heightVariation ? 60 : 40,
      type: 'obstacle'
    });
  }

  reset() {
    this.obstacles = [];
    this.lastSpawnTime = 0;
    this.spawnInterval = 2000;
    this.obstacleSpeed = 5;
    this.difficultyLevel = 1;
    this.lastDifficultyIncrease = Date.now();
  }

  getObstacles() {
    return this.obstacles;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Spawner;
}