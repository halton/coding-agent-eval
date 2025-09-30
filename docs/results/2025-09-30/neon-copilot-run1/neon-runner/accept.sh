#!/usr/bin/env bash
set -euo pipefail
npm ci
npm test
node smoke.js
echo "ACCEPT: OK"