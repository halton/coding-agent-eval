"""Game model classes for Dodgefall."""

from dataclasses import dataclass, field
from typing import List
import random


@dataclass
class Player:
    """Player entity."""
    x: float
    y: float
    width: int = 40
    height: int = 40
    speed: float = 400
    invulnerable_time: float = 0


@dataclass
class Obstacle:
    """Falling obstacle."""
    x: float
    y: float
    width: int = 30
    height: int = 30
    speed: float = 200


@dataclass
class Star:
    """Collectible star."""
    x: float
    y: float
    width: int = 25
    height: int = 25
    speed: float = 150


@dataclass
class GameState:
    """Complete game state."""
    player: Player
    obstacles: List[Obstacle] = field(default_factory=list)
    stars: List[Star] = field(default_factory=list)
    score: int = 0
    lives: int = 3
    combo: int = 0
    combo_timer: float = 0
    game_over: bool = False
    paused: bool = False
    obstacle_speed_multiplier: float = 1.0
    spawn_timer: float = 0
    star_spawn_timer: float = 0
    game_time: float = 0
    high_score: int = 0
    screen_width: int = 800
    screen_height: int = 600

    def reset(self):
        """Reset game to initial state."""
        self.player = Player(x=self.screen_width / 2, y=self.screen_height - 60)
        self.obstacles.clear()
        self.stars.clear()
        self.score = 0
        self.lives = 3
        self.combo = 0
        self.combo_timer = 0
        self.game_over = False
        self.paused = False
        self.obstacle_speed_multiplier = 1.0
        self.spawn_timer = 0
        self.star_spawn_timer = 0
        self.game_time = 0