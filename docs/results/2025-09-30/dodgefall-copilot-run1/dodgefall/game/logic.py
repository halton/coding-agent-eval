"""
Game logic implementation - pure functions without rendering.
"""
import random
from typing import List, Tuple
from .model import GameState, Obstacle, Star, Player


class GameLogic:
    """Pure game logic without rendering dependencies."""
    
    def __init__(self, screen_width: int = 800, screen_height: int = 600):
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.obstacle_spawn_timer = 0.0
        self.star_spawn_timer = 0.0
        
    def create_game_state(self) -> GameState:
        """Create a new game state."""
        return GameState(self.screen_width, self.screen_height)
    
    def update(self, state: GameState, dt: float, player_input: dict) -> None:
        """Update game state based on input and time delta."""
        if state.game_over or state.paused:
            return
            
        state.game_time += dt
        
        # Update player movement
        self._update_player(state.player, dt, player_input)
        
        # Update player invulnerability
        if state.player.invulnerable_time > 0:
            state.player.invulnerable_time -= dt
        
        # Spawn obstacles
        self._spawn_obstacles(state, dt)
        
        # Spawn stars
        self._spawn_stars(state, dt)
        
        # Update obstacles
        self._update_obstacles(state, dt)
        
        # Update stars
        self._update_stars(state, dt)
        
        # Check collisions
        self._check_collisions(state)
        
        # Update combo multiplier
        self._update_combo(state)
        
        # Check game over
        if state.player.lives <= 0:
            state.game_over = True
            if state.score > state.high_score:
                state.high_score = state.score
                state.save_high_score()
    
    def _update_player(self, player: Player, dt: float, player_input: dict) -> None:
        """Update player position based on input."""
        speed = 300.0  # pixels per second
        
        if player_input.get('left', False):
            player.x -= speed * dt
        if player_input.get('right', False):
            player.x += speed * dt
            
        # Keep player within screen bounds
        player.x = max(0, min(player.x, self.screen_width - player.width))
    
    def _spawn_obstacles(self, state: GameState, dt: float) -> None:
        """Spawn falling obstacles."""
        self.obstacle_spawn_timer += dt
        
        # Spawn rate increases over time
        spawn_rate = max(0.5, 2.0 - state.game_time / 30.0)
        
        if self.obstacle_spawn_timer >= spawn_rate:
            self.obstacle_spawn_timer = 0.0
            x = random.uniform(0, self.screen_width - 30)
            # Speed increases over time
            speed = 200.0 + state.game_time * 10.0
            obstacle = Obstacle(x, -30, speed)
            state.obstacles.append(obstacle)
    
    def _spawn_stars(self, state: GameState, dt: float) -> None:
        """Spawn collectible stars."""
        self.star_spawn_timer += dt
        
        if self.star_spawn_timer >= 3.0:  # Spawn every 3 seconds
            self.star_spawn_timer = 0.0
            x = random.uniform(0, self.screen_width - 20)
            star = Star(x, -20, state.game_time)
            state.stars.append(star)
    
    def _update_obstacles(self, state: GameState, dt: float) -> None:
        """Update obstacle positions and remove off-screen ones."""
        for obstacle in state.obstacles[:]:
            obstacle.y += obstacle.speed * dt
            if obstacle.y > self.screen_height:
                state.obstacles.remove(obstacle)
    
    def _update_stars(self, state: GameState, dt: float) -> None:
        """Update star positions and remove off-screen ones."""
        for star in state.stars[:]:
            star.y += 150.0 * dt  # Stars fall slower than obstacles
            if star.y > self.screen_height:
                state.stars.remove(star)
    
    def _check_collisions(self, state: GameState) -> None:
        """Check collisions between player and obstacles/stars."""
        if state.player.is_invulnerable():
            return
            
        # Check obstacle collisions
        for obstacle in state.obstacles[:]:
            if state.player.collides_with(obstacle):
                state.obstacles.remove(obstacle)
                state.player.lives -= 1
                state.player.invulnerable_time = 1.5  # 1.5 second invulnerability
                state.combo_multiplier = 1  # Reset combo on hit
                break
        
        # Check star collisions
        for star in state.stars[:]:
            if state.player.collides_with(star):
                state.stars.remove(star)
                points = 10 * state.combo_multiplier
                state.score += points
                state.last_star_time = state.game_time
                break
    
    def _update_combo(self, state: GameState) -> None:
        """Update combo multiplier based on star collection timing."""
        time_since_last_star = state.game_time - state.last_star_time
        
        if time_since_last_star <= 3.0 and state.last_star_time > 0:
            # Build combo if within 3 seconds
            state.combo_multiplier = min(state.combo_multiplier + 1, 10)
        elif time_since_last_star > 3.0:
            # Reset combo after 3 seconds without collecting a star
            state.combo_multiplier = 1
    
    def toggle_pause(self, state: GameState) -> None:
        """Toggle game pause state."""
        if not state.game_over:
            state.paused = not state.paused
    
    def restart_game(self, state: GameState) -> None:
        """Restart the game."""
        state.reset()
        self.obstacle_spawn_timer = 0.0
        self.star_spawn_timer = 0.0