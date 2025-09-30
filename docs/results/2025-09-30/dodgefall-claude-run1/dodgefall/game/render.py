"""Rendering system for Dodgefall."""

import pygame
from .model import GameState


def render_game(screen: pygame.Surface, state: GameState, font: pygame.font.Font) -> None:
    """Render the game state to the screen."""
    # Clear screen
    screen.fill((20, 20, 30))

    # Draw player (with flashing if invulnerable)
    player = state.player
    if player.invulnerable_time <= 0 or (int(player.invulnerable_time * 10) % 2 == 0):
        pygame.draw.rect(screen, (100, 200, 255),
                        (player.x, player.y, player.width, player.height))
        pygame.draw.rect(screen, (150, 220, 255),
                        (player.x + 5, player.y + 5, player.width - 10, player.height - 10))

    # Draw obstacles
    for obstacle in state.obstacles:
        pygame.draw.rect(screen, (255, 100, 100),
                        (obstacle.x, obstacle.y, obstacle.width, obstacle.height))
        pygame.draw.rect(screen, (200, 50, 50),
                        (obstacle.x + 3, obstacle.y + 3, obstacle.width - 6, obstacle.height - 6))

    # Draw stars
    for star in state.stars:
        # Draw star shape
        cx = star.x + star.width // 2
        cy = star.y + star.height // 2
        points = []
        for i in range(10):
            angle = i * 36 - 90
            radius = star.width // 2 if i % 2 == 0 else star.width // 4
            x = cx + radius * pygame.math.Vector2(1, 0).rotate(angle).x
            y = cy + radius * pygame.math.Vector2(1, 0).rotate(angle).y
            points.append((x, y))
        pygame.draw.polygon(screen, (255, 220, 100), points)

    # Draw UI
    draw_ui(screen, state, font)

    # Draw game over screen
    if state.game_over:
        draw_game_over(screen, state, font)

    # Draw pause overlay
    if state.paused:
        draw_pause(screen, font)


def draw_ui(screen: pygame.Surface, state: GameState, font: pygame.font.Font) -> None:
    """Draw UI elements."""
    # Score
    score_text = font.render(f"Score: {state.score}", True, (255, 255, 255))
    screen.blit(score_text, (10, 10))

    # High score
    high_score_text = font.render(f"High: {state.high_score}", True, (200, 200, 200))
    screen.blit(high_score_text, (10, 40))

    # Lives
    lives_text = font.render(f"Lives: {state.lives}", True, (255, 100, 100))
    screen.blit(lives_text, (state.screen_width - 100, 10))

    # Combo
    if state.combo > 1:
        combo_text = font.render(f"x{state.combo} COMBO!", True, (255, 220, 100))
        text_rect = combo_text.get_rect(center=(state.screen_width // 2, 60))
        screen.blit(combo_text, text_rect)


def draw_game_over(screen: pygame.Surface, state: GameState, font: pygame.font.Font) -> None:
    """Draw game over screen."""
    # Semi-transparent overlay
    overlay = pygame.Surface((state.screen_width, state.screen_height))
    overlay.set_alpha(180)
    overlay.fill((0, 0, 0))
    screen.blit(overlay, (0, 0))

    # Game over text
    game_over_text = font.render("GAME OVER", True, (255, 100, 100))
    text_rect = game_over_text.get_rect(center=(state.screen_width // 2, state.screen_height // 2 - 60))
    screen.blit(game_over_text, text_rect)

    # Final score
    score_text = font.render(f"Final Score: {state.score}", True, (255, 255, 255))
    text_rect = score_text.get_rect(center=(state.screen_width // 2, state.screen_height // 2))
    screen.blit(score_text, text_rect)

    # New high score message
    if state.score >= state.high_score and state.score > 0:
        high_text = font.render("NEW HIGH SCORE!", True, (255, 220, 100))
        text_rect = high_text.get_rect(center=(state.screen_width // 2, state.screen_height // 2 + 40))
        screen.blit(high_text, text_rect)

    # Restart instruction
    restart_text = font.render("Press R to restart", True, (200, 200, 200))
    text_rect = restart_text.get_rect(center=(state.screen_width // 2, state.screen_height // 2 + 80))
    screen.blit(restart_text, text_rect)


def draw_pause(screen: pygame.Surface, font: pygame.font.Font) -> None:
    """Draw pause overlay."""
    # Get screen dimensions
    width, height = screen.get_size()

    # Semi-transparent overlay
    overlay = pygame.Surface((width, height))
    overlay.set_alpha(128)
    overlay.fill((0, 0, 0))
    screen.blit(overlay, (0, 0))

    # Pause text
    pause_text = font.render("PAUSED", True, (255, 255, 255))
    text_rect = pause_text.get_rect(center=(width // 2, height // 2))
    screen.blit(pause_text, text_rect)

    # Instructions
    instr_text = font.render("Press P to resume", True, (200, 200, 200))
    text_rect = instr_text.get_rect(center=(width // 2, height // 2 + 40))
    screen.blit(instr_text, text_rect)