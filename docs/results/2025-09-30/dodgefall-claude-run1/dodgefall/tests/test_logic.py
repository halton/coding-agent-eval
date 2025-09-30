"""Unit tests for game logic."""

import pytest
from game.model import GameState, Player, Obstacle, Star
from game.logic import (
    update_game, move_player, check_collisions, rectangles_overlap,
    toggle_pause, restart_game, update_high_score
)


def test_player_movement():
    """Test player movement logic."""
    player = Player(x=400, y=540)
    state = GameState(player=player)

    # Test left movement (A key)
    keys = {97}  # 'a' key code
    move_player(state, 0.1, keys, 276, 275, 97, 100)
    assert state.player.x < 400

    # Test right movement (D key)
    state.player.x = 400
    keys = {100}  # 'd' key code
    move_player(state, 0.1, keys, 276, 275, 97, 100)
    assert state.player.x > 400

    # Test boundary constraints
    state.player.x = -10
    move_player(state, 0.1, set(), 276, 275, 97, 100)
    assert state.player.x == 0

    state.player.x = 900
    move_player(state, 0.1, set(), 276, 275, 97, 100)
    assert state.player.x == 800 - state.player.width


def test_collision_detection():
    """Test collision detection."""
    # Test overlapping rectangles
    assert rectangles_overlap(0, 0, 10, 10, 5, 5, 10, 10) == True
    assert rectangles_overlap(0, 0, 10, 10, 20, 20, 10, 10) == False
    assert rectangles_overlap(0, 0, 10, 10, 10, 0, 10, 10) == False
    assert rectangles_overlap(0, 0, 10, 10, 9, 0, 10, 10) == True


def test_obstacle_collision():
    """Test obstacle collision with player."""
    player = Player(x=100, y=100)
    state = GameState(player=player, lives=3)

    # Add overlapping obstacle
    obstacle = Obstacle(x=100, y=100)
    state.obstacles.append(obstacle)

    check_collisions(state)

    # Should lose a life and gain invulnerability
    assert state.lives == 2
    assert state.player.invulnerable_time > 0
    assert obstacle not in state.obstacles


def test_star_collection():
    """Test star collection and combo system."""
    player = Player(x=100, y=100)
    state = GameState(player=player, score=0, combo=0)

    # Collect first star
    star1 = Star(x=100, y=100)
    state.stars.append(star1)
    check_collisions(state)

    assert state.score == 10
    assert state.combo == 1
    assert state.combo_timer > 0
    assert star1 not in state.stars

    # Collect second star (within combo time)
    star2 = Star(x=100, y=100)
    state.stars.append(star2)
    state.combo_timer = 2.0  # Still active
    check_collisions(state)

    assert state.score == 30  # 10 + (10 * 2)
    assert state.combo == 2


def test_game_over():
    """Test game over condition."""
    player = Player(x=100, y=100)
    state = GameState(player=player, lives=1)

    # Add obstacle that will hit player
    obstacle = Obstacle(x=100, y=100)
    state.obstacles.append(obstacle)

    check_collisions(state)

    assert state.lives == 0
    assert state.game_over == True


def test_pause_toggle():
    """Test pause functionality."""
    player = Player(x=100, y=100)
    state = GameState(player=player, paused=False)

    toggle_pause(state)
    assert state.paused == True

    toggle_pause(state)
    assert state.paused == False

    # Can't pause when game over
    state.game_over = True
    state.paused = False
    toggle_pause(state)
    assert state.paused == False


def test_restart_game():
    """Test game restart."""
    player = Player(x=100, y=100)
    state = GameState(player=player, score=100, lives=0, game_over=True)

    # Add some entities
    state.obstacles.append(Obstacle(x=50, y=50))
    state.stars.append(Star(x=60, y=60))

    restart_game(state)

    assert state.score == 0
    assert state.lives == 3
    assert state.game_over == False
    assert len(state.obstacles) == 0
    assert len(state.stars) == 0


def test_invulnerability():
    """Test invulnerability after hit."""
    player = Player(x=100, y=100, invulnerable_time=1.0)
    state = GameState(player=player, lives=3)

    # Add obstacle - shouldn't hit invulnerable player
    obstacle = Obstacle(x=100, y=100)
    state.obstacles.append(obstacle)

    check_collisions(state)

    assert state.lives == 3  # No damage taken
    assert obstacle in state.obstacles  # Obstacle not removed


def test_game_update_when_paused():
    """Test that game doesn't update when paused."""
    player = Player(x=100, y=100)
    state = GameState(player=player, paused=True, game_time=0)

    initial_time = state.game_time
    update_game(state, 1.0, set(), 276, 275, 97, 100)

    assert state.game_time == initial_time  # Time shouldn't advance


def test_difficulty_scaling():
    """Test that difficulty increases over time."""
    player = Player(x=100, y=100)
    state = GameState(player=player, obstacle_speed_multiplier=1.0)

    # Simulate game progression
    state.game_time = 30.0
    update_game(state, 0.1, set(), 276, 275, 97, 100)

    assert state.obstacle_speed_multiplier > 1.0