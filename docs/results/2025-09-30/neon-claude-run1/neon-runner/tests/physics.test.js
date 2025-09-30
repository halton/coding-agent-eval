const Physics = require('../src/physics');

describe('Physics', () => {
  let physics;
  let entity;

  beforeEach(() => {
    physics = new Physics();
    entity = {
      x: 100,
      y: 300,
      width: 30,
      height: 40,
      velocityY: 0,
      grounded: true,
      jumping: false,
      lastGroundedTime: Date.now()
    };
  });

  describe('applyGravity', () => {
    test('should apply gravity to airborne entity', () => {
      entity.y = 200;
      entity.grounded = false;
      entity.velocityY = 0;

      physics.applyGravity(entity);

      expect(entity.velocityY).toBe(0.6);
      expect(entity.y).toBe(200.6);
      expect(entity.grounded).toBe(false);
    });

    test('should ground entity when reaching ground level', () => {
      entity.y = 299;
      entity.grounded = false;
      entity.velocityY = 5;

      physics.applyGravity(entity);

      expect(entity.y).toBe(300);
      expect(entity.velocityY).toBe(0);
      expect(entity.grounded).toBe(true);
    });

    test('should not apply gravity to grounded entity', () => {
      entity.y = 300;
      entity.grounded = true;
      entity.velocityY = 0;

      physics.applyGravity(entity);

      expect(entity.velocityY).toBe(0);
      expect(entity.y).toBe(300);
      expect(entity.grounded).toBe(true);
    });
  });

  describe('jump', () => {
    test('should allow jump when grounded', () => {
      entity.grounded = true;
      entity.jumping = false;

      const result = physics.jump(entity);

      expect(result).toBe(true);
      expect(entity.velocityY).toBe(-12);
      expect(entity.grounded).toBe(false);
      expect(entity.jumping).toBe(true);
    });

    test('should prevent double jump', () => {
      entity.grounded = false;
      entity.jumping = true;
      entity.lastGroundedTime = Date.now() - 200;

      const result = physics.jump(entity);

      expect(result).toBe(false);
      expect(entity.velocityY).toBe(0);
    });

    test('should allow coyote time jump', () => {
      entity.grounded = false;
      entity.jumping = false;
      entity.lastGroundedTime = Date.now() - 50;

      const result = physics.jump(entity);

      expect(result).toBe(true);
      expect(entity.velocityY).toBe(-12);
      expect(entity.jumping).toBe(true);
    });

    test('should not allow jump after coyote time expires', () => {
      entity.grounded = false;
      entity.jumping = false;
      entity.lastGroundedTime = Date.now() - 100;

      const result = physics.jump(entity);

      expect(result).toBe(false);
      expect(entity.velocityY).toBe(0);
    });

    test('coyote time should be exactly 80ms', () => {
      entity.grounded = false;
      entity.jumping = false;

      entity.lastGroundedTime = Date.now() - 79;
      expect(physics.jump(entity)).toBe(true);

      entity.jumping = false;
      entity.lastGroundedTime = Date.now() - 81;
      expect(physics.jump(entity)).toBe(false);
    });
  });

  describe('checkCollision', () => {
    let obstacle;

    beforeEach(() => {
      obstacle = {
        x: 200,
        y: 300,
        width: 30,
        height: 40
      };
    });

    test('should detect collision when entities overlap', () => {
      entity.x = 190;
      entity.y = 300;

      const result = physics.checkCollision(entity, obstacle);
      expect(result).toBe(true);
    });

    test('should not detect collision when entities are separated', () => {
      entity.x = 50;
      entity.y = 300;

      const result = physics.checkCollision(entity, obstacle);
      expect(result).toBe(false);
    });

    test('should detect edge collision', () => {
      entity.x = 170;
      entity.y = 300;

      const result = physics.checkCollision(entity, obstacle);
      expect(result).toBe(true);
    });

    test('should not detect collision when player jumps over obstacle', () => {
      entity.x = 190;
      entity.y = 250;

      const result = physics.checkCollision(entity, obstacle);
      expect(result).toBe(false);
    });

    test('should handle different obstacle heights', () => {
      obstacle.height = 60;
      entity.x = 190;
      entity.y = 260;

      const result = physics.checkCollision(entity, obstacle);
      expect(result).toBe(true);
    });
  });
});