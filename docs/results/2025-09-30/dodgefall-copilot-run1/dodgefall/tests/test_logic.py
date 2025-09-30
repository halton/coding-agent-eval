"""
Unit tests for game logic.
"""
import pytest
from game.logic import GameLogic
from game.model import GameState, Player, Obstacle, Star


class TestGameLogic:
    """Test suite for GameLogic class."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.logic = GameLogic(800, 600)
        self.state = self.logic.create_game_state()
    
    def test_create_game_state(self):
        """Test game state creation."""
        state = self.logic.create_game_state()
        assert isinstance(state, GameState)
        assert state.player.lives == 3
        assert state.score == 0
        assert len(state.obstacles) == 0
        assert len(state.stars) == 0
        assert not state.game_over
        assert not state.paused
    
    def test_player_movement(self):
        """Test player movement logic."""
        initial_x = self.state.player.x
        
        # Move left
        player_input = {'left': True, 'right': False}
        self.logic.update(self.state, 0.1, player_input)
        assert self.state.player.x < initial_x
        
        # Move right
        player_input = {'left': False, 'right': True}
        self.logic.update(self.state, 0.1, player_input)
        # Should move right from current position
        
        # Test boundary constraints
        self.state.player.x = -10  # Move outside left boundary
        self.logic._update_player(self.state.player, 0.1, {'left': False, 'right': False})
        assert self.state.player.x >= 0
        
        self.state.player.x = 900  # Move outside right boundary
        self.logic._update_player(self.state.player, 0.1, {'left': False, 'right': False})
        assert self.state.player.x <= 800 - self.state.player.width
    
    def test_obstacle_spawning(self):
        """Test obstacle spawning mechanism."""
        initial_count = len(self.state.obstacles)
        
        # Force obstacle spawn by setting timer
        self.logic.obstacle_spawn_timer = 2.0
        self.logic._spawn_obstacles(self.state, 0.1)
        
        # Should have spawned an obstacle
        assert len(self.state.obstacles) > initial_count
        
        # Timer should reset
        assert self.logic.obstacle_spawn_timer < 2.0
    
    def test_star_spawning(self):
        """Test star spawning mechanism."""
        initial_count = len(self.state.stars)
        
        # Force star spawn by setting timer
        self.logic.star_spawn_timer = 3.0
        self.logic._spawn_stars(self.state, 0.1)
        
        # Should have spawned a star
        assert len(self.state.stars) > initial_count
        
        # Timer should reset
        assert self.logic.star_spawn_timer < 3.0
    
    def test_obstacle_movement(self):
        """Test obstacle movement and cleanup."""
        # Add obstacle at top of screen
        obstacle = Obstacle(100, -30, 200)
        self.state.obstacles.append(obstacle)
        
        initial_y = obstacle.y
        self.logic._update_obstacles(self.state, 0.1)
        
        # Obstacle should have moved down
        assert obstacle.y > initial_y
        
        # Move obstacle below screen and test cleanup
        obstacle.y = 700  # Below screen height
        self.logic._update_obstacles(self.state, 0.1)
        
        # Obstacle should be removed
        assert obstacle not in self.state.obstacles
    
    def test_star_movement(self):
        """Test star movement and cleanup."""
        # Add star at top of screen
        star = Star(100, -20, 0.0)
        self.state.stars.append(star)
        
        initial_y = star.y
        self.logic._update_stars(self.state, 0.1)
        
        # Star should have moved down
        assert star.y > initial_y
        
        # Move star below screen and test cleanup
        star.y = 700  # Below screen height
        self.logic._update_stars(self.state, 0.1)
        
        # Star should be removed
        assert star not in self.state.stars
    
    def test_obstacle_collision(self):
        """Test collision with obstacles."""
        initial_lives = self.state.player.lives
        
        # Place obstacle at player position
        obstacle = Obstacle(self.state.player.x, self.state.player.y, 200)
        self.state.obstacles.append(obstacle)
        
        self.logic._check_collisions(self.state)
        
        # Player should lose a life
        assert self.state.player.lives == initial_lives - 1
        
        # Obstacle should be removed
        assert obstacle not in self.state.obstacles
        
        # Player should be invulnerable
        assert self.state.player.is_invulnerable()
        
        # Combo should reset
        assert self.state.combo_multiplier == 1
    
    def test_star_collision(self):
        """Test collision with stars."""
        initial_score = self.state.score
        
        # Place star at player position
        star = Star(self.state.player.x, self.state.player.y, 0.0)
        self.state.stars.append(star)
        
        self.logic._check_collisions(self.state)
        
        # Score should increase
        assert self.state.score > initial_score
        
        # Star should be removed
        assert star not in self.state.stars
        
        # Last star time should be updated
        assert self.state.last_star_time == self.state.game_time
    
    def test_invulnerability(self):
        """Test player invulnerability mechanics."""
        # Make player invulnerable
        self.state.player.invulnerable_time = 1.0
        
        # Place obstacle at player position
        obstacle = Obstacle(self.state.player.x, self.state.player.y, 200)
        self.state.obstacles.append(obstacle)
        
        initial_lives = self.state.player.lives
        self.logic._check_collisions(self.state)
        
        # Player should not lose a life due to invulnerability
        assert self.state.player.lives == initial_lives
        
        # Obstacle should still be there
        assert obstacle in self.state.obstacles
    
    def test_combo_system(self):
        """Test combo multiplier system."""
        self.state.game_time = 10.0
        self.state.last_star_time = 8.0  # 2 seconds ago
        
        self.logic._update_combo(self.state)
        
        # Should build combo since within 3 seconds
        assert self.state.combo_multiplier > 1
        
        # Test combo reset after 3 seconds
        self.state.last_star_time = 6.0  # 4 seconds ago
        self.logic._update_combo(self.state)
        
        # Should reset combo
        assert self.state.combo_multiplier == 1
    
    def test_game_over(self):
        """Test game over condition."""
        self.state.player.lives = 0
        
        player_input = {'left': False, 'right': False}
        self.logic.update(self.state, 0.1, player_input)
        
        # Game should be over
        assert self.state.game_over
    
    def test_pause_toggle(self):
        """Test pause functionality."""
        assert not self.state.paused
        
        self.logic.toggle_pause(self.state)
        assert self.state.paused
        
        self.logic.toggle_pause(self.state)
        assert not self.state.paused
        
        # Can't pause when game is over
        self.state.game_over = True
        self.logic.toggle_pause(self.state)
        assert not self.state.paused
    
    def test_restart_game(self):
        """Test game restart functionality."""
        # Modify game state
        self.state.score = 100
        self.state.player.lives = 1
        self.state.game_over = True
        self.state.obstacles.append(Obstacle(100, 100, 200))
        
        self.logic.restart_game(self.state)
        
        # State should be reset
        assert self.state.score == 0
        assert self.state.player.lives == 3
        assert not self.state.game_over
        assert len(self.state.obstacles) == 0


if __name__ == '__main__':
    pytest.main([__file__])