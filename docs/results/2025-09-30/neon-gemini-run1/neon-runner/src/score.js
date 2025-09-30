const STREAK_BONUS = 100;

function createScore() {
    return {
        currentScore: 0,
        highScore: 0,
        streak: 0,
    };
}

function updateScore(score, distance) {
    score.currentScore = Math.floor(distance);
}

function recordPerfectJump(score) {
    score.streak++;
    if (score.streak >= 3) {
        score.currentScore += STREAK_BONUS;
    }
}

function resetStreak(score) {
    score.streak = 0;
}

function saveHighScore(score, storage) {
    if (score.currentScore > score.highScore) {
        score.highScore = score.currentScore;
        if (storage) {
            storage.setItem('highScore', score.highScore);
        }
    }
}

function loadHighScore(score, storage) {
    if (storage) {
        const storedHighScore = storage.getItem('highScore');
        if (storedHighScore) {
            score.highScore = parseInt(storedHighScore, 10);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createScore, updateScore, recordPerfectJump, resetStreak, saveHighScore, loadHighScore };
}
