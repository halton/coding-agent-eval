const inputState = {
    jump: false,
    pause: false,
    restart: false,
};

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        inputState.jump = true;
    }
    if (e.code === 'KeyP') {
        inputState.pause = true;
    }
    if (e.code === 'KeyR') {
        inputState.restart = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        inputState.jump = false;
    }
    if (e.code === 'KeyP') {
        inputState.pause = false;
    }
    if (e.code === 'KeyR') {
        inputState.restart = false;
    }
});
