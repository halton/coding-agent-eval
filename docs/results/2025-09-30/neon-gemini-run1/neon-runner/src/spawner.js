const OBSTACLE_WIDTH = 30;
const OBSTACLE_HEIGHT = 60;
const MIN_GAP = 200;
const MAX_GAP = 500;
const BASE_SPEED = 3;

function createObstacle(canvasWidth) {
    return {
        x: canvasWidth,
        width: OBSTACLE_WIDTH,
        height: OBSTACLE_HEIGHT,
        y: 400 - OBSTACLE_HEIGHT, // Assuming ground is at y=400
    };
}

function createSpawner(canvasWidth) {
    return {
        obstacles: [],
        nextSpawnTime: 0,
        speed: BASE_SPEED,
        canvasWidth: canvasWidth,
    };
}

function updateSpawner(spawner, deltaTime, gameTime) {
    // Ramp up difficulty every 30 seconds
    const difficultyFactor = 1 + Math.floor(gameTime / 30000) * 0.1;
    spawner.speed = BASE_SPEED * difficultyFactor;

    // Update and remove old obstacles
    spawner.obstacles.forEach(obstacle => {
        obstacle.x -= spawner.speed;
    });

    spawner.obstacles = spawner.obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

    // Spawn new obstacles
    if (Date.now() > spawner.nextSpawnTime) {
        spawner.obstacles.push(createObstacle(spawner.canvasWidth));
        const gap = MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP);
        spawner.nextSpawnTime = Date.now() + gap / spawner.speed * 16; // Estimate time to next spawn
    }

    return spawner;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createSpawner, updateSpawner };
}
