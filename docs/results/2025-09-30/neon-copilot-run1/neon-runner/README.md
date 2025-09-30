# Neon Runner

A neon-themed endless runner game built with HTML5 Canvas and vanilla JavaScript.

## Gameplay

- **Endless Runner**: Jump over obstacles to survive as long as possible
- **Physics**: Realistic gravity, jump impulse, and coyote time (~80ms)
- **Progressive Difficulty**: Game gets harder every 30 seconds
- **Scoring**: Distance-based scoring with streak bonuses for 3 perfect jumps in a row
- **Persistence**: High scores saved in localStorage
- **Controls**: 
  - **SPACE** or **UP ARROW**: Jump
  - **P**: Pause/Resume
  - **R**: Restart (after game over)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run tests:
   ```bash
   npm test
   ```

3. Start the game:
   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:8080`

## Architecture

The game is structured with separation of concerns:

- **Logic** (`src/`): Pure game logic that can be unit tested
- **Presentation** (`public/`): DOM-dependent rendering and input handling
- **Tests** (`tests/`): Unit tests for core game mechanics

## Testing

Run the acceptance test:
```bash
./accept.sh
```

This will install dependencies, run unit tests, perform smoke tests, and verify the game is working correctly.