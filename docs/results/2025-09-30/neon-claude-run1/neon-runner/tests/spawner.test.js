const Spawner = require('../src/spawner');

describe('Spawner', () => {
  let spawner;

  beforeEach(() => {
    spawner = new Spawner();
  });

  describe('initialization', () => {
    test('should initialize with correct default values', () => {
      expect(spawner.obstacles).toEqual([]);
      expect(spawner.spawnInterval).toBe(2000);
      expect(spawner.obstacleSpeed).toBe(5);
      expect(spawner.difficultyLevel).toBe(1);
    });
  });

  describe('spawnObstacle', () => {
    test('should spawn obstacle at correct position', () => {
      spawner.spawnObstacle();

      expect(spawner.obstacles.length).toBe(1);
      expect(spawner.obstacles[0].x).toBe(800);
      expect(spawner.obstacles[0].y).toBe(300);
      expect(spawner.obstacles[0].width).toBe(30);
    });

    test('should spawn obstacles with height variation', () => {
      Math.random = jest.fn()
        .mockReturnValueOnce(0.3)
        .mockReturnValueOnce(0.7);

      spawner.spawnObstacle();
      spawner.spawnObstacle();

      expect(spawner.obstacles[0].height).toBe(60);
      expect(spawner.obstacles[1].height).toBe(40);
    });
  });

  describe('update', () => {
    test('should spawn obstacles at intervals', () => {
      const initialTime = Date.now();

      spawner.update(initialTime);
      expect(spawner.obstacles.length).toBe(0);

      spawner.update(initialTime + 2100);
      expect(spawner.obstacles.length).toBe(1);

      spawner.update(initialTime + 4200);
      expect(spawner.obstacles.length).toBe(2);
    });

    test('should move obstacles leftward', () => {
      spawner.spawnObstacle();
      const initialX = spawner.obstacles[0].x;

      spawner.update(Date.now());

      expect(spawner.obstacles[0].x).toBe(initialX - spawner.obstacleSpeed);
    });

    test('should remove off-screen obstacles', () => {
      spawner.obstacles.push({ x: -60, y: 300, width: 30, height: 40 });
      spawner.obstacles.push({ x: 100, y: 300, width: 30, height: 40 });

      spawner.update(Date.now());

      expect(spawner.obstacles.length).toBe(1);
      expect(spawner.obstacles[0].x).toBeLessThan(100);
    });
  });

  describe('difficulty ramping', () => {
    test('should increase difficulty every 30 seconds', () => {
      const initialTime = Date.now();
      spawner.lastDifficultyIncrease = initialTime;

      spawner.updateDifficulty(initialTime + 29000);
      expect(spawner.difficultyLevel).toBe(1);

      spawner.updateDifficulty(initialTime + 31000);
      expect(spawner.difficultyLevel).toBe(2);
      expect(spawner.spawnInterval).toBeLessThan(2000);
      expect(spawner.obstacleSpeed).toBeGreaterThan(5);
    });

    test('should decrease spawn interval with difficulty', () => {
      const initialTime = Date.now();
      spawner.lastDifficultyIncrease = initialTime;
      const initialInterval = spawner.spawnInterval;

      spawner.updateDifficulty(initialTime + 31000);
      expect(spawner.spawnInterval).toBe(initialInterval - 150);

      spawner.updateDifficulty(initialTime + 61000);
      expect(spawner.spawnInterval).toBe(initialInterval - 300);
    });

    test('should increase obstacle speed with difficulty', () => {
      const initialTime = Date.now();
      spawner.lastDifficultyIncrease = initialTime;
      const initialSpeed = spawner.obstacleSpeed;

      spawner.updateDifficulty(initialTime + 31000);
      expect(spawner.obstacleSpeed).toBe(initialSpeed + 0.5);

      spawner.updateDifficulty(initialTime + 61000);
      expect(spawner.obstacleSpeed).toBe(initialSpeed + 1);
    });

    test('should respect minimum spawn interval', () => {
      const initialTime = Date.now();
      spawner.lastDifficultyIncrease = initialTime;
      spawner.spawnInterval = 900;

      spawner.updateDifficulty(initialTime + 31000);
      expect(spawner.spawnInterval).toBe(800);

      spawner.updateDifficulty(initialTime + 61000);
      expect(spawner.spawnInterval).toBe(800);
    });

    test('should respect maximum obstacle speed', () => {
      const initialTime = Date.now();
      spawner.lastDifficultyIncrease = initialTime;
      spawner.obstacleSpeed = 11.8;

      spawner.updateDifficulty(initialTime + 31000);
      expect(spawner.obstacleSpeed).toBe(12);

      spawner.updateDifficulty(initialTime + 61000);
      expect(spawner.obstacleSpeed).toBe(12);
    });
  });

  describe('reset', () => {
    test('should reset all values to initial state', () => {
      spawner.spawnObstacle();
      spawner.spawnInterval = 1000;
      spawner.obstacleSpeed = 8;
      spawner.difficultyLevel = 3;

      spawner.reset();

      expect(spawner.obstacles).toEqual([]);
      expect(spawner.spawnInterval).toBe(2000);
      expect(spawner.obstacleSpeed).toBe(5);
      expect(spawner.difficultyLevel).toBe(1);
    });
  });

  describe('getObstacles', () => {
    test('should return current obstacles array', () => {
      spawner.spawnObstacle();
      spawner.spawnObstacle();

      const obstacles = spawner.getObstacles();

      expect(obstacles).toBe(spawner.obstacles);
      expect(obstacles.length).toBe(2);
    });
  });
});