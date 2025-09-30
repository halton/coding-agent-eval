const { createScore, updateScore, recordPerfectJump, resetStreak, saveHighScore, loadHighScore } = require('../src/score');

// Mock localStorage
const createMockStorage = () => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => store[key] = value.toString(),
        clear: () => store = {},
    };
};

describe('score', () => {
    let score;
    let mockStorage;

    beforeEach(() => {
        score = createScore();
        mockStorage = createMockStorage();
    });

    it('should create a score object with default values', () => {
        expect(score).toEqual({ currentScore: 0, highScore: 0, streak: 0 });
    });

    it('should update the current score', () => {
        updateScore(score, 123.45);
        expect(score.currentScore).toBe(123);
    });

    it('should increment the streak on a perfect jump', () => {
        recordPerfectJump(score);
        expect(score.streak).toBe(1);
    });

    it('should not add a bonus for a streak less than 3', () => {
        recordPerfectJump(score);
        recordPerfectJump(score);
        expect(score.currentScore).toBe(0);
    });

    it('should add a bonus for a streak of 3 or more', () => {
        recordPerfectJump(score);
        recordPerfectJump(score);
        recordPerfectJump(score);
        expect(score.currentScore).toBe(100);
        recordPerfectJump(score);
        expect(score.currentScore).toBe(200);
    });

    it('should reset the streak', () => {
        recordPerfectJump(score);
        resetStreak(score);
        expect(score.streak).toBe(0);
    });

    it('should save the high score', () => {
        score.currentScore = 200;
        saveHighScore(score, mockStorage);
        expect(score.highScore).toBe(200);
        expect(mockStorage.getItem('highScore')).toBe('200');
    });

    it('should not overwrite a higher high score', () => {
        score.highScore = 300;
        score.currentScore = 200;
        saveHighScore(score, mockStorage);
        expect(score.highScore).toBe(300);
        expect(mockStorage.getItem('highScore')).toBe(null);
    });

    it('should load the high score', () => {
        mockStorage.setItem('highScore', '456');
        loadHighScore(score, mockStorage);
        expect(score.highScore).toBe(456);
    });
});
