import pytest
from game.logic import (
    init_game_state,
    update_game_state,
    move_player,
    spawn_obstacle,
    spawn_star,
    check_collisions,
    toggle_pause,
    restart_game,
)
from game.model import GameState, Player, Obstacle, Star


def test_init_game_state():
    state = init_game_state()
    assert isinstance(state, GameState)
    assert state.score == 0
    assert state.lives == 3
    assert not state.game_over


def test_move_player():
    state = init_game_state()
    initial_x = state.player.x
    move_player(state, 1)
    assert state.player.x > initial_x
    move_player(state, -1)
    assert state.player.x == initial_x


def test_player_boundaries():
    state = init_game_state()
    state.player.x = 0
    move_player(state, -1)
    assert state.player.x == 0
    state.player.x = 800 - 50  # WIDTH - PLAYER_WIDTH
    move_player(state, 1)
    assert state.player.x == 800 - 50


def test_obstacle_collision():
    state = init_game_state()
    state.obstacles.append(Obstacle(state.player.x, state.player.y, 50, 50, 2))
    check_collisions(state)
    assert state.lives == 2
    assert state.invulnerable
    assert state.invulnerability_timer > 0


def test_star_collection():
    state = init_game_state()
    state.stars.append(Star(state.player.x, state.player.y, 30, 30, 2))
    check_collisions(state)
    assert state.score > 0
    assert len(state.stars) == 0
    assert state.combo_multiplier == 2


def test_game_over():
    state = init_game_state()
    state.lives = 1
    state.obstacles.append(Obstacle(state.player.x, state.player.y, 50, 50, 2))
    check_collisions(state)
    assert state.game_over


def test_pause_game():
    state = init_game_state()
    toggle_pause(state)
    assert state.paused
    toggle_pause(state)
    assert not state.paused


def test_restart_game():
    state = init_game_state()
    state.score = 100
    state.game_over = True
    state = restart_game(state)
    assert state.score == 0
    assert not state.game_over
