#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Basic smoke test to verify all files exist and basic functionality works
function smokeTest() {
  console.log('🔍 Running smoke tests...');
  
  // Check all required files exist
  const requiredFiles = [
    'package.json',
    'jest.config.json',
    'README.md',
    'accept.sh',
    'src/physics.js',
    'src/spawner.js', 
    'src/score.js',
    'tests/physics.test.js',
    'tests/spawner.test.js',
    'tests/score.test.js',
    'public/index.html',
    'public/game.js',
    'public/render.js',
    'public/input.js'
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`❌ Missing required file: ${file}`);
    }
  }
  console.log('✅ All required files exist');
  
  // Test core game logic classes can be instantiated
  const Physics = require('./src/physics');
  const Spawner = require('./src/spawner');
  const Score = require('./src/score');
  
  // Test Physics
  const physics = new Physics();
  const player = physics.createPlayer();
  const obstacle = physics.createObstacle(500);
  
  if (player.x !== 50 || player.y !== 300) {
    throw new Error('❌ Physics player creation failed');
  }
  
  if (obstacle.x !== 500) {
    throw new Error('❌ Physics obstacle creation failed');
  }
  console.log('✅ Physics system working');
  
  // Test Spawner
  const spawner = new Spawner(physics);
  const difficulty0 = spawner.getCurrentDifficulty();
  const difficulty1 = spawner.getCurrentDifficulty(Date.now() + 31000);
  
  if (difficulty0 !== 0 || difficulty1 !== 1) {
    throw new Error('❌ Spawner difficulty calculation failed');
  }
  console.log('✅ Spawner system working');
  
  // Test Score
  const score = new Score();
  score.updateDistance(100);
  score.recordPerfectJump();
  
  const stats = score.getStats();
  if (stats.distance !== 100 || stats.perfectJumps !== 1) {
    throw new Error('❌ Score system failed');
  }
  console.log('✅ Score system working');
  
  // Test coyote time functionality
  const testPlayer = physics.createPlayer();
  testPlayer.onGround = false;
  testPlayer.lastGroundTime = Date.now() - 50; // 50ms ago, within coyote time
  
  if (!physics.canJump(testPlayer)) {
    throw new Error('❌ Coyote time not working');
  }
  
  testPlayer.lastGroundTime = Date.now() - 100; // 100ms ago, beyond coyote time
  if (physics.canJump(testPlayer)) {
    throw new Error('❌ Coyote time not working');
  }
  console.log('✅ Coyote time working');
  
  // Test streak bonus
  const testScore = new Score();
  testScore.recordPerfectJump();
  testScore.recordPerfectJump();
  testScore.recordPerfectJump(); // Should trigger bonus
  
  if (testScore.streakBonus !== 30) {
    throw new Error('❌ Streak bonus not working');
  }
  console.log('✅ Streak bonus working');
  
  // Verify HTML contains required elements
  const htmlContent = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8');
  const requiredElements = ['gameCanvas', 'score', 'highScore', 'gameOver'];
  
  for (const elementId of requiredElements) {
    if (!htmlContent.includes(`id="${elementId}"`)) {
      throw new Error(`❌ Missing required HTML element: ${elementId}`);
    }
  }
  console.log('✅ HTML structure correct');
  
  console.log('🎉 All smoke tests passed!');
}

try {
  smokeTest();
  process.exit(0);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}