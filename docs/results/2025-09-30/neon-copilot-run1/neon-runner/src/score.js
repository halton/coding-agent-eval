class Score {
  constructor(options = {}) {
    this.distance = 0;
    this.perfectJumps = 0;
    this.currentStreak = 0;
    this.streakBonus = 0;
    this.distanceMultiplier = options.distanceMultiplier || 1;
    this.perfectJumpBonus = options.perfectJumpBonus || 10;
    this.streakMultiplier = options.streakMultiplier || 3;
    this.storageKey = options.storageKey || 'neon-runner-high-score';
  }

  updateDistance(deltaDistance) {
    this.distance += deltaDistance;
  }

  recordPerfectJump() {
    this.perfectJumps++;
    this.currentStreak++;
    
    // Streak bonus every 3 perfect jumps
    if (this.currentStreak >= 3) {
      this.streakBonus += this.perfectJumpBonus * this.streakMultiplier;
      this.currentStreak = 0;
    }
  }

  breakStreak() {
    this.currentStreak = 0;
  }

  getScore() {
    const distanceScore = Math.floor(this.distance * this.distanceMultiplier);
    const perfectScore = this.perfectJumps * this.perfectJumpBonus;
    return distanceScore + perfectScore + this.streakBonus;
  }

  getStats() {
    return {
      distance: Math.floor(this.distance),
      perfectJumps: this.perfectJumps,
      currentStreak: this.currentStreak,
      streakBonus: this.streakBonus,
      totalScore: this.getScore()
    };
  }

  reset() {
    this.distance = 0;
    this.perfectJumps = 0;
    this.currentStreak = 0;
    this.streakBonus = 0;
  }

  // High score persistence methods (require localStorage)
  getHighScore() {
    if (typeof localStorage === 'undefined') return 0;
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? parseInt(stored, 10) : 0;
    } catch (e) {
      return 0;
    }
  }

  saveHighScore() {
    if (typeof localStorage === 'undefined') return false;
    try {
      const currentScore = this.getScore();
      const highScore = this.getHighScore();
      
      if (currentScore > highScore) {
        localStorage.setItem(this.storageKey, currentScore.toString());
        return true; // New high score
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  isNewHighScore() {
    const currentScore = this.getScore();
    const highScore = this.getHighScore();
    return currentScore > highScore;
  }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Score;
} else if (typeof window !== 'undefined') {
  window.Score = Score;
}