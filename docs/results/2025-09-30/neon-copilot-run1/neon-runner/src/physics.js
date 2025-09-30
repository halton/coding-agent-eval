class Physics {
  constructor(options = {}) {
    this.gravity = options.gravity || 0.8;
    this.jumpForce = options.jumpForce || -15;
    this.groundY = options.groundY || 300;
    this.coyoteTimeMs = options.coyoteTimeMs || 80;
  }

  createPlayer(x = 50, y = null) {
    return {
      x,
      y: y !== null ? y : this.groundY,
      velocityY: 0,
      width: 30,
      height: 30,
      onGround: true,
      lastGroundTime: Date.now()
    };
  }

  createObstacle(x, width = 20, height = 40) {
    return {
      x,
      y: this.groundY - height,
      width,
      height,
      velocityX: -5
    };
  }

  updatePlayer(player, deltaTime) {
    const wasOnGround = player.onGround;
    
    // Apply gravity
    if (!player.onGround || player.velocityY < 0) {
      player.velocityY += this.gravity;
    }

    // Update position
    player.y += player.velocityY;

    // Ground collision
    if (player.y >= this.groundY) {
      player.y = this.groundY;
      player.velocityY = 0;
      player.onGround = true;
      player.lastGroundTime = Date.now();
    } else {
      player.onGround = false;
    }

    // Update coyote time
    if (wasOnGround && !player.onGround) {
      player.lastGroundTime = Date.now();
    }

    return player;
  }

  updateObstacle(obstacle, deltaTime, speed = 5) {
    obstacle.x -= speed;
    return obstacle;
  }

  canJump(player) {
    const timeSinceGround = Date.now() - player.lastGroundTime;
    return player.onGround || timeSinceGround <= this.coyoteTimeMs;
  }

  jump(player) {
    if (this.canJump(player)) {
      player.velocityY = this.jumpForce;
      player.onGround = false;
      return true;
    }
    return false;
  }

  checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  isObstacleOffScreen(obstacle, screenWidth) {
    return obstacle.x + obstacle.width < 0;
  }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Physics;
} else if (typeof window !== 'undefined') {
  window.Physics = Physics;
}