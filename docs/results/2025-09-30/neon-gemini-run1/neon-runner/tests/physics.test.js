const { createPlayer, updatePlayer, jump, GRAVITY, JUMP_IMPULSE, COYOTE_TIME } = require('../src/physics');

describe('physics', () => {
    describe('createPlayer', () => {
        it('should create a player with default values', () => {
            const player = createPlayer();
            expect(player).toEqual({
                x: 50,
                y: 0,
                vy: 0,
                width: 50,
                height: 50,
                isGrounded: false,
                lastGroundedTime: 0,
            });
        });
    });

    describe('updatePlayer', () => {
        it('should apply gravity to the player', () => {
            const player = createPlayer();
            updatePlayer(player, 16);
            expect(player.vy).toBe(GRAVITY);
            expect(player.y).toBe(GRAVITY);
        });

        it('should collide with the ground', () => {
            const player = createPlayer();
            player.y = 380;
            player.vy = 20;
            updatePlayer(player, 16);
            expect(player.y).toBe(350);
            expect(player.vy).toBe(0);
            expect(player.isGrounded).toBe(true);
        });
    });

    describe('jump', () => {
        it('should apply a jump impulse when grounded', () => {
            const player = createPlayer();
            player.isGrounded = true;
            jump(player);
            expect(player.vy).toBe(JUMP_IMPULSE);
        });

        it('should not jump when in the air and coyote time has passed', () => {
            const player = createPlayer();
            player.isGrounded = false;
            player.lastGroundedTime = Date.now() - COYOTE_TIME - 10;
            jump(player);
            expect(player.vy).not.toBe(JUMP_IMPULSE);
        });

        it('should jump within coyote time', (done) => {
            const player = createPlayer();
            player.isGrounded = false;
            player.lastGroundedTime = Date.now() - COYOTE_TIME + 20;
            const canJump = jump(player);
            expect(canJump).toBe(true);
            expect(player.vy).toBe(JUMP_IMPULSE);
            done();
        });
    });
});
