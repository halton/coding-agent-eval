import pygame
from .model import GameState

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
YELLOW = (255, 255, 0)

def render(screen, state: GameState, font, high_score: int):
    screen.fill(BLACK)

    if state.game_over:
        render_game_over(screen, state, font, high_score)
    else:
        render_game(screen, state, font)

    pygame.display.flip()

def render_game(screen, state: GameState, font):
    # Draw player
    player_color = WHITE if not state.invulnerable else YELLOW
    pygame.draw.rect(screen, player_color, (state.player.x, state.player.y, state.player.width, state.player.height))

    # Draw obstacles
    for obstacle in state.obstacles:
        pygame.draw.rect(screen, RED, (obstacle.x, obstacle.y, obstacle.width, obstacle.height))

    # Draw stars
    for star in state.stars:
        pygame.draw.rect(screen, YELLOW, (star.x, star.y, star.width, star.height))

    # Draw score, lives, and combo
    score_text = font.render(f"Score: {state.score}", True, WHITE)
    lives_text = font.render(f"Lives: {state.lives}", True, WHITE)
    combo_text = font.render(f"Combo: x{state.combo_multiplier}", True, WHITE)
    screen.blit(score_text, (10, 10))
    screen.blit(lives_text, (10, 40))
    screen.blit(combo_text, (10, 70))

    if state.paused:
        render_pause(screen, font)

def render_game_over(screen, state: GameState, font, high_score: int):
    game_over_text = font.render("Game Over", True, WHITE)
    score_text = font.render(f"Your Score: {state.score}", True, WHITE)
    high_score_text = font.render(f"High Score: {high_score}", True, WHITE)
    restart_text = font.render("Press 'R' to Restart", True, WHITE)

    screen.blit(game_over_text, (screen.get_width() / 2 - game_over_text.get_width() / 2, screen.get_height() / 2 - 50))
    screen.blit(score_text, (screen.get_width() / 2 - score_text.get_width() / 2, screen.get_height() / 2))
    screen.blit(high_score_text, (screen.get_width() / 2 - high_score_text.get_width() / 2, screen.get_height() / 2 + 50))
    screen.blit(restart_text, (screen.get_width() / 2 - restart_text.get_width() / 2, screen.get_height() / 2 + 100))

def render_pause(screen, font):
    pause_text = font.render("Paused", True, WHITE)
    screen.blit(pause_text, (screen.get_width() / 2 - pause_text.get_width() / 2, screen.get_height() / 2 - pause_text.get_height() / 2))
