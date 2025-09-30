const Score = require('../src/score');

describe('Score', () => {
  let score;

  beforeEach(() => {
    score = new Score();
    if (typeof global !== 'undefined') {
      global.localStorage = {
        store: {},
        getItem: function(key) { return this.store[key] || null; },
        setItem: function(key, value) { this.store[key] = value.toString(); },
        clear: function() { this.store = {}; }
      };
    }
  });

  describe('initialization', () => {
    test('should initialize with zero values', () => {
      expect(score.distance).toBe(0);
      expect(score.streak).toBe(0);
      expect(score.bonusPoints).toBe(0);
      expect(score.perfectJumps).toBe(0);
    });
  });

  describe('update', () => {
    test('should calculate distance correctly', () => {
      score.update(100);
      expect(score.distance).toBe(10);

      score.update(555);
      expect(score.distance).toBe(55);

      score.update(1234);
      expect(score.distance).toBe(123);
    });
  });

  describe('registerJump', () => {
    let obstacle;

    beforeEach(() => {
      obstacle = { x: 200, y: 300, height: 40 };
    });

    test('should not register same obstacle twice', () => {
      score.registerJump(obstacle, 250);
      score.registerJump(obstacle, 250);

      expect(score.perfectJumps).toBe(1);
    });

    test('should detect perfect jump', () => {
      score.registerJump(obstacle, 250);

      expect(score.perfectJumps).toBe(1);
      expect(score.streak).toBe(0);
    });

    test('should award streak bonus after 3 perfect jumps', () => {
      const obstacle1 = { x: 100, y: 300, height: 40 };
      const obstacle2 = { x: 200, y: 300, height: 40 };
      const obstacle3 = { x: 300, y: 300, height: 40 };

      score.registerJump(obstacle1, 250);
      score.registerJump(obstacle2, 250);
      score.registerJump(obstacle3, 250);

      expect(score.perfectJumps).toBe(3);
      expect(score.streak).toBe(1);
      expect(score.bonusPoints).toBe(50);
    });

    test('should increase streak multiplier', () => {
      const obstacles = Array(6).fill(null).map((_, i) => ({
        x: 100 + i * 100,
        y: 300,
        height: 40
      }));

      obstacles.forEach(obs => score.registerJump(obs, 250));

      expect(score.streak).toBe(2);
      expect(score.bonusPoints).toBe(150);
    });

    test('should reset streak on imperfect jump', () => {
      const obstacle1 = { x: 100, y: 300, height: 40 };
      const obstacle2 = { x: 200, y: 300, height: 40 };
      const obstacle3 = { x: 300, y: 300, height: 40 };

      score.registerJump(obstacle1, 250);
      score.registerJump(obstacle2, 250);
      score.registerJump(obstacle3, 200);

      expect(score.perfectJumps).toBe(0);
      expect(score.streak).toBe(0);
    });

    test('should consider clearance range for perfect jumps', () => {
      score.registerJump(obstacle, 241);
      expect(score.perfectJumps).toBe(1);

      const obstacle2 = { x: 400, y: 300, height: 40 };
      score.registerJump(obstacle2, 209);
      expect(score.perfectJumps).toBe(0);

      const obstacle3 = { x: 500, y: 300, height: 40 };
      score.registerJump(obstacle3, 251);
      expect(score.perfectJumps).toBe(0);
    });
  });

  describe('getTotal', () => {
    test('should calculate total score correctly', () => {
      score.distance = 100;
      score.bonusPoints = 50;

      expect(score.getTotal()).toBe(150);
    });
  });

  describe('high score management', () => {
    test('should save new high score', () => {
      score.distance = 100;
      score.highScore = 50;

      const isNew = score.saveHighScore();

      expect(isNew).toBe(true);
      expect(score.highScore).toBe(100);
      expect(localStorage.getItem('neonRunnerHighScore')).toBe('100');
    });

    test('should not save lower score', () => {
      score.distance = 30;
      score.highScore = 50;

      const isNew = score.saveHighScore();

      expect(isNew).toBe(false);
      expect(score.highScore).toBe(50);
    });

    test('should load saved high score', () => {
      localStorage.setItem('neonRunnerHighScore', '250');

      const newScore = new Score();
      expect(newScore.highScore).toBe(250);
    });
  });

  describe('reset', () => {
    test('should reset all values except high score', () => {
      score.distance = 100;
      score.streak = 3;
      score.bonusPoints = 150;
      score.perfectJumps = 5;
      score.highScore = 500;

      score.reset();

      expect(score.distance).toBe(0);
      expect(score.streak).toBe(0);
      expect(score.bonusPoints).toBe(0);
      expect(score.perfectJumps).toBe(0);
      expect(score.highScore).toBe(500);
    });
  });

  describe('resetStreak', () => {
    test('should reset streak-related values', () => {
      score.perfectJumps = 2;
      score.streak = 1;

      score.resetStreak();

      expect(score.perfectJumps).toBe(0);
      expect(score.streak).toBe(0);
    });
  });
});