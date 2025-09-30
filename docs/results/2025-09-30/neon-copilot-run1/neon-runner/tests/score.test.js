const Score = require('../src/score');

describe('Score', () => {
  let score;

  beforeEach(() => {
    score = new Score({
      distanceMultiplier: 1,
      perfectJumpBonus: 10,
      streakMultiplier: 3
    });
  });

  describe('Distance Scoring', () => {
    test('tracks distance correctly', () => {
      score.updateDistance(100.5);
      score.updateDistance(50.3);
      
      expect(score.distance).toBe(150.8);
    });

    test('calculates distance score', () => {
      score.updateDistance(100.5);
      
      const totalScore = score.getScore();
      expect(totalScore).toBe(100); // Floor of 100.5
    });
  });

  describe('Perfect Jump Scoring', () => {
    test('tracks perfect jumps', () => {
      score.recordPerfectJump();
      score.recordPerfectJump();
      
      expect(score.perfectJumps).toBe(2);
      expect(score.currentStreak).toBe(2);
    });

    test('awards streak bonus every 3 perfect jumps', () => {
      score.recordPerfectJump();
      score.recordPerfectJump();
      expect(score.streakBonus).toBe(0);
      expect(score.currentStreak).toBe(2);
      
      score.recordPerfectJump(); // Third jump triggers bonus
      
      expect(score.streakBonus).toBe(30); // 10 * 3 multiplier
      expect(score.currentStreak).toBe(0); // Reset after bonus
    });

    test('continues streak after bonus', () => {
      // First streak
      score.recordPerfectJump();
      score.recordPerfectJump();
      score.recordPerfectJump();
      expect(score.streakBonus).toBe(30);
      
      // Second streak
      score.recordPerfectJump();
      score.recordPerfectJump();
      score.recordPerfectJump();
      
      expect(score.streakBonus).toBe(60); // 30 + 30
    });

    test('breaks streak correctly', () => {
      score.recordPerfectJump();
      score.recordPerfectJump();
      expect(score.currentStreak).toBe(2);
      
      score.breakStreak();
      
      expect(score.currentStreak).toBe(0);
    });
  });

  describe('Total Score Calculation', () => {
    test('combines distance, perfect jumps, and streak bonuses', () => {
      score.updateDistance(100);
      score.recordPerfectJump();
      score.recordPerfectJump();
      score.recordPerfectJump(); // Triggers streak bonus
      
      const totalScore = score.getScore();
      const expected = 100 + (3 * 10) + 30; // distance + perfect jumps + streak bonus
      
      expect(totalScore).toBe(expected);
    });
  });

  describe('Game Statistics', () => {
    test('returns complete stats', () => {
      score.updateDistance(150.7);
      score.recordPerfectJump();
      score.recordPerfectJump();
      
      const stats = score.getStats();
      
      expect(stats.distance).toBe(150);
      expect(stats.perfectJumps).toBe(2);
      expect(stats.currentStreak).toBe(2);
      expect(stats.streakBonus).toBe(0);
      expect(stats.totalScore).toBe(170); // 150 + 20 + 0
    });
  });

  describe('Game Reset', () => {
    test('resets all scoring values', () => {
      score.updateDistance(100);
      score.recordPerfectJump();
      score.recordPerfectJump();
      score.recordPerfectJump();
      
      score.reset();
      
      expect(score.distance).toBe(0);
      expect(score.perfectJumps).toBe(0);
      expect(score.currentStreak).toBe(0);
      expect(score.streakBonus).toBe(0);
      expect(score.getScore()).toBe(0);
    });
  });

  describe('High Score Persistence', () => {
    // Note: These tests would need localStorage mock for full testing
    // For now, we test the logic that doesn't require localStorage
    
    test('detects new high score correctly', () => {
      // Mock localStorage for this test
      const mockLocalStorage = {
        getItem: jest.fn().mockReturnValue('50'),
        setItem: jest.fn()
      };
      global.localStorage = mockLocalStorage;
      
      score.updateDistance(100); // Score = 100
      
      expect(score.isNewHighScore()).toBe(true);
    });

    test('handles missing localStorage gracefully', () => {
      delete global.localStorage;
      
      const highScore = score.getHighScore();
      const saved = score.saveHighScore();
      
      expect(highScore).toBe(0);
      expect(saved).toBe(false);
    });
  });
});