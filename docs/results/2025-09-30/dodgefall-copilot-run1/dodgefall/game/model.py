"""
Game data models and state.
"""
import json
import os
from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class GameObject:
    """Base class for game objects with position and size."""
    x: float
    y: float
    width: float
    height: float

    def get_rect(self) -> Tuple[float, float, float, float]:
        """Return (x, y, width, height) tuple."""
        return (self.x, self.y, self.width, self.height)

    def collides_with(self, other: 'GameObject') -> bool:
        """Check collision with another game object."""
        return (self.x < other.x + other.width and
                self.x + self.width > other.x and
                self.y < other.y + other.height and
                self.y + self.height > other.y)


@dataclass
class Player(GameObject):
    """Player character."""
    lives: int = 3
    invulnerable_time: float = 0.0

    def __init__(self, x: float, y: float):
        super().__init__(x, y, 40, 40)
        self.lives = 3
        self.invulnerable_time = 0.0

    def is_invulnerable(self) -> bool:
        return self.invulnerable_time > 0.0


@dataclass
class Obstacle(GameObject):
    """Falling obstacle."""
    speed: float = 200.0

    def __init__(self, x: float, y: float, speed: float = 200.0):
        super().__init__(x, y, 30, 30)
        self.speed = speed


@dataclass
class Star(GameObject):
    """Collectible star."""
    spawn_time: float = 0.0

    def __init__(self, x: float, y: float, spawn_time: float):
        super().__init__(x, y, 20, 20)
        self.spawn_time = spawn_time


@dataclass
class GameState:
    """Complete game state."""
    player: Player
    obstacles: List[Obstacle]
    stars: List[Star]
    score: int = 0
    high_score: int = 0
    combo_multiplier: int = 1
    last_star_time: float = 0.0
    game_time: float = 0.0
    paused: bool = False
    game_over: bool = False
    
    def __init__(self, screen_width: int, screen_height: int):
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.player = Player(screen_width // 2 - 20, screen_height - 60)
        self.obstacles = []
        self.stars = []
        self.score = 0
        self.high_score = self.load_high_score()
        self.combo_multiplier = 1
        self.last_star_time = 0.0
        self.game_time = 0.0
        self.paused = False
        self.game_over = False

    def load_high_score(self) -> int:
        """Load high score from file."""
        try:
            if os.path.exists('highscore.json'):
                with open('highscore.json', 'r') as f:
                    data = json.load(f)
                    return data.get('high_score', 0)
        except (json.JSONDecodeError, FileNotFoundError):
            pass
        return 0

    def save_high_score(self) -> None:
        """Save high score to file."""
        try:
            with open('highscore.json', 'w') as f:
                json.dump({'high_score': self.high_score}, f)
        except Exception:
            pass  # Ignore save errors

    def reset(self) -> None:
        """Reset game state for a new game."""
        self.player = Player(self.screen_width // 2 - 20, self.screen_height - 60)
        self.obstacles = []
        self.stars = []
        self.score = 0
        self.combo_multiplier = 1
        self.last_star_time = 0.0
        self.game_time = 0.0
        self.paused = False
        self.game_over = False