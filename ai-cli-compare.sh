#!/usr/bin/env bash
set -euo pipefail

# =========================
# Flags / defaults
# =========================
TASK="dodgefall"        # or neon
MODE="parallel"         # or serial
RUNS=1
BASE_DIR="${BASE_DIR:-$HOME/agent-eval-one}"
PYTHON_BIN="${PYTHON_BIN:-python3}"
NPM_BIN="${NPM_BIN:-npm}"
TIMEOUT_SEC="${TIMEOUT_SEC:-2400}"   # 40m per agent
RESULTS_CSV="$BASE_DIR/results.csv"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --task) TASK="$2"; shift 2;;
    --serial) MODE="serial"; shift;;
    --parallel) MODE="parallel"; shift;;
    --base-dir) BASE_DIR="$2"; shift 2;;
    --timeout) TIMEOUT_SEC="$2"; shift 2;;
    --runs) RUNS="$2"; shift 2;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

mkdir -p "$BASE_DIR"

# =========================
# Prechecks (soft)
# =========================
command -v timeout >/dev/null || { echo "Need 'timeout' (GNU coreutils)."; exit 1; }

have_claude=0;  command -v claude  >/dev/null && have_claude=1
have_copilot=0; command -v copilot >/dev/null && have_copilot=1
have_gemini=0;  command -v gemini  >/dev/null && have_gemini=1

if (( have_claude + have_copilot + have_gemini == 0 )); then
  echo "No agent CLIs found ('claude', 'copilot', 'gemini'). Install at least one and re-run."
  exit 1
fi

# =========================
# Agent commands (interactive mode for visibility)
# =========================
# Claude Code: interactive mode; no API key check here—if not authed, the run will fail and be logged.
CLAUDE_CMD=${CLAUDE_CMD:-'claude --output-format stream-json --max-turns 20'}

# Copilot CLI: interactive mode; restrict dangerous tools but allow prompts.
COPILOT_FLAGS=${COPILOT_FLAGS:-"--allow-all-tools --allow-tool write --allow-tool shell --deny-tool shell(rm) --deny-tool shell(git_push)"}
COPILOT_CMD=${COPILOT_CMD:-"copilot $COPILOT_FLAGS"}

# Gemini CLI: interactive mode with JSON output.
GEMINI_FLAGS=${GEMINI_FLAGS:-"--yolo"}
GEMINI_CMD=${GEMINI_CMD:-"gemini $GEMINI_FLAGS"}

# =========================
# Trust / permissions (avoid prompts)
# =========================
COPILOT_CFG_DIR="$BASE_DIR/copilot-config"
mkdir -p "$COPILOT_CFG_DIR"
printf '{ "trusted_folders": ["%s"] }\n' "$BASE_DIR" > "$COPILOT_CFG_DIR/config.json"
export XDG_CONFIG_HOME="$COPILOT_CFG_DIR"

CLAUDE_SETTINGS='{
  "permissions": {
    "allow": [
      "Edit(*)","Write(*)",
      "Bash(python *)","Bash(pip *)","Bash(pytest *)",
      "Bash(node *)","Bash(npm *)","Bash(npx http-server *)"
    ],
    "deny": ["Bash(rm *)","Bash(curl *| sh *)","Bash(git push *)"]
  }
}'

# =========================
# Prompts (one project)
# =========================
read -r -d '' PROMPT_DODGEFALL <<'EOF' || true
Create a Pygame arcade game called “Dodgefall”.

Functional requirements:
1) Player moves left/right with A/D or ←/→.
2) Falling obstacles spawn and gradually speed up.
3) Collectible stars increase score; grabbing stars within 3 seconds builds a combo multiplier.
4) Lives = 3. On collision: lose a life and ~1.5s invulnerability.
5) P = pause/resume, R = restart on game over, Esc = quit.
6) Persist high score in highscore.json.

Engineering requirements:
- Separate pure logic from rendering & input so unit tests run headless.
- Structure:

dodgefall/
  game/
    __init__.py
    logic.py
    model.py
    render.py
    main.py
  tests/
    test_logic.py
  requirements.txt (pygame, pytest)
  README.md
  accept.sh

