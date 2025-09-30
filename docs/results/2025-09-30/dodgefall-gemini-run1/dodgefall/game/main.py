import pygame
import os
import json
from . import logic
from . import render

HIGH_SCORE_FILE = "highscore.json"

def main():
    if os.getenv("HEADLESS") == "1":
        os.environ["SDL_VIDEODRIVER"] = "dummy"

    pygame.init()

    screen = pygame.display.set_mode((logic.WIDTH, logic.HEIGHT))
    pygame.display.set_caption("Dodgefall")
    font = pygame.font.Font(None, 36)
    clock = pygame.time.Clock()

    high_score = load_high_score()
    state = logic.init_game_state()

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False
                if event.key == pygame.K_p:
                    logic.toggle_pause(state)
                if event.key == pygame.K_r and state.game_over:
                    if state.score > high_score:
                        high_score = state.score
                        save_high_score(high_score)
                    state = logic.restart_game(state)

        if not state.paused and not state.game_over:
            keys = pygame.key.get_pressed()
            if keys[pygame.K_a] or keys[pygame.K_LEFT]:
                logic.move_player(state, -1)
            if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
                logic.move_player(state, 1)

        delta_time = clock.tick(60) / 1000.0
        logic.update_game_state(state, delta_time)

        render.render(screen, state, font, high_score)

        if os.getenv("HEADLESS") == "1":
            if pygame.time.get_ticks() > 120:
                running = False

    if state.score > high_score:
        save_high_score(state.score)

    pygame.quit()

def load_high_score() -> int:
    if os.path.exists(HIGH_SCORE_FILE):
        with open(HIGH_SCORE_FILE, "r") as f:
            try:
                return json.load(f)["high_score"]
            except (json.JSONDecodeError, KeyError):
                return 0
    return 0

def save_high_score(score: int):
    with open(HIGH_SCORE_FILE, "w") as f:
        json.dump({"high_score": score}, f)

if __name__ == "__main__":
    main()
