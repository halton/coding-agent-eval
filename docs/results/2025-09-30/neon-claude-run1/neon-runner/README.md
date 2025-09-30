# Neon Runner

An endless runner browser game built with HTML5 Canvas and vanilla JavaScript.

## Features

- **Endless runner gameplay**: Jump over obstacles to survive
- **Physics system**: Gravity, jump impulse, and 80ms coyote time
- **Progressive difficulty**: Difficulty increases every 30 seconds
- **Scoring system**: Distance-based scoring with streak bonuses for perfect jumps
- **High score persistence**: Saves best scores to localStorage
- **Game controls**:
  - **SPACE**: Jump / Start game
  - **P**: Pause/Resume
  - **R**: Restart (after game over)

## Installation

```bash
npm ci
```

## Running the Game

Start the development server:

```bash
npm start
```

Open your browser and navigate to: `http://localhost:8080`

## Testing

Run unit tests:

```bash
npm test
```

Run smoke tests:

```bash
node smoke.js
```

Run all acceptance tests:

```bash
./accept.sh
```

## Project Structure

```
neon-runner/
├── public/         # Frontend files
│   ├── index.html  # Main HTML file
│   ├── game.js     # Game logic
│   ├── render.js   # Canvas rendering
│   └── input.js    # Input handling
├── src/            # Core game modules
│   ├── physics.js  # Physics engine
│   ├── spawner.js  # Obstacle spawning
│   └── score.js    # Score management
├── tests/          # Unit tests
│   ├── physics.test.js
│   ├── spawner.test.js
│   └── score.test.js
├── smoke.js        # Smoke test suite
├── accept.sh       # Acceptance test runner
└── package.json    # Project configuration
```

## Game Mechanics

### Physics
- Gravity constantly pulls the player down
- Jump impulse provides upward velocity
- Coyote time (80ms) allows jumping shortly after leaving a platform

### Difficulty Progression
- Spawn interval decreases every 30 seconds
- Obstacle speed increases with each difficulty level
- Minimum spawn interval: 800ms
- Maximum obstacle speed: 12 units/frame

### Scoring
- Base score: 1 point per 10 units traveled
- Streak bonus: 50 points × streak multiplier for 3+ perfect jumps
- Perfect jump: Clearing an obstacle with 10-50 pixels of clearance

## Architecture

The game follows a clean separation between logic and rendering:
- **Game logic** modules are framework-agnostic and can be unit tested without DOM
- **Rendering** is handled separately through the Canvas API
- **Input handling** translates keyboard events to game actions