Headless & acceptance:
- When HEADLESS=1: set SDL_VIDEODRIVER=dummy, tick ~120 frames, then exit 0.
- accept.sh:
  #!/usr/bin/env bash
  set -euo pipefail
  python3 -m venv venv
  source venv/bin/activate
  python -m pip install -r requirements.txt
  pytest -q
  HEADLESS=1 python -m game.main
  echo "ACCEPT: OK"

Constraints:
- Keep code small and deterministic.
- No heavy assets; use shapes or tiny PNGs.
- Python 3.10+.
EOF

read -r -d '' PROMPT_NEON <<'EOF' || true
Create a browser game “Neon Runner” with HTML5 Canvas + vanilla JS.

Gameplay:
1) Endless runner: jump over obstacles.
2) Physics: gravity, jump impulse, coyote time (~80ms).
3) Difficulty ramps every 30s.
4) Score by distance; streak bonus for 3 perfect jumps in a row.
5) Persist high score in localStorage.
6) P = pause/resume; R = restart after game over.

Engineering:
- Separate logic from rendering so unit tests require no DOM.
- Structure:

neon-runner/
  public/
    index.html
    game.js
    render.js
    input.js
  src/
    physics.js
    spawner.js
    score.js
  tests/
    physics.test.js
    spawner.test.js
    score.test.js
  smoke.js
  package.json  # scripts: test, start
  README.md
  accept.sh

Tooling:
- npm scripts:
  "test": "jest -c jest.config.json --runInBand",
  "start": "npx http-server public -p 8080 -c-1"
- devDependencies: jest ^29.x, http-server
- accept.sh:
  #!/usr/bin/env bash
  set -euo pipefail
  npm ci
  npm test
  node smoke.js
  echo "ACCEPT: OK"

Constraints:
- No frameworks; vanilla JS only.
- Tests cover physics edge cases and spawner difficulty ramp.
EOF

PROMPT="$PROMPT_DODGEFALL"
PROJECT_ROOT_NAME="dodgefall"
if [[ "$TASK" == "neon" ]]; then
  PROMPT="$PROMPT_NEON"
  PROJECT_ROOT_NAME="neon-runner"
fi

# =========================
# Helpers
# =========================
timestamp() { date +%s; }

# Function to run command in a new terminal window
run_in_terminal() {
  local title="$1"
  local cmd="$2"
  local logfile="$3"

  # Create a script that runs the command and logs output
  local script_file="/tmp/agent_runner_$$.sh"
  cat > "$script_file" << EOF
#!/bin/bash
echo "Starting $title..."
echo "Command: $cmd"
echo "Log file: $logfile"
echo "Working directory: \$(pwd)"
echo "Press Ctrl+C to stop the agent."
echo "=================================="

# Ensure log directory exists
mkdir -p "\$(dirname "$logfile")"

# Run command and capture both output and exit code
set +e
eval "$cmd" 2>&1 | tee "$logfile"
local exit_code=\${PIPESTATUS[0]}
set -e

echo "==================================" | tee -a "$logfile"
echo "Command finished. Exit code: \$exit_code" | tee -a "$logfile"

if [[ \$exit_code -eq 0 ]]; then
    echo "✅ SUCCESS: Agent completed successfully!" | tee -a "$logfile"
else
    echo "❌ FAILED: Agent exited with code \$exit_code" | tee -a "$logfile"
fi

echo "You can now close this terminal window." | tee -a "$logfile"
echo "Press any key to close..."
read -n 1
EOF
  chmod +x "$script_file"

  # Open in new terminal window (macOS)
  osascript << EOF
tell application "Terminal"
    do script "exec '$script_file'"
    set custom title of front window to "$title"
end tell
EOF
}

