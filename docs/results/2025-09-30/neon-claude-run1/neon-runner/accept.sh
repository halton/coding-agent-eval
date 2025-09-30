#!/usr/bin/env bash
set -euo pipefail

echo "Running acceptance tests for Neon Runner..."
echo "=========================================="

echo "Installing dependencies..."
npm ci

echo ""
echo "Running unit tests..."
npm test

echo ""
echo "Running smoke tests..."
node smoke.js

echo ""
echo "=========================================="
echo "ACCEPT: OK"