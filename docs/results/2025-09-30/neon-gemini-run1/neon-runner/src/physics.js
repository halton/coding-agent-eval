const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
const GRAVITY = 0.5;
const JUMP_IMPULSE = -12;
const COYOTE_TIME = 80; // ms

function createPlayer() {
    return {
        x: 50,
        y: 0,
        vy: 0,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        isGrounded: false,
        lastGroundedTime: 0,
    };
}

function updatePlayer(player, deltaTime) {
    // Apply gravity
    player.vy += GRAVITY;
    player.y += player.vy;

    // Simple ground collision
    if (player.y + player.height > 400) { // Assuming ground is at y=400
        player.y = 400 - player.height;
        player.vy = 0;
        player.isGrounded = true;
        player.lastGroundedTime = Date.now();
    } else {
        player.isGrounded = false;
    }

    return player;
}

function jump(player) {
    const canJump = player.isGrounded || (Date.now() - player.lastGroundedTime) < COYOTE_TIME;
    if (canJump) {
        player.vy = JUMP_IMPULSE;
        player.isGrounded = false; // Ensure we are not grounded after jumping
    }
    return canJump;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createPlayer, updatePlayer, jump, GRAVITY, JUMP_IMPULSE, COYOTE_TIME };
}
