"""Pure game logic for Dodgefall, testable without Pygame."""

import random
import json
import os
from typing import Set
from .model import GameState, Player, Obstacle, Star


def update_game(state: GameState, dt: float, keys_pressed: Set[int],
                key_left: int, key_right: int, key_a: int, key_d: int) -> None:
    """Update game state based on time delta and input."""
    if state.paused or state.game_over:
        return

    state.game_time += dt

    # Update player
    move_player(state, dt, keys_pressed, key_left, key_right, key_a, key_d)

    # Update invulnerability
    if state.player.invulnerable_time > 0:
        state.player.invulnerable_time -= dt

    # Update combo timer
    if state.combo_timer > 0:
        state.combo_timer -= dt
        if state.combo_timer <= 0:
            state.combo = 0

    # Spawn obstacles and stars
    spawn_entities(state, dt)

    # Update entities
    update_obstacles(state, dt)
    update_stars(state, dt)

    # Check collisions
    check_collisions(state)

    # Gradually increase difficulty
    state.obstacle_speed_multiplier = 1.0 + (state.game_time / 30.0)


def move_player(state: GameState, dt: float, keys_pressed: Set[int],
                key_left: int, key_right: int, key_a: int, key_d: int) -> None:
    """Move player based on input."""
    if key_left in keys_pressed or key_a in keys_pressed:
        state.player.x -= state.player.speed * dt
    if key_right in keys_pressed or key_d in keys_pressed:
        state.player.x += state.player.speed * dt

    # Keep player on screen
    state.player.x = max(0, min(state.screen_width - state.player.width, state.player.x))


def spawn_entities(state: GameState, dt: float) -> None:
    """Spawn obstacles and stars."""
    # Spawn obstacles
    state.spawn_timer -= dt
    if state.spawn_timer <= 0:
        spawn_interval = max(0.5, 2.0 - state.game_time / 60.0)
        state.spawn_timer = spawn_interval

        x = random.randint(0, state.screen_width - 30)
        obstacle = Obstacle(x=x, y=-30, speed=200 * state.obstacle_speed_multiplier)
        state.obstacles.append(obstacle)

    # Spawn stars
    state.star_spawn_timer -= dt
    if state.star_spawn_timer <= 0:
        state.star_spawn_timer = random.uniform(2.0, 4.0)

        x = random.randint(0, state.screen_width - 25)
        star = Star(x=x, y=-25)
        state.stars.append(star)


def update_obstacles(state: GameState, dt: float) -> None:
    """Update obstacle positions."""
    for obstacle in state.obstacles[:]:
        obstacle.y += obstacle.speed * dt
        if obstacle.y > state.screen_height:
            state.obstacles.remove(obstacle)


def update_stars(state: GameState, dt: float) -> None:
    """Update star positions."""
    for star in state.stars[:]:
        star.y += star.speed * dt
        if star.y > state.screen_height:
            state.stars.remove(star)


def check_collisions(state: GameState) -> None:
    """Check for collisions between player and entities."""
    player = state.player

    # Check obstacle collisions
    if player.invulnerable_time <= 0:
        for obstacle in state.obstacles[:]:
            if rectangles_overlap(
                player.x, player.y, player.width, player.height,
                obstacle.x, obstacle.y, obstacle.width, obstacle.height
            ):
                state.lives -= 1
                player.invulnerable_time = 1.5
                state.obstacles.remove(obstacle)

                if state.lives <= 0:
                    state.game_over = True
                    update_high_score(state)
                break

    # Check star collisions
    for star in state.stars[:]:
        if rectangles_overlap(
            player.x, player.y, player.width, player.height,
            star.x, star.y, star.width, star.height
        ):
            # Update combo
            if state.combo_timer > 0:
                state.combo += 1
            else:
                state.combo = 1
            state.combo_timer = 3.0

            # Add score with combo multiplier
            points = 10 * max(1, state.combo)
            state.score += points
            state.stars.remove(star)


def rectangles_overlap(x1: float, y1: float, w1: float, h1: float,
                       x2: float, y2: float, w2: float, h2: float) -> bool:
    """Check if two rectangles overlap."""
    return (x1 < x2 + w2 and x1 + w1 > x2 and
            y1 < y2 + h2 and y1 + h1 > y2)


def toggle_pause(state: GameState) -> None:
    """Toggle pause state."""
    if not state.game_over:
        state.paused = not state.paused


def restart_game(state: GameState) -> None:
    """Restart the game."""
    if state.game_over:
        state.reset()


def load_high_score() -> int:
    """Load high score from file."""
    try:
        if os.path.exists('highscore.json'):
            with open('highscore.json', 'r') as f:
                data = json.load(f)
                return data.get('high_score', 0)
    except:
        pass
    return 0


def save_high_score(score: int) -> None:
    """Save high score to file."""
    try:
        with open('highscore.json', 'w') as f:
            json.dump({'high_score': score}, f)
    except:
        pass


def update_high_score(state: GameState) -> None:
    """Update and save high score if beaten."""
    if state.score > state.high_score:
        state.high_score = state.score
        save_high_score(state.high_score)