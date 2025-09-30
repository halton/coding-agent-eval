# Dodgefall

A fast-paced arcade game where you dodge falling obstacles and collect stars for points.

## How to Play

- **Move**: Use A/D or ←/→ arrow keys to move left and right
- **Pause**: Press P to pause/resume the game
- **Restart**: Press R when game is over to restart
- **Quit**: Press Esc to quit

## Game Mechanics

- You have 3 lives
- Dodge falling red obstacles - they gradually speed up over time
- Collect yellow stars for 10 points each
- Build combos by collecting stars within 3 seconds of each other
- Combo multiplier increases your score (x2, x3, etc.)
- After getting hit, you have 1.5 seconds of invulnerability
- Your high score is saved automatically

## Installation

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Running the Game

```bash
python -m game.main
```

## Running Tests

```bash
pytest
```

## Headless Mode

For automated testing, run in headless mode:

```bash
HEADLESS=1 python -m game.main
```

## Acceptance Test

Run the full acceptance test suite:

```bash
./accept.sh
```