run_agent_once() {
  local run_id="$1"   # 1..N
  local agent="$2"    # claude | copilot | gemini
  local prompt="$3"
  local outdir="$4"

  # Skip gracefully if agent CLI missing
  if [[ "$agent" == "claude" && $have_claude -eq 0 ]]; then
    echo "${TASK},${run_id},claude,SKIP,0" >> "$RESULTS_CSV"; return 0; fi
  if [[ "$agent" == "copilot" && $have_copilot -eq 0 ]]; then
    echo "${TASK},${run_id},copilot,SKIP,0" >> "$RESULTS_CSV"; return 0; fi
  if [[ "$agent" == "gemini" && $have_gemini -eq 0 ]]; then
    echo "${TASK},${run_id},gemini,SKIP,0" >> "$RESULTS_CSV"; return 0; fi

  rm -rf "$outdir" && mkdir -p "$outdir/.claude" "$outdir/.gemini"
  printf '%s\n' "$CLAUDE_SETTINGS" > "$outdir/.claude/settings.json"

  pushd "$outdir" >/dev/null

  local t0=$(timestamp)
  echo "==> [Run:$run_id][$agent][$TASK] generating in $outdir ..."

  # Create prompt file to avoid shell escaping issues
  printf '%s' "$prompt" > prompt.txt

  # Create log file for this run
  local logfile="$outdir/${agent}_generation.log"

  set +e
  case "$agent" in
    claude)
      local cmd="cd '$outdir' && timeout ${TIMEOUT_SEC}s ${CLAUDE_CMD} -p \"\$(cat prompt.txt)\""
      run_in_terminal "Claude - Run $run_id - $TASK" "$cmd" "$logfile"
      ;;
    copilot)
      local cmd="cd '$outdir' && timeout ${TIMEOUT_SEC}s bash -c 'cat prompt.txt | ${COPILOT_CMD}'"
      run_in_terminal "Copilot - Run $run_id - $TASK" "$cmd" "$logfile"
      ;;
    gemini)
      local cmd="cd '$outdir' && timeout ${TIMEOUT_SEC}s ${GEMINI_CMD} --prompt \"\$(cat prompt.txt)\""
      run_in_terminal "Gemini - Run $run_id - $TASK" "$cmd" "$logfile"
      ;;
  esac

  # Wait for the agent to finish by monitoring the log file
  echo "Waiting for $agent to complete (watching $logfile)..."
  echo "You can monitor progress in the '$agent - Run $run_id - $TASK' terminal window."

  local wait_count=0
  local max_wait=$((TIMEOUT_SEC + 120))  # Add 2 minute buffer
  local gen_ec=1  # Default to failure

  while [[ $wait_count -lt $max_wait ]]; do
    if [[ -f "$logfile" ]]; then
      if grep -q "Command finished" "$logfile" 2>/dev/null; then
        if grep -q "Exit code: 0" "$logfile" 2>/dev/null; then
          gen_ec=0
        else
          gen_ec=1
        fi
        break
      fi
    fi
    sleep 10
    ((wait_count += 10))

    # Show progress every minute
    if (( wait_count % 60 == 0 )); then
      echo "Still waiting for $agent... (${wait_count}s elapsed)"
    fi
  done

  if [[ $wait_count -ge $max_wait ]]; then
    echo "Timeout waiting for $agent to complete after ${max_wait}s"
    gen_ec=124  # timeout exit code
  fi

  set -e

  [[ -d "$PROJECT_ROOT_NAME" ]] && cd "$PROJECT_ROOT_NAME"
  [[ -f accept.sh ]] && chmod +x accept.sh

  echo "==> [Run:$run_id][$agent][$TASK] running acceptance ..."
  local acc_ec=1
  set +e
  if [[ -x ./accept.sh ]]; then
    timeout "${TIMEOUT_SEC}s" ./accept.sh
    acc_ec=$?
  else
    if [[ "$TASK" == "dodgefall" ]]; then
      timeout "${TIMEOUT_SEC}s" bash -lc "python3 -m venv venv && source venv/bin/activate && python -m pip install -r requirements.txt && python -m pytest -q && HEADLESS=1 python -m game.main"
      acc_ec=$?
    else
      timeout "${TIMEOUT_SEC}s" bash -lc "$NPM_BIN ci && $NPM_BIN test && node smoke.js"
      acc_ec=$?
    fi
  fi
  set -e

  local t1=$(timestamp)
  local dt=$((t1 - t0))

  # Success = both generation and acceptance passed
  local success="N"
  if [[ $gen_ec -eq 0 && $acc_ec -eq 0 ]]; then success="Y"; fi

  echo "${TASK},${run_id},${agent},${success},$((dt/60)).$(((dt%60)))" >> "$RESULTS_CSV"
  echo "==> [Run:$run_id][$agent][$TASK] SUCCESS=${success} TIME=${dt}s (gen_ec=${gen_ec}, acc_ec=${acc_ec})"

  popd >/dev/null
}

