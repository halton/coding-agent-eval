#!/usr/bin/env node

// Simple test runner for the unit tests
const fs = require('fs');
const path = require('path');

// Mock jest globals
// Mock jest globals
let beforeEachFn = null;

global.describe = (name, fn) => {
  console.log(`\n📦 ${name}`);
  fn();
};

global.test = (name, fn) => {
  try {
    // Run beforeEach if defined
    if (beforeEachFn) {
      beforeEachFn();
    }
    
    // Handle async tests with done callback
    if (fn.length > 0) {
      const done = () => {}; // Simple done callback
      fn(done);
    } else {
      fn();
    }
    console.log(`  ✅ ${name}`);
  } catch (error) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${error.message}`);
    process.exitCode = 1;
  }
};

global.beforeEach = (fn) => {
  beforeEachFn = fn;
};

global.expect = (actual) => ({
  toBe: (expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${actual} to be ${expected}`);
    }
  },
  toHaveLength: (expected) => {
    if (actual.length !== expected) {
      throw new Error(`Expected length ${actual.length} to be ${expected}`);
    }
  },
  toBeLessThan: (expected) => {
    if (actual >= expected) {
      throw new Error(`Expected ${actual} to be less than ${expected}`);
    }
  },
  toBeNull: () => {
    if (actual !== null) {
      throw new Error(`Expected ${actual} to be null`);
    }
  },
  not: {
    toBeNull: () => {
      if (actual === null) {
        throw new Error(`Expected ${actual} not to be null`);
      }
    },
    toBe: (expected) => {
      if (actual === expected) {
        throw new Error(`Expected ${actual} not to be ${expected}`);
      }
    }
  }
});

// Mock jest functions
global.jest = {
  fn: () => ({
    mockReturnValue: (value) => () => value
  })
};

console.log('🧪 Running unit tests...\n');

// Run all test files
const testFiles = [
  './tests/physics.test.js',
  './tests/spawner.test.js', 
  './tests/score.test.js'
];

for (const testFile of testFiles) {
  if (fs.existsSync(path.join(__dirname, testFile))) {
    require(testFile);
  }
}

if (process.exitCode === 1) {
  console.log('\n❌ Some tests failed');
} else {
  console.log('\n✅ All tests passed!');
}