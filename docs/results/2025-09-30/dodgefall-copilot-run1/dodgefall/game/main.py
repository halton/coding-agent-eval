"""
Main game entry point.
"""
import os
import sys
import pygame
from .logic import GameLogic
from .render import Renderer


class Game:
    """Main game controller."""
    
    def __init__(self):
        self.screen_width = 800
        self.screen_height = 600
        self.logic = GameLogic(self.screen_width, self.screen_height)
        self.renderer = Renderer(self.screen_width, self.screen_height)
        self.clock = pygame.time.Clock()
        self.running = False
        
    def run(self) -> None:
        """Run the main game loop."""
        # Check for headless mode
        headless = os.environ.get('HEADLESS', '0') == '1'
        if headless:
            os.environ['SDL_VIDEODRIVER'] = 'dummy'
        
        # Initialize renderer
        screen = self.renderer.initialize()
        
        # Create game state
        game_state = self.logic.create_game_state()
        
        # Game loop
        self.running = True
        frame_count = 0
        
        try:
            while self.running:
                dt = self.clock.tick(60) / 1000.0  # Delta time in seconds
                
                # Handle events
                player_input = self._handle_events(game_state)
                
                # Update game logic
                self.logic.update(game_state, dt, player_input)
                
                # Render (skip in headless mode for performance)
                if not headless:
                    self.renderer.render(game_state)
                
                # Headless mode: exit after ~120 frames (~2 seconds at 60 FPS)
                if headless:
                    frame_count += 1
                    if frame_count >= 120:
                        break
                        
        except KeyboardInterrupt:
            pass
        finally:
            self.renderer.cleanup()
    
    def _handle_events(self, game_state) -> dict:
        """Handle pygame events and return player input state."""
        player_input = {
            'left': False,
            'right': False
        }
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.running = False
                elif event.key == pygame.K_p:
                    self.logic.toggle_pause(game_state)
                elif event.key == pygame.K_r and game_state.game_over:
                    self.logic.restart_game(game_state)
        
        # Handle continuous key presses
        keys = pygame.key.get_pressed()
        if keys[pygame.K_a] or keys[pygame.K_LEFT]:
            player_input['left'] = True
        if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
            player_input['right'] = True
            
        return player_input


def main():
    """Main entry point."""
    game = Game()
    game.run()
    sys.exit(0)


if __name__ == '__main__':
    main()