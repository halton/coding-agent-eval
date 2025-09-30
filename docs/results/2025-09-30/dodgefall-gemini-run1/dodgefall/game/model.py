from dataclasses import dataclass, field
from typing import List

@dataclass
class Player:
    x: float
    y: float
    width: float
    height: float
    speed: float

@dataclass
class Obstacle:
    x: float
    y: float
    width: float
    height: float
    speed: float

@dataclass
class Star:
    x: float
    y: float
    width: float
    height: float
    speed: float

@dataclass
class GameState:
    player: Player
    obstacles: List[Obstacle] = field(default_factory=list)
    stars: List[Star] = field(default_factory=list)
    score: int = 0
    lives: int = 3
    game_over: bool = False
    paused: bool = False
    invulnerable: bool = False
    invulnerability_timer: float = 0
    combo_timer: float = 0
    combo_multiplier: int = 1
    obstacle_spawn_timer: float = 0
    star_spawn_timer: float = 0
    obstacle_speed_increase: float = 0.01
    star_speed_increase: float = 0.01
