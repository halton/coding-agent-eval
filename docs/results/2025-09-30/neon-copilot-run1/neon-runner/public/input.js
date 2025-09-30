class InputHandler {
  constructor() {
    this.keys = new Set();
    this.jumpPressed = false;
    this.pausePressed = false;
    this.restartPressed = false;
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // Prevent default behavior for game keys
    document.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'KeyP', 'KeyR'].includes(e.code)) {
        e.preventDefault();
      }
    });
  }

  handleKeyDown(e) {
    this.keys.add(e.code);
    
    // Handle single-press actions
    if (!this.jumpPressed && (e.code === 'Space' || e.code === 'ArrowUp')) {
      this.jumpPressed = true;
    }
    
    if (!this.pausePressed && e.code === 'KeyP') {
      this.pausePressed = true;
    }
    
    if (!this.restartPressed && e.code === 'KeyR') {
      this.restartPressed = true;
    }
  }

  handleKeyUp(e) {
    this.keys.delete(e.code);
    
    // Reset single-press flags
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      this.jumpPressed = false;
    }
    
    if (e.code === 'KeyP') {
      this.pausePressed = false;
    }
    
    if (e.code === 'KeyR') {
      this.restartPressed = false;
    }
  }

  isKeyPressed(keyCode) {
    return this.keys.has(keyCode);
  }

  consumeJump() {
    if (this.jumpPressed) {
      this.jumpPressed = false;
      return true;
    }
    return false;
  }

  consumePause() {
    if (this.pausePressed) {
      this.pausePressed = false;
      return true;
    }
    return false;
  }

  consumeRestart() {
    if (this.restartPressed) {
      this.restartPressed = false;
      return true;
    }
    return false;
  }

  reset() {
    this.keys.clear();
    this.jumpPressed = false;
    this.pausePressed = false;
    this.restartPressed = false;
  }
}