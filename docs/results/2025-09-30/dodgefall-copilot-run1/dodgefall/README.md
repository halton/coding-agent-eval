# Dodgefall

A Pygame arcade game where you dodge falling obstacles and collect stars to build up your score and combo multiplier.

## Features

- **Player Movement**: Use A/D keys or arrow keys (←/→) to move left and right
- **Falling Obstacles**: Red squares that fall from the top, getting faster over time
- **Collectible Stars**: Yellow stars that increase your score with combo multipliers
- **Lives System**: Start with 3 lives, lose one on collision with obstacles
- **Invulnerability**: Brief invulnerability period (~1.5s) after taking damage
- **Combo System**: Collect stars within 3 seconds of each other to build multipliers
- **Pause/Resume**: Press P to pause/resume the game
- **High Score**: Persistent high score saved to `highscore.json`

## Controls

- **A/D** or **←/→**: Move player left/right
- **P**: Pause/resume game
- **R**: Restart game (when game over)
- **Esc**: Quit game

## Installation

1. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Game

### Normal Mode
```bash
python -m game.main
```

### Headless Mode (for testing)
```bash
HEADLESS=1 python -m game.main
```

## Testing

Run the unit tests:
```bash
pytest tests/
```

Run acceptance tests:
```bash
./accept.sh
```

## Game Mechanics

### Scoring
- Each star collected gives 10 points × current combo multiplier
- Combo multiplier increases when stars are collected within 3 seconds of each other
- Maximum combo multiplier: 10x
- Combo resets to 1x after 3 seconds without collecting a star or when hit by an obstacle

### Difficulty Progression
- Obstacles spawn more frequently over time (starting at every 2 seconds, decreasing to 0.5 seconds)
- Obstacle speed increases over time (starting at 200 pixels/second + 10/second per second elapsed)
- Stars spawn every 3 seconds regardless of game time

### Lives and Invulnerability
- Start with 3 lives
- Lose 1 life when hit by an obstacle
- 1.5 second invulnerability period after being hit (player flashes gray)
- Game over when all lives are lost

## Project Structure

```
dodgefall/
├── game/
│   ├── __init__.py     # Package initialization
│   ├── main.py         # Main game entry point and game loop
│   ├── model.py        # Game data models and state
│   ├── logic.py        # Pure game logic (headless-compatible)
│   └── render.py       # Pygame rendering system
├── tests/
│   └── test_logic.py   # Unit tests for game logic
├── requirements.txt    # Python dependencies
├── README.md          # This file
└── accept.sh          # Acceptance test script
```

## Architecture

The game is structured with clear separation between logic and rendering:

- **model.py**: Contains all game data structures (Player, Obstacle, Star, GameState)
- **logic.py**: Pure game logic functions that operate on game state without rendering dependencies
- **render.py**: Pygame-based rendering system that visualizes the game state
- **main.py**: Game loop and input handling that coordinates logic and rendering

This separation allows the game logic to be tested in a headless environment without requiring a display or pygame initialization.