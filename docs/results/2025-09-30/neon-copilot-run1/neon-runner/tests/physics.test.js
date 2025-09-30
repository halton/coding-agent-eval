const Physics = require('../src/physics');

describe('Physics', () => {
  let physics;

  beforeEach(() => {
    physics = new Physics({
      gravity: 0.8,
      jumpForce: -15,
      groundY: 300,
      coyoteTimeMs: 80
    });
  });

  describe('Player Creation', () => {
    test('creates player with default position', () => {
      const player = physics.createPlayer();
      expect(player.x).toBe(50);
      expect(player.y).toBe(300);
      expect(player.velocityY).toBe(0);
      expect(player.onGround).toBe(true);
    });

    test('creates player with custom position', () => {
      const player = physics.createPlayer(100, 200);
      expect(player.x).toBe(100);
      expect(player.y).toBe(200);
    });
  });

  describe('Player Physics', () => {
    test('applies gravity when in air', () => {
      const player = physics.createPlayer(50, 200);
      player.onGround = false;
      
      physics.updatePlayer(player, 16);
      
      expect(player.velocityY).toBe(0.8);
      expect(player.y).toBe(200.8);
    });

    test('lands on ground', () => {
      const player = physics.createPlayer(50, 350);
      player.velocityY = 5;
      player.onGround = false;
      
      physics.updatePlayer(player, 16);
      
      expect(player.y).toBe(300);
      expect(player.velocityY).toBe(0);
      expect(player.onGround).toBe(true);
    });

    test('jumping works when on ground', () => {
      const player = physics.createPlayer();
      
      const jumped = physics.jump(player);
      
      expect(jumped).toBe(true);
      expect(player.velocityY).toBe(-15);
      expect(player.onGround).toBe(false);
    });

    test('cannot jump when in air after coyote time', (done) => {
      const player = physics.createPlayer();
      player.onGround = false;
      player.lastGroundTime = Date.now() - 100; // 100ms ago, beyond coyote time
      
      const jumped = physics.jump(player);
      
      expect(jumped).toBe(false);
      expect(player.velocityY).toBe(0);
      done();
    });

    test('can jump within coyote time', () => {
      const player = physics.createPlayer();
      player.onGround = false;
      player.lastGroundTime = Date.now() - 50; // 50ms ago, within coyote time
      
      const jumped = physics.jump(player);
      
      expect(jumped).toBe(true);
      expect(player.velocityY).toBe(-15);
    });
  });

  describe('Obstacle Physics', () => {
    test('creates obstacle with correct properties', () => {
      const obstacle = physics.createObstacle(500, 30, 50);
      
      expect(obstacle.x).toBe(500);
      expect(obstacle.y).toBe(250); // groundY - height
      expect(obstacle.width).toBe(30);
      expect(obstacle.height).toBe(50);
    });

    test('updates obstacle position', () => {
      const obstacle = physics.createObstacle(500);
      
      physics.updateObstacle(obstacle, 16, 5);
      
      expect(obstacle.x).toBe(495);
    });

    test('detects when obstacle is off screen', () => {
      const obstacle = physics.createObstacle(-30);
      obstacle.width = 20;
      
      const offScreen = physics.isObstacleOffScreen(obstacle, 800);
      
      expect(offScreen).toBe(true);
    });
  });

  describe('Collision Detection', () => {
    test('detects collision between overlapping rectangles', () => {
      const rect1 = { x: 50, y: 280, width: 30, height: 30 };
      const rect2 = { x: 70, y: 260, width: 20, height: 40 };
      
      const collision = physics.checkCollision(rect1, rect2);
      
      expect(collision).toBe(true);
    });

    test('detects no collision between separate rectangles', () => {
      const rect1 = { x: 50, y: 280, width: 30, height: 30 };
      const rect2 = { x: 100, y: 260, width: 20, height: 40 };
      
      const collision = physics.checkCollision(rect1, rect2);
      
      expect(collision).toBe(false);
    });

    test('detects edge case collision', () => {
      const rect1 = { x: 50, y: 280, width: 30, height: 30 };
      const rect2 = { x: 80, y: 280, width: 20, height: 30 };
      
      const collision = physics.checkCollision(rect1, rect2);
      
      expect(collision).toBe(false); // Just touching edges, not overlapping
    });
  });
});