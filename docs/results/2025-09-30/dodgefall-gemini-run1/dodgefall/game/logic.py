
import random
from .model import GameState, Player, Obstacle, Star

WIDTH, HEIGHT = 800, 600
PLAYER_WIDTH, PLAYER_HEIGHT = 50, 50
OBSTACLE_WIDTH, OBSTACLE_HEIGHT = 50, 50
STAR_WIDTH, STAR_HEIGHT = 30, 30
PLAYER_SPEED = 5
INITIAL_OBSTACLE_SPEED = 2
INITIAL_STAR_SPEED = 2
INVULNERABILITY_DURATION = 1.5
COMBO_DURATION = 3.0

def init_game_state() -> GameState:
    player = Player(
        x=WIDTH / 2 - PLAYER_WIDTH / 2,
        y=HEIGHT - PLAYER_HEIGHT - 10,
        width=PLAYER_WIDTH,
        height=PLAYER_HEIGHT,
        speed=PLAYER_SPEED,
    )
    return GameState(player=player)

def update_game_state(state: GameState, delta_time: float):
    if state.game_over or state.paused:
        return

    # Update timers
    state.invulnerability_timer -= delta_time
    if state.invulnerability_timer <= 0:
        state.invulnerable = False

    state.combo_timer -= delta_time
    if state.combo_timer <= 0:
        state.combo_multiplier = 1

    state.obstacle_spawn_timer -= delta_time
    if state.obstacle_spawn_timer <= 0:
        spawn_obstacle(state)
        state.obstacle_spawn_timer = random.uniform(0.5, 1.5)

    state.star_spawn_timer -= delta_time
    if state.star_spawn_timer <= 0:
        spawn_star(state)
        state.star_spawn_timer = random.uniform(1.0, 3.0)

    # Move obstacles
    for obstacle in state.obstacles:
        obstacle.y += obstacle.speed
        obstacle.speed += state.obstacle_speed_increase * delta_time
    state.obstacles = [o for o in state.obstacles if o.y < HEIGHT]

    # Move stars
    for star in state.stars:
        star.y += star.speed
        star.speed += state.star_speed_increase * delta_time
    state.stars = [s for s in state.stars if s.y < HEIGHT]

    # Check collisions
    check_collisions(state)

def move_player(state: GameState, direction: int):
    if not state.game_over and not state.paused:
        state.player.x += direction * state.player.speed
        state.player.x = max(0, min(WIDTH - state.player.width, state.player.x))

def spawn_obstacle(state: GameState):
    obstacle = Obstacle(
        x=random.randint(0, WIDTH - OBSTACLE_WIDTH),
        y=-OBSTACLE_HEIGHT,
        width=OBSTACLE_WIDTH,
        height=OBSTACLE_HEIGHT,
        speed=INITIAL_OBSTACLE_SPEED,
    )
    state.obstacles.append(obstacle)

def spawn_star(state: GameState):
    star = Star(
        x=random.randint(0, WIDTH - STAR_WIDTH),
        y=-STAR_HEIGHT,
        width=STAR_WIDTH,
        height=STAR_HEIGHT,
        speed=INITIAL_STAR_SPEED,
    )
    state.stars.append(star)

def check_collisions(state: GameState):
    player_rect = (state.player.x, state.player.y, state.player.width, state.player.height)

    # Obstacle collisions
    if not state.invulnerable:
        for obstacle in state.obstacles:
            obstacle_rect = (obstacle.x, obstacle.y, obstacle.width, obstacle.height)
            if check_rect_collision(player_rect, obstacle_rect):
                state.lives -= 1
                state.invulnerable = True
                state.invulnerability_timer = INVULNERABILITY_DURATION
                state.combo_multiplier = 1
                if state.lives <= 0:
                    state.game_over = True
                break

    # Star collisions
    for star in state.stars:
        star_rect = (star.x, star.y, star.width, star.height)
        if check_rect_collision(player_rect, star_rect):
            state.score += 10 * state.combo_multiplier
            state.combo_timer = COMBO_DURATION
            state.combo_multiplier += 1
            state.stars.remove(star)
            break

def check_rect_collision(rect1, rect2) -> bool:
    x1, y1, w1, h1 = rect1
    x2, y2, w2, h2 = rect2
    return x1 < x2 + w2 and x1 + w1 > x2 and y1 < y2 + h2 and y1 + h1 > y2

def toggle_pause(state: GameState):
    if not state.game_over:
        state.paused = not state.paused

def restart_game(state: GameState) -> GameState:
    return init_game_state()
