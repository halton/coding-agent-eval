const { createSpawner, updateSpawner } = require('../src/spawner');

describe('spawner', () => {
    beforeAll(() => {
        jest.spyOn(Date, 'now').mockImplementation(() => 100000);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('createSpawner', () => {
        it('should create a spawner with default values', () => {
            const spawner = createSpawner(800);
            expect(spawner).toEqual({
                obstacles: [],
                nextSpawnTime: 0,
                speed: 3,
                canvasWidth: 800,
            });
        });
    });

    describe('updateSpawner', () => {
        it('should not spawn an obstacle before the time is up', () => {
            const spawner = createSpawner(800);
            spawner.nextSpawnTime = Date.now() + 1000;
            updateSpawner(spawner, 16, 0);
            expect(spawner.obstacles.length).toBe(0);
        });

        it('should spawn an obstacle when the time is up', () => {
            const spawner = createSpawner(800);
            spawner.nextSpawnTime = Date.now() - 1;
            updateSpawner(spawner, 16, 0);
            expect(spawner.obstacles.length).toBe(1);
            expect(spawner.obstacles[0].x).toBe(800);
        });

        it('should update obstacle positions', () => {
            const spawner = createSpawner(800);
            spawner.obstacles.push({ x: 100, width: 50 });
            updateSpawner(spawner, 16, 0);
            expect(spawner.obstacles[0].x).toBe(100 - spawner.speed);
        });

        it('should remove off-screen obstacles', () => {
            const spawner = createSpawner(800);
            spawner.obstacles.push({ x: -51, width: 50 });
            spawner.nextSpawnTime = Date.now() + 1000; // Prevent new spawns
            updateSpawner(spawner, 16, 0);
            expect(spawner.obstacles.length).toBe(0);
        });

        it('should increase speed after 30 seconds', () => {
            const spawner = createSpawner(800);
            updateSpawner(spawner, 16, 30000);
            expect(spawner.speed).toBe(3 * 1.1);
        });

        it('should increase speed again after 60 seconds', () => {
            const spawner = createSpawner(800);
            updateSpawner(spawner, 16, 60000);
            expect(spawner.speed).toBe(3 * 1.2);
        });
    });
});
