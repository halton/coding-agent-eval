const fs = require('fs');
const path = require('path');

console.log('Running smoke tests...\n');

const requiredFiles = [
  'package.json',
  'public/index.html',
  'public/game.js',
  'public/render.js',
  'public/input.js',
  'src/physics.js',
  'src/spawner.js',
  'src/score.js',
  'tests/physics.test.js',
  'tests/spawner.test.js',
  'tests/score.test.js'
];

const requiredDirs = [
  'public',
  'src',
  'tests'
];

let allTestsPassed = true;

console.log('Checking directory structure...');
for (const dir of requiredDirs) {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    console.log(`✓ Directory ${dir}/ exists`);
  } else {
    console.log(`✗ Directory ${dir}/ missing`);
    allTestsPassed = false;
  }
}

console.log('\nChecking required files...');
for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✓ File ${file} exists`);
  } else {
    console.log(`✗ File ${file} missing`);
    allTestsPassed = false;
  }
}

console.log('\nValidating package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

  if (packageJson.scripts?.test === 'jest -c jest.config.json --runInBand') {
    console.log('✓ Test script configured correctly');
  } else {
    console.log('✗ Test script misconfigured');
    allTestsPassed = false;
  }

  if (packageJson.scripts?.start === 'npx http-server public -p 8080 -c-1') {
    console.log('✓ Start script configured correctly');
  } else {
    console.log('✗ Start script misconfigured');
    allTestsPassed = false;
  }

  if (packageJson.devDependencies?.jest?.startsWith('^29')) {
    console.log('✓ Jest version correct');
  } else {
    console.log('✗ Jest version incorrect');
    allTestsPassed = false;
  }
} catch (err) {
  console.log('✗ Failed to parse package.json:', err.message);
  allTestsPassed = false;
}

console.log('\nValidating game modules...');
try {
  const Physics = require('./src/physics');
  const Spawner = require('./src/spawner');
  const Score = require('./src/score');

  const physics = new Physics();
  const spawner = new Spawner();
  const score = new Score();

  if (physics.coyoteTime === 80) {
    console.log('✓ Physics coyote time is 80ms');
  } else {
    console.log('✗ Physics coyote time incorrect');
    allTestsPassed = false;
  }

  if (spawner.difficultyIncreaseInterval === 30000) {
    console.log('✓ Difficulty increases every 30s');
  } else {
    console.log('✗ Difficulty interval incorrect');
    allTestsPassed = false;
  }

  console.log('✓ All game modules load correctly');
} catch (err) {
  console.log('✗ Failed to load game modules:', err.message);
  allTestsPassed = false;
}

console.log('\nValidating HTML...');
try {
  const html = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8');

  if (html.includes('<canvas id="gameCanvas">')) {
    console.log('✓ Game canvas element exists');
  } else {
    console.log('✗ Game canvas missing');
    allTestsPassed = false;
  }

  if (html.includes('game.js') && html.includes('render.js') && html.includes('input.js')) {
    console.log('✓ All game scripts included');
  } else {
    console.log('✗ Some game scripts missing');
    allTestsPassed = false;
  }
} catch (err) {
  console.log('✗ Failed to read index.html:', err.message);
  allTestsPassed = false;
}

if (allTestsPassed) {
  console.log('\n✅ All smoke tests passed!\n');
  process.exit(0);
} else {
  console.log('\n❌ Some smoke tests failed\n');
  process.exit(1);
}