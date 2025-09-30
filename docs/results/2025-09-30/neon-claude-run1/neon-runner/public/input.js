class InputHandler {
  constructor(game) {
    this.game = game;
    this.keys = {};
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  handleKeyDown(event) {
    if (this.keys[event.code]) {
      return;
    }

    this.keys[event.code] = true;

    switch(event.code) {
      case 'Space':
        event.preventDefault();
        if (this.game.gameState === 'ready') {
          this.game.start();
        } else if (this.game.gameState === 'playing') {
          this.game.jump();
        }
        break;

      case 'KeyP':
        if (this.game.gameState === 'playing') {
          this.game.togglePause();
        }
        break;

      case 'KeyR':
        if (this.game.gameState === 'gameover') {
          this.game.start();
        }
        break;
    }
  }

  handleKeyUp(event) {
    this.keys[event.code] = false;

    switch(event.code) {
      case 'Space':
        this.game.releaseJump();
        break;
    }
  }
}