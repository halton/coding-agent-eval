"""
Rendering system for the game.
"""
import pygame
from typing import Optional
from .model import GameState


class Renderer:
    """Handles all game rendering."""
    
    def __init__(self, screen_width: int = 800, screen_height: int = 600):
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.screen: Optional[pygame.Surface] = None
        self.font: Optional[pygame.font.Font] = None
        
        # Colors
        self.BLACK = (0, 0, 0)
        self.WHITE = (255, 255, 255)
        self.RED = (255, 0, 0)
        self.GREEN = (0, 255, 0)
        self.BLUE = (0, 0, 255)
        self.YELLOW = (255, 255, 0)
        self.GRAY = (128, 128, 128)
    
    def initialize(self) -> pygame.Surface:
        """Initialize pygame and return the screen surface."""
        pygame.init()
        pygame.font.init()
        self.screen = pygame.display.set_mode((self.screen_width, self.screen_height))
        pygame.display.set_caption("Dodgefall")
        self.font = pygame.font.Font(None, 36)
        return self.screen
    
    def render(self, state: GameState) -> None:
        """Render the complete game state."""
        if not self.screen or not self.font:
            return
            
        # Clear screen
        self.screen.fill(self.BLACK)
        
        # Render game objects
        self._render_player(state)
        self._render_obstacles(state)
        self._render_stars(state)
        
        # Render UI
        self._render_ui(state)
        
        # Render game over or pause overlay
        if state.game_over:
            self._render_game_over(state)
        elif state.paused:
            self._render_pause()
        
        pygame.display.flip()
    
    def _render_player(self, state: GameState) -> None:
        """Render the player."""
        color = self.BLUE
        if state.player.is_invulnerable():
            # Flash during invulnerability
            flash_rate = 10  # flashes per second
            if int(state.game_time * flash_rate) % 2:
                color = self.GRAY
        
        rect = pygame.Rect(state.player.x, state.player.y, 
                          state.player.width, state.player.height)
        pygame.draw.rect(self.screen, color, rect)
    
    def _render_obstacles(self, state: GameState) -> None:
        """Render falling obstacles."""
        for obstacle in state.obstacles:
            rect = pygame.Rect(obstacle.x, obstacle.y, 
                             obstacle.width, obstacle.height)
            pygame.draw.rect(self.screen, self.RED, rect)
    
    def _render_stars(self, state: GameState) -> None:
        """Render collectible stars."""
        for star in state.stars:
            # Draw a simple star shape using a polygon
            center_x = star.x + star.width // 2
            center_y = star.y + star.height // 2
            size = star.width // 2
            
            # Create star points
            points = []
            for i in range(10):
                angle = i * 36  # 360/10 degrees
                if i % 2 == 0:
                    # Outer points
                    radius = size
                else:
                    # Inner points
                    radius = size // 2
                
                import math
                x = center_x + radius * math.cos(math.radians(angle - 90))
                y = center_y + radius * math.sin(math.radians(angle - 90))
                points.append((x, y))
            
            pygame.draw.polygon(self.screen, self.YELLOW, points)
    
    def _render_ui(self, state: GameState) -> None:
        """Render user interface elements."""
        if not self.font:
            return
            
        # Score
        score_text = self.font.render(f"Score: {state.score}", True, self.WHITE)
        self.screen.blit(score_text, (10, 10))
        
        # High score
        high_score_text = self.font.render(f"High Score: {state.high_score}", True, self.WHITE)
        self.screen.blit(high_score_text, (10, 50))
        
        # Lives
        lives_text = self.font.render(f"Lives: {state.player.lives}", True, self.WHITE)
        self.screen.blit(lives_text, (10, 90))
        
        # Combo multiplier (only show if > 1)
        if state.combo_multiplier > 1:
            combo_text = self.font.render(f"Combo: x{state.combo_multiplier}", True, self.GREEN)
            self.screen.blit(combo_text, (10, 130))
        
        # Instructions
        instruction_font = pygame.font.Font(None, 24)
        instructions = [
            "A/D or ←/→ to move",
            "P to pause, Esc to quit"
        ]
        for i, instruction in enumerate(instructions):
            text = instruction_font.render(instruction, True, self.GRAY)
            self.screen.blit(text, (self.screen_width - 200, 10 + i * 25))
    
    def _render_pause(self) -> None:
        """Render pause overlay."""
        if not self.font:
            return
            
        # Semi-transparent overlay
        overlay = pygame.Surface((self.screen_width, self.screen_height))
        overlay.set_alpha(128)
        overlay.fill(self.BLACK)
        self.screen.blit(overlay, (0, 0))
        
        # Pause text
        pause_text = self.font.render("PAUSED", True, self.WHITE)
        text_rect = pause_text.get_rect(center=(self.screen_width // 2, self.screen_height // 2))
        self.screen.blit(pause_text, text_rect)
        
        resume_text = pygame.font.Font(None, 24).render("Press P to resume", True, self.WHITE)
        resume_rect = resume_text.get_rect(center=(self.screen_width // 2, self.screen_height // 2 + 40))
        self.screen.blit(resume_text, resume_rect)
    
    def _render_game_over(self, state: GameState) -> None:
        """Render game over overlay."""
        if not self.font:
            return
            
        # Semi-transparent overlay
        overlay = pygame.Surface((self.screen_width, self.screen_height))
        overlay.set_alpha(128)
        overlay.fill(self.BLACK)
        self.screen.blit(overlay, (0, 0))
        
        # Game over text
        game_over_text = self.font.render("GAME OVER", True, self.RED)
        text_rect = game_over_text.get_rect(center=(self.screen_width // 2, self.screen_height // 2 - 40))
        self.screen.blit(game_over_text, text_rect)
        
        # Final score
        score_text = self.font.render(f"Final Score: {state.score}", True, self.WHITE)
        score_rect = score_text.get_rect(center=(self.screen_width // 2, self.screen_height // 2))
        self.screen.blit(score_text, score_rect)
        
        # High score indicator
        if state.score == state.high_score and state.score > 0:
            new_high_text = pygame.font.Font(None, 24).render("NEW HIGH SCORE!", True, self.GREEN)
            new_high_rect = new_high_text.get_rect(center=(self.screen_width // 2, self.screen_height // 2 + 30))
            self.screen.blit(new_high_text, new_high_rect)
        
        # Restart instruction
        restart_text = pygame.font.Font(None, 24).render("Press R to restart or Esc to quit", True, self.WHITE)
        restart_rect = restart_text.get_rect(center=(self.screen_width // 2, self.screen_height // 2 + 60))
        self.screen.blit(restart_text, restart_rect)
    
    def cleanup(self) -> None:
        """Clean up pygame resources."""
        pygame.quit()