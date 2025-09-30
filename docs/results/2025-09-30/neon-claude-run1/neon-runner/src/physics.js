class Physics {
  constructor() {
    this.gravity = 0.6;
    this.jumpImpulse = -12;
    this.coyoteTime = 80;
    this.groundY = 300;
  }

  applyGravity(entity) {
    if (!entity.grounded) {
      entity.velocityY += this.gravity;
      entity.y += entity.velocityY;
    }

    if (entity.y >= this.groundY) {
      entity.y = this.groundY;
      entity.velocityY = 0;
      entity.grounded = true;
      entity.lastGroundedTime = Date.now();
    } else if (entity.y < this.groundY) {
      entity.grounded = false;
    }
  }

  jump(entity) {
    const timeSinceGrounded = Date.now() - entity.lastGroundedTime;
    const canJump = entity.grounded || timeSinceGrounded <= this.coyoteTime;

    if (canJump && !entity.jumping) {
      entity.velocityY = this.jumpImpulse;
      entity.grounded = false;
      entity.jumping = true;
      return true;
    }
    return false;
  }

  checkCollision(player, obstacle) {
    const playerLeft = player.x;
    const playerRight = player.x + player.width;
    const playerTop = player.y - player.height;
    const playerBottom = player.y;

    const obstacleLeft = obstacle.x;
    const obstacleRight = obstacle.x + obstacle.width;
    const obstacleTop = obstacle.y - obstacle.height;
    const obstacleBottom = obstacle.y;

    return !(
      playerRight < obstacleLeft ||
      playerLeft > obstacleRight ||
      playerBottom < obstacleTop ||
      playerTop > obstacleBottom
    );
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Physics;
}