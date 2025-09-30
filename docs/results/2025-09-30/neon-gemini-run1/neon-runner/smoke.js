const assert = require('assert');

try {
    require('./src/physics.js');
    require('./src/spawner.js');
    require('./src/score.js');
    console.log('Smoke test passed');
} catch (e) {
    console.error('Smoke test failed', e);
    process.exit(1);
}