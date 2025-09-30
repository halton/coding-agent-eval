#!/usr/bin/env bash
set -euo pipefail

echo "Running acceptance tests for Dodgefall..."

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
python -m pip install -r requirements.txt

# Run unit tests
echo "Running unit tests..."
PYTHONPATH=. pytest tests/ -q

# Run headless game test
echo "Running headless game test..."
HEADLESS=1 python -m game.main

echo "ACCEPT: OK"