run_agent() {
  local agent="$1"
  local prompt="$2"
  local base="$3"
  for r in $(seq 1 "$RUNS"); do
    local outdir="${base}-run${r}"
    run_agent_once "$r" "$agent" "$prompt" "$outdir"
  done
}

# Function to run agent in background for parallel execution
run_agent_background() {
  local agent="$1"
  local prompt="$2"
  local base="$3"
  echo "Starting $agent in separate terminal..."
  run_agent "$agent" "$prompt" "$base" &
  return $!
}

# =========================
# Run
# =========================
echo "Task,RunId,Agent,Success(Y/N),Time(min)" > "$RESULTS_CSV"

CLAUDE_BASE="$BASE_DIR/${TASK}-claude"
COPILOT_BASE="$BASE_DIR/${TASK}-copilot"
GEMINI_BASE="$BASE_DIR/${TASK}-gemini"

echo "Opening terminals for agent execution..."
echo "Each agent will run in a separate terminal window where you can see the progress."
echo ""

if [[ "$MODE" == "parallel" ]]; then
  echo "Running agents in parallel mode - all terminals will open simultaneously..."

  # Start all agents in parallel, each in their own terminal
  pids=()

  if [[ $have_claude -eq 1 ]]; then
    run_agent_background claude  "$PROMPT" "$CLAUDE_BASE"
    pids+=($!)
    echo "Claude started in terminal (PID: $!)"
  fi

  if [[ $have_copilot -eq 1 ]]; then
    run_agent_background copilot "$PROMPT" "$COPILOT_BASE"
    pids+=($!)
    echo "Copilot started in terminal (PID: $!)"
  fi

  if [[ $have_gemini -eq 1 ]]; then
    run_agent_background gemini  "$PROMPT" "$GEMINI_BASE"
    pids+=($!)
    echo "Gemini started in terminal (PID: $!)"
  fi

  echo ""
  echo "Waiting for all agents to complete..."
  echo "You can watch the progress in the individual terminal windows."

  # Wait for all background processes
  for pid in "${pids[@]}"; do
    wait "$pid" || true
  done
else
  echo "Running agents in serial mode - terminals will open one by one..."

  if [[ $have_claude -eq 1 ]]; then
    echo "Running Claude..."
    run_agent claude  "$PROMPT" "$CLAUDE_BASE"
  fi

  if [[ $have_copilot -eq 1 ]]; then
    echo "Running Copilot..."
    run_agent copilot "$PROMPT" "$COPILOT_BASE"
  fi

  if [[ $have_gemini -eq 1 ]]; then
    echo "Running Gemini..."
    run_agent gemini  "$PROMPT" "$GEMINI_BASE"
  fi
fi

echo ""
echo "All agents have completed. Check the terminal windows for detailed output."

# =========================
# Report (HTML)
# =========================
REPORT_PY="$BASE_DIR/_build_report.py"
REPORT_HTML="$BASE_DIR/report.html"

cat > "$REPORT_PY" <<'PY'
import csv, statistics, os
from collections import defaultdict

base_dir = os.path.dirname(__file__)
csv_path = os.path.join(base_dir, "results.csv")
html_path = os.path.join(base_dir, "report.html")

rows = []
with open(csv_path, newline='') as f:
    r = csv.DictReader(f)
    for row in r:
        row["RunId"] = int(row["RunId"]) if row["RunId"].isdigit() else 0
        s = row["Success(Y/N)"].strip().upper()
        row["Skip"] = (s == "SKIP")
        row["Success"] = (s == "Y")
        try:
            row["TimeMin"] = float(row["Time(min)"])
        except:
            row["TimeMin"] = None
        rows.append(row)

agents = sorted(set(r["Agent"] for r in rows))
by_agent = defaultdict(list)
for row in rows:
    by_agent[row["Agent"]].append(row)

summary = []
for a in agents:
    data = [d for d in by_agent[a] if not d["Skip"]]
    total = len(data)
    succ = sum(1 for d in data if d["Success"])
    sr = (succ / total * 100.0) if total else 0.0
    times = [d["TimeMin"] for d in data if d["TimeMin"] is not None]
    med = statistics.median(times) if times else None
    summary.append({"agent": a, "pass": succ, "total": total, "success_rate": sr, "median_time": med})

