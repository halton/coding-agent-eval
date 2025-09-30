class Game {
  constructor() {
    this.physics = new Physics();
    this.spawner = new Spawner();
    this.score = new Score();

    this.player = {
      x: 100,
      y: 300,
      width: 30,
      height: 40,
      velocityY: 0,
      grounded: true,
      jumping: false,
      lastGroundedTime: Date.now()
    };

    this.gameState = 'ready';
    this.isPaused = false;
    this.distanceTraveled = 0;
    this.startTime = null;
    this.pausedTime = 0;
    this.pauseStartTime = null;
  }

  start() {
    if (this.gameState === 'ready' || this.gameState === 'gameover') {
      this.reset();
      this.gameState = 'playing';
      this.startTime = Date.now();
    }
  }

  reset() {
    this.player = {
      x: 100,
      y: 300,
      width: 30,
      height: 40,
      velocityY: 0,
      grounded: true,
      jumping: false,
      lastGroundedTime: Date.now()
    };

    this.spawner.reset();
    this.score.reset();
    this.distanceTraveled = 0;
    this.startTime = null;
    this.pausedTime = 0;
    this.pauseStartTime = null;
    this.isPaused = false;
  }

  pause() {
    if (this.gameState === 'playing' && !this.isPaused) {
      this.isPaused = true;
      this.pauseStartTime = Date.now();
    }
  }

  resume() {
    if (this.isPaused) {
      this.pausedTime += Date.now() - this.pauseStartTime;
      this.isPaused = false;
      this.pauseStartTime = null;
    }
  }

  togglePause() {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  jump() {
    if (this.gameState === 'playing' && !this.isPaused) {
      const jumped = this.physics.jump(this.player);
      if (jumped) {
        const nearestObstacle = this.findNearestObstacle();
        if (nearestObstacle) {
          this.score.registerJump(nearestObstacle, this.player.y);
        }
      }
    }
  }

  releaseJump() {
    this.player.jumping = false;
  }

  findNearestObstacle() {
    const obstacles = this.spawner.getObstacles();
    let nearest = null;
    let minDistance = Infinity;

    for (const obstacle of obstacles) {
      if (obstacle.x > this.player.x - 50 && obstacle.x < this.player.x + 200) {
        const distance = obstacle.x - this.player.x;
        if (distance < minDistance) {
          minDistance = distance;
          nearest = obstacle;
        }
      }
    }

    return nearest;
  }

  update() {
    if (this.gameState !== 'playing' || this.isPaused) {
      return;
    }

    const currentTime = Date.now() - this.pausedTime;
    this.distanceTraveled += 5;
    this.score.update(this.distanceTraveled);

    this.physics.applyGravity(this.player);
    this.spawner.update(currentTime);

    const obstacles = this.spawner.getObstacles();
    for (const obstacle of obstacles) {
      if (this.physics.checkCollision(this.player, obstacle)) {
        this.gameOver();
        break;
      }
    }
  }

  gameOver() {
    this.gameState = 'gameover';
    const isNewHighScore = this.score.saveHighScore();
    return isNewHighScore;
  }

  getState() {
    return {
      player: this.player,
      obstacles: this.spawner.getObstacles(),
      score: this.score.getTotal(),
      highScore: this.score.highScore,
      distance: this.score.distance,
      streak: this.score.streak,
      bonusPoints: this.score.bonusPoints,
      gameState: this.gameState,
      isPaused: this.isPaused,
      difficultyLevel: this.spawner.difficultyLevel
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game;
}