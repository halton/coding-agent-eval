#!/usr/bin/env bash
set -euo pipefail
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
export PYTHONPATH=.
pytest -q
HEADLESS=1 python -m game.main
echo "ACCEPT: OK"