def bar_chart_svg(values, labels, width=560, height=200, unit=""):
    if not values: return "<svg/>"
    maxv = max(values) or 1
    bar_h = max(12, int(height / (len(values)*1.5)))
    gap = bar_h // 2
    svg = [f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}">']
    y = gap
    for v, lab in zip(values, labels):
        w = int((v / maxv) * (width - 160))
        svg.append(f'<text x="6" y="{y+bar_h-4}" font-size="12" font-family="system-ui">{lab}</text>')
        svg.append(f'<rect x="120" y="{y}" width="{w}" height="{bar_h}" fill="#4F46E5" rx="4"></rect>')
        svg.append(f'<text x="{120+w+6}" y="{y+bar_h-4}" font-size="12" font-family="system-ui">{v:.1f}{unit}</text>')
        y += bar_h + gap
    svg.append('</svg>')
    return "\n".join(svg)

succ_values = [s["success_rate"] for s in summary]
time_values = [s["median_time"] or 0.0 for s in summary]
labels = [s["agent"] for s in summary]

succ_svg = bar_chart_svg(succ_values, labels, unit="%")
time_svg = bar_chart_svg(time_values, labels, unit="m")

def esc(x): return (str(x).replace("&","&amp;").replace("<","&lt;").replace(">","&gt;"))

table_rows = "\n".join(
    f"<tr><td>{esc(s['agent'])}</td>"
    f"<td>{s['pass']}/{s['total']}</td>"
    f"<td>{s['success_rate']:.1f}%</td>"
    f"<td>{'—' if s['median_time'] is None else f'{s['median_time']:.2f} m'}</td></tr>"
    for s in summary
)

run_rows = "\n".join(
    f"<tr><td>{esc(r['RunId'])}</td><td>{esc(r['Agent'])}</td>"
    f"<td>{'SKIP' if r['Skip'] else ('Y' if r['Success'] else 'N')}</td>"
    f"<td>{'—' if r['TimeMin'] is None else f'{r['TimeMin']:.2f}'}</td></tr>"
    for r in sorted(rows, key=lambda x: (x['RunId'], x['Agent']))
)

html = f"""<!doctype html>
<meta charset="utf-8">
<title>CLI Coding Agents — Evaluation Report</title>
<style>
  :root {{ --fg:#0f172a; --muted:#64748b; --card:#f8fafc; --accent:#4F46E5; }}
  body {{ font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color:var(--fg); margin:24px; }}
  h1 {{ margin: 0 0 4px 0; }}
  .muted {{ color: var(--muted); }}
  .grid {{ display:grid; grid-template-columns: 1fr 1fr; gap: 24px; }}
  .card {{ background:var(--card); padding:16px; border-radius:12px; box-shadow:0 1px 2px rgba(0,0,0,.06); }}
  table {{ width:100%; border-collapse: collapse; }}
  th, td {{ padding:8px 10px; border-bottom:1px solid #e5e7eb; text-align:left; }}
  th {{ font-weight:600; }}
  .mono {{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }}
</style>

<h1>CLI Coding Agents — Evaluation Report</h1>
<p class="muted">Task: <b class="mono">{esc(os.environ.get('TASK','')) or 'n/a'}</b> • Runs per agent: <b>{len(set(r['RunId'] for r in rows))}</b></p>

<div class="grid">
  <div class="card">
    <h2>Success Rate</h2>
    {succ_svg}
  </div>
  <div class="card">
    <h2>Median Time (minutes)</h2>
    {time_svg}
  </div>
</div>

<div class="card" style="margin-top:24px">
  <h2>Per-agent Summary</h2>
  <table>
    <thead><tr><th>Agent</th><th>Pass</th><th>Success Rate</th><th>Median Time</th></tr></thead>
    <tbody>
      {table_rows}
    </tbody>
  </table>
</div>

<div class="card" style="margin-top:24px">
  <h2>All Runs</h2>
  <table class="mono">
    <thead><tr><th>RunId</th><th>Agent</th><th>Success</th><th>Time (min)</th></tr></thead>
    <tbody>
      {run_rows}
    </tbody>
  </table>
</div>
"""
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html)
print("Wrote", html_path)
PY

export TASK
"$PYTHON_BIN" "$REPORT_PY"

echo
echo "==== RESULTS CSV ===="
cat "$RESULTS_CSV"
echo
echo "Report: $REPORT_HTML"
echo "Workspaces under: $BASE_DIR"

