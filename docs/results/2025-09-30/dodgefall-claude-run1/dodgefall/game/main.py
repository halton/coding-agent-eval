"""Main entry point for Dodgefall game."""

import os
import sys
import pygame
from .model import GameState, Player
from .logic import (update_game, toggle_pause, restart_game,
                   load_high_score)
from .render import render_game


def main():
    """Main game loop."""
    # Headless mode for testing
    headless = os.environ.get('HEADLESS', '0') == '1'
    if headless:
        os.environ['SDL_VIDEODRIVER'] = 'dummy'

    # Initialize Pygame
    pygame.init()

    # Set up display
    screen_width = 800
    screen_height = 600
    screen = pygame.display.set_mode((screen_width, screen_height))
    pygame.display.set_caption("Dodgefall")

    # Clock for FPS
    clock = pygame.time.Clock()

    # Font
    font = pygame.font.Font(None, 36)

    # Initialize game state
    player = Player(x=screen_width / 2, y=screen_height - 60)
    state = GameState(
        player=player,
        screen_width=screen_width,
        screen_height=screen_height,
        high_score=load_high_score()
    )

    # Game loop
    running = True
    frame_count = 0
    max_frames = 120 if headless else float('inf')

    while running and frame_count < max_frames:
        dt = clock.tick(60) / 1000.0  # 60 FPS
        frame_count += 1

        # Handle events
        keys_pressed = pygame.key.get_pressed()
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False
                elif event.key == pygame.K_p:
                    toggle_pause(state)
                elif event.key == pygame.K_r and state.game_over:
                    restart_game(state)

        # Update game
        update_game(state, dt, keys_pressed,
                   pygame.K_LEFT, pygame.K_RIGHT,
                   pygame.K_a, pygame.K_d)

        # Render
        if not headless:
            render_game(screen, state, font)
            pygame.display.flip()

    pygame.quit()
    sys.exit(0)


if __name__ == "__main__":
    main()