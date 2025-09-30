const Spawner = require('../src/spawner');
const Physics = require('../src/physics');

describe('Spawner', () => {
  let spawner;
  let physics;

  beforeEach(() => {
    physics = new Physics();
    spawner = new Spawner(physics, {
      baseSpawnInterval: 2000,
      minSpawnInterval: 800,
      difficultyRampInterval: 30000
    });
    spawner.reset(); // Ensure clean state
  });

  describe('Difficulty Scaling', () => {
    test('returns 0 difficulty at start', () => {
      const difficulty = spawner.getCurrentDifficulty();
      expect(difficulty).toBe(0);
    });

    test('increases difficulty after ramp interval', () => {
      const futureTime = Date.now() + 31000; // 31 seconds later
      const difficulty = spawner.getCurrentDifficulty(futureTime);
      expect(difficulty).toBe(1);
    });

    test('calculates multiple difficulty levels', () => {
      const futureTime = Date.now() + 65000; // 65 seconds later
      const difficulty = spawner.getCurrentDifficulty(futureTime);
      expect(difficulty).toBe(2);
    });

    test('reduces spawn interval with difficulty', () => {
      const baseInterval = spawner.getSpawnInterval();
      expect(baseInterval).toBe(2000);

      const futureTime = Date.now() + 31000;
      const harderInterval = spawner.getSpawnInterval(futureTime);
      expect(harderInterval).toBe(1800); // Reduced by 200ms
    });

    test('respects minimum spawn interval', () => {
      const veryFutureTime = Date.now() + 300000; // 5 minutes later
      const interval = spawner.getSpawnInterval(veryFutureTime);
      expect(interval).toBe(800); // Should not go below minimum
    });

    test('increases obstacle speed with difficulty', () => {
      const baseSpeed = spawner.getObstacleSpeed();
      expect(baseSpeed).toBe(5);

      const futureTime = Date.now() + 31000;
      const fasterSpeed = spawner.getObstacleSpeed(futureTime);
      expect(fasterSpeed).toBe(5.5); // Increased by 0.5
    });
  });

  describe('Obstacle Spawning', () => {
    test('does not spawn immediately', () => {
      const obstacle = spawner.spawnObstacle(800, Date.now());
      expect(obstacle).toBeNull();
    });

    test('spawns after interval', () => {
      const futureTime = Date.now() + 2100; // After spawn interval
      const obstacle = spawner.spawnObstacle(800, futureTime);
      expect(obstacle).not.toBeNull();
      expect(obstacle.x).toBe(800);
    });

    test('tracks spawned obstacles', () => {
      expect(spawner.getObstacles()).toHaveLength(0);
      
      const futureTime = Date.now() + 2100;
      spawner.spawnObstacle(800, futureTime);
      
      expect(spawner.getObstacles()).toHaveLength(1);
    });

    test('updates obstacle positions', () => {
      const futureTime = Date.now() + 2100;
      spawner.spawnObstacle(800, futureTime);
      
      const initialX = spawner.getObstacles()[0].x;
      spawner.updateObstacles(16, futureTime);
      
      expect(spawner.getObstacles()[0].x).toBeLessThan(initialX);
    });

    test('removes off-screen obstacles', () => {
      spawner.obstacles = [physics.createObstacle(-50)]; // Off-screen obstacle
      
      spawner.updateObstacles(16);
      
      expect(spawner.getObstacles()).toHaveLength(0);
    });
  });

  describe('Collision Detection', () => {
    test('detects collision with obstacles', () => {
      const player = physics.createPlayer(50, 270);
      spawner.obstacles = [physics.createObstacle(40)]; // Overlapping position
      
      const collision = spawner.checkCollisions(player);
      
      expect(collision).not.toBeNull();
    });

    test('returns null when no collision', () => {
      const player = physics.createPlayer(50, 300);
      spawner.obstacles = [physics.createObstacle(200)]; // Far away
      
      const collision = spawner.checkCollisions(player);
      
      expect(collision).toBeNull();
    });
  });

  describe('Game Reset', () => {
    test('clears obstacles and resets timers', () => {
      spawner.obstacles = [physics.createObstacle(500)];
      spawner.lastSpawnTime = 1000; // Set to a known old value
      
      spawner.reset();
      
      expect(spawner.getObstacles()).toHaveLength(0);
      // lastSpawnTime should be updated to current time (much greater than 1000)
      expect(spawner.lastSpawnTime).not.toBe(1000);
    });
  });
});