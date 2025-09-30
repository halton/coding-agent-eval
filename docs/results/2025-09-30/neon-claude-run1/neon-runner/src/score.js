class Score {
  constructor() {
    this.distance = 0;
    this.highScore = this.loadHighScore();
    this.streak = 0;
    this.maxStreak = 0;
    this.bonusPoints = 0;
    this.lastJumpedObstacle = null;
    this.perfectJumps = 0;
  }

  update(distanceTraveled) {
    this.distance = Math.floor(distanceTraveled / 10);
  }

  registerJump(obstacle, playerY) {
    if (!obstacle || obstacle === this.lastJumpedObstacle) {
      return;
    }

    this.lastJumpedObstacle = obstacle;
    const clearanceHeight = 300 - obstacle.height - playerY;

    if (clearanceHeight > 10 && clearanceHeight < 50) {
      this.perfectJumps++;

      if (this.perfectJumps >= 3) {
        this.streak++;
        this.bonusPoints += 50 * this.streak;

        if (this.streak > this.maxStreak) {
          this.maxStreak = this.streak;
        }
      }
    } else {
      this.perfectJumps = 0;
      this.streak = 0;
    }
  }

  resetStreak() {
    this.perfectJumps = 0;
    this.streak = 0;
  }

  getTotal() {
    return this.distance + this.bonusPoints;
  }

  saveHighScore() {
    const total = this.getTotal();
    if (total > this.highScore) {
      this.highScore = total;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('neonRunnerHighScore', this.highScore.toString());
      }
      return true;
    }
    return false;
  }

  loadHighScore() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('neonRunnerHighScore');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  }

  reset() {
    this.distance = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.bonusPoints = 0;
    this.lastJumpedObstacle = null;
    this.perfectJumps = 0;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Score;
}