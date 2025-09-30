#!/usr/bin/env bash
set -euo pipefail

# =========================
# Flags / defaults
# =========================
TASK=""                 # will be set to first available task if not specified
MODE="parallel"         # or serial
RUNS=1
AGENT=""                # if specified, run only this agent (claude, copilot, gemini)
BASE_DIR="${BASE_DIR:-$(dirname "$0")/eval_results_$(date +%y%m%d)}"
PYTHON_BIN="${PYTHON_BIN:-python3}"
NPM_BIN="${NPM_BIN:-npm}"
TIMEOUT_SEC="${TIMEOUT_SEC:-2400}"   # 40m per agent
RESULTS_CSV="$BASE_DIR/results.csv"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --task) TASK="$2"; shift 2;;
    --mode) MODE="$2"; shift 2;;
    --agent) AGENT="$2"; shift 2;;
    --base-dir) BASE_DIR="$2"; shift 2;;
    --timeout) TIMEOUT_SEC="$2"; shift 2;;
    --runs) RUNS="$2"; shift 2;;
    --help|-h)
      # Discover available tasks dynamically for help
      help_tasks=($(ls -1 "$(dirname "$0")/prompts"/*.txt 2>/dev/null | sed 's|.*/||; s|\.txt$||' | sort))
      default_task="${help_tasks[0]:-none}"
      tasks_list="${help_tasks[*]:-none found}"

      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  --task TASK        Specific task to run (default: ALL tasks)"
      echo "                     Available tasks: $tasks_list"
      echo "  --agent AGENT      Run only specified agent: claude, copilot, or gemini"
      echo "  --mode MODE        Execution mode: parallel or serial (default: parallel)"
      echo "  --runs N           Number of runs per agent (default: 1)"
      echo "  --base-dir DIR     Base directory for output (default: ./eval_results_YYMMDD)"
      echo "  --timeout SEC      Timeout per agent in seconds (default: 2400)"
      echo "  --help, -h         Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0                           # Run all agents on ALL tasks in parallel"
      echo "  $0 --task calculator         # Run all agents on calculator task only"
      echo "  $0 --agent claude            # Run only Claude on ALL tasks"
      echo "  $0 --task ${help_tasks[1]:-task} --mode serial  # Run specific task in serial mode"
      echo "  $0 --agent gemini --runs 3   # Run Gemini 3 times on ALL tasks"
      exit 0;;
    *) echo "Unknown arg: $1. Use --help for usage information."; exit 1;;
  esac
done

# =========================
# Directory Management with Backup
# =========================
# If BASE_DIR exists, create a backup with timestamp
if [[ -d "$BASE_DIR" ]]; then
  BACKUP_DIR="${BASE_DIR}_backup_$(date +%H%M%S)"
  echo "Directory $BASE_DIR exists, backing up to $BACKUP_DIR"
  mv "$BASE_DIR" "$BACKUP_DIR"
fi

# Create fresh BASE_DIR
mkdir -p "$BASE_DIR"

# Ensure .gitignore exists and includes eval_results_* pattern
GITIGNORE_FILE="$(dirname "$0")/.gitignore"
if [[ ! -f "$GITIGNORE_FILE" ]]; then
  echo "Creating .gitignore file..."
  cat > "$GITIGNORE_FILE" << 'GITIGNORE'
# Evaluation results directories
eval_results_*

# Temporary files
/tmp/
*.tmp
*.log

# IDE/Editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db
GITIGNORE
else
  # Check if eval_results_* pattern is already in .gitignore
  if ! grep -q "eval_results_" "$GITIGNORE_FILE" 2>/dev/null; then
    echo "Adding eval_results_* pattern to existing .gitignore"
    echo "" >> "$GITIGNORE_FILE"
    echo "# Evaluation results directories" >> "$GITIGNORE_FILE"
    echo "eval_results_*" >> "$GITIGNORE_FILE"
  fi
fi

# Clean up old backup directories (keep only last 5 backups)
cleanup_old_backups() {
  local base_pattern="$(basename "$BASE_DIR")_backup_"
  local backup_dir="$(dirname "$BASE_DIR")"
  local backup_count=$(find "$backup_dir" -maxdepth 1 -name "${base_pattern}*" -type d 2>/dev/null | wc -l)

  if [[ $backup_count -gt 5 ]]; then
    echo "Cleaning up old backups (keeping newest 5)..."
    # List backups sorted by modification time, remove oldest ones
    find "$backup_dir" -maxdepth 1 -name "${base_pattern}*" -type d -print0 2>/dev/null | \
      xargs -0 ls -dt | tail -n +6 | xargs rm -rf 2>/dev/null || true
  fi
}

cleanup_old_backups

# Validate --mode parameter
case "$MODE" in
  parallel|serial) ;;
  *) echo "Error: --mode must be either 'parallel' or 'serial'"; exit 1;;
esac

# =========================
# Prechecks (soft)
# =========================
command -v timeout >/dev/null || { echo "Need 'timeout' (GNU coreutils)."; exit 1; }

have_claude=0;  command -v claude  >/dev/null && have_claude=1
have_copilot=0; command -v copilot >/dev/null && have_copilot=1
have_gemini=0;  command -v gemini  >/dev/null && have_gemini=1

# Validate --agent parameter if specified
if [[ -n "$AGENT" ]]; then
  case "$AGENT" in
    claude|copilot|gemini) ;;
    *) echo "Error: --agent must be one of: claude, copilot, gemini"; exit 1;;
  esac

  # Check if the specified agent is available
  case "$AGENT" in
    claude)  if [[ $have_claude -eq 0 ]]; then echo "Error: claude CLI not found"; exit 1; fi;;
    copilot) if [[ $have_copilot -eq 0 ]]; then echo "Error: copilot CLI not found"; exit 1; fi;;
    gemini)  if [[ $have_gemini -eq 0 ]]; then echo "Error: gemini CLI not found"; exit 1; fi;;
  esac

  echo "Running single agent: $AGENT"
else
  if (( have_claude + have_copilot + have_gemini == 0 )); then
    echo "No agent CLIs found ('claude', 'copilot', 'gemini'). Install at least one and re-run."
    exit 1
  fi
fi

# =========================
# Agent commands (interactive mode for visibility)
# =========================
# Claude Code: print mode skips trust dialog, bypass permissions for automated execution; no API key check here—if not authed, the run will fail and be logged.
CLAUDE_CMD=${CLAUDE_CMD:-'claude -p --max-turns 50 --dangerously-skip-permissions --verbose'}

# Copilot CLI: interactive mode; restrict dangerous tools but allow prompts.
COPILOT_FLAGS=${COPILOT_FLAGS:-"--allow-all-tools --allow-tool write --allow-tool shell --allow-tool 'shell(mkdir)' --deny-tool 'shell(rm)' --deny-tool 'shell(git_push)'"}
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
      "Bash(node *)","Bash(npm *)","Bash(npx http-server *)",
      "Bash(mkdir *)"
    ],
    "deny": ["Bash(rm *)","Bash(curl *| sh *)","Bash(git push *)"]
  }
}'

# =========================
# Prompts (load dynamically from files)
# =========================
SCRIPT_DIR="$(dirname "$0")"
PROMPTS_DIR="$SCRIPT_DIR/prompts"

# Check if prompts directory exists
if [[ ! -d "$PROMPTS_DIR" ]]; then
  echo "Error: Prompts directory $PROMPTS_DIR not found"
  exit 1
fi

# Auto-detect available tasks and set default if TASK is empty
AVAILABLE_TASKS=($(ls -1 "$PROMPTS_DIR"/*.txt 2>/dev/null | sed 's|.*/||; s|\.txt$||' | sort))

if [[ ${#AVAILABLE_TASKS[@]} -eq 0 ]]; then
  echo "Error: No .txt files found in $PROMPTS_DIR"
  exit 1
fi

# Determine which tasks to run
TASKS_TO_RUN=()
if [[ -z "$TASK" ]]; then
  # No specific task specified, run all available tasks
  TASKS_TO_RUN=("${AVAILABLE_TASKS[@]}")
  echo "No task specified, running ALL available tasks: ${AVAILABLE_TASKS[*]}"
else
  # Validate the specified task exists
  if [[ ! " ${AVAILABLE_TASKS[*]} " =~ " ${TASK} " ]]; then
    echo "Error: Task '$TASK' not found"
    echo "Available tasks: ${AVAILABLE_TASKS[*]}"
    exit 1
  fi
  TASKS_TO_RUN=("$TASK")
  echo "Running specific task: $TASK"
fi

echo "Tasks to execute: ${TASKS_TO_RUN[*]}"

# =========================
# Helpers
# =========================
timestamp() { date +%s; }

# Safe function to append to CSV results file with simple locking
append_to_csv() {
  local line="$1"
  local lockfile="${RESULTS_CSV}.lock"
  local max_wait=30
  local wait_count=0

  # Ensure the directory exists
  mkdir -p "$(dirname "$RESULTS_CSV")"

  # Simple file-based locking for cross-platform compatibility
  while [[ -f "$lockfile" && $wait_count -lt $max_wait ]]; do
    sleep 0.1
    ((wait_count++))
  done

  # Create lock file
  echo $$ > "$lockfile" 2>/dev/null || return 1

  # If CSV doesn't exist, create it with headers
  if [[ ! -f "$RESULTS_CSV" ]]; then
    echo "Task,RunId,Agent,Success(Y/N),Time(min)" > "$RESULTS_CSV"
  fi

  # Append the line
  echo "$line" >> "$RESULTS_CSV"

  # Release lock
  rm -f "$lockfile" 2>/dev/null || true
}

# Function to run command in a new terminal window or background process
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
EOF
  chmod +x "$script_file"

  # Try to open in new terminal window (macOS), fallback to background process
  if command -v osascript >/dev/null 2>&1; then
    set +e
    osascript << EOF 2>/dev/null
tell application "Terminal"
    do script "exec '$script_file'"
    set custom title of front window to "$title"
end tell
EOF
    local osa_exit=$?
    set -e

    # If osascript failed, fall back to background execution
    if [[ $osa_exit -ne 0 ]]; then
      echo "Warning: Failed to open new terminal window, running $title in background..."
      nohup "$script_file" > /dev/null 2>&1 &
    fi
  else
    # No osascript available, run in background
    echo "Running $title in background (no terminal window support)..."
    nohup "$script_file" > /dev/null 2>&1 &
  fi
}

run_agent_once() {
  local run_id="$1"   # 1..N
  local agent="$2"    # claude | copilot | gemini
  local prompt="$3"
  local outdir="$4"

  # Skip gracefully if agent CLI missing
  if [[ "$agent" == "claude" && $have_claude -eq 0 ]]; then
    append_to_csv "${TASK},${run_id},claude,SKIP,0"; return 0; fi
  if [[ "$agent" == "copilot" && $have_copilot -eq 0 ]]; then
    append_to_csv "${TASK},${run_id},copilot,SKIP,0"; return 0; fi
  if [[ "$agent" == "gemini" && $have_gemini -eq 0 ]]; then
    append_to_csv "${TASK},${run_id},gemini,SKIP,0"; return 0; fi

  rm -rf "$outdir" && mkdir -p "$outdir/.claude" "$outdir/.gemini"
  printf '%s\n' "$CLAUDE_SETTINGS" > "$outdir/.claude/settings.json"

  # Create local settings to trust the directory automatically
  cat > "$outdir/.claude/settings.local.json" << 'CLAUDE_LOCAL'
{
  "trusted_folders": ["."],
  "trust_all": true,
  "permissions": {
    "allow": [
      "Edit(*)",
      "Write(*)",
      "Bash(python *)",
      "Bash(pip *)",
      "Bash(pytest *)",
      "Bash(node *)",
      "Bash(npm *)",
      "Bash(npx http-server *)",
      "Bash(mkdir *)"
    ],
    "deny": [
      "Bash(rm *)",
      "Bash(curl *| sh *)",
      "Bash(git push *)"
    ]
  }
}
CLAUDE_LOCAL

  pushd "$outdir" >/dev/null

  local t0=$(timestamp)
  echo "==> [Run:$run_id][$agent][$TASK] generating in $outdir ..."

  # Create prompt file to avoid shell escaping issues
  printf '%s' "$prompt" > prompt.txt

  # Create log file for this run (use absolute path to avoid nesting issues)
  local logfile="$(pwd)/${agent}_generation.log"

  # Ensure log directory exists
  mkdir -p "$(dirname "$logfile")"

  set +e
  # Always run agents directly (no separate terminal windows)
  echo "Running $agent directly..."
  case "$agent" in
    claude)
      echo "Starting Claude with logging..." | tee "$logfile"
      echo "Command: ${CLAUDE_CMD}" | tee -a "$logfile"
      echo "Working directory: $(pwd)" | tee -a "$logfile"
      echo "================================" | tee -a "$logfile"
      timeout "${TIMEOUT_SEC}s" ${CLAUDE_CMD} "$(cat prompt.txt)" 2>&1 | tee -a "$logfile"
      local gen_ec=${PIPESTATUS[0]}
      echo "================================" | tee -a "$logfile"
      echo "Claude finished with exit code: $gen_ec" | tee -a "$logfile"
      ;;
    copilot)
      echo "Starting Copilot with logging..." | tee "$logfile"
      echo "Command: ${COPILOT_CMD}" | tee -a "$logfile"
      echo "Working directory: $(pwd)" | tee -a "$logfile"
      echo "================================" | tee -a "$logfile"
      timeout "${TIMEOUT_SEC}s" bash -c "cat prompt.txt | ${COPILOT_CMD}" 2>&1 | tee -a "$logfile"
      local gen_ec=${PIPESTATUS[0]}
      echo "================================" | tee -a "$logfile"
      echo "Copilot finished with exit code: $gen_ec" | tee -a "$logfile"
      ;;
    gemini)
      echo "Starting Gemini with logging..." | tee "$logfile"
      echo "Command: ${GEMINI_CMD}" | tee -a "$logfile"
      echo "Working directory: $(pwd)" | tee -a "$logfile"
      echo "================================" | tee -a "$logfile"
      timeout "${TIMEOUT_SEC}s" ${GEMINI_CMD} --prompt "$(cat prompt.txt)" 2>&1 | tee -a "$logfile"
      local gen_ec=${PIPESTATUS[0]}
      echo "================================" | tee -a "$logfile"
      echo "Gemini finished with exit code: $gen_ec" | tee -a "$logfile"
      ;;
  esac

  # Agent execution completed, gen_ec is already set
  echo "Agent $agent completed with exit code: $gen_ec"

  set -e

  [[ -d "$PROJECT_ROOT_NAME" ]] && cd "$PROJECT_ROOT_NAME"
  [[ -f accept.sh ]] && chmod +x accept.sh

  echo "==> [Run:$run_id][$agent][$TASK] running acceptance ..."
  local acc_ec=1
  set +e
  if [[ -x ./accept.sh ]]; then
    # Custom acceptance script takes precedence
    timeout "${TIMEOUT_SEC}s" ./accept.sh
    acc_ec=$?
  else
    # Dynamic acceptance testing based on project structure
    if [[ -f "requirements.txt" && -f "game/__init__.py" ]]; then
      # Python project with game module
      timeout "${TIMEOUT_SEC}s" bash -lc "python3 -m venv venv && source venv/bin/activate && python -m pip install -r requirements.txt && python -m pytest -q && HEADLESS=1 python -m game.main"
      acc_ec=$?
    elif [[ -f "package.json" ]]; then
      # Node.js/npm project
      timeout "${TIMEOUT_SEC}s" bash -lc "$NPM_BIN ci && $NPM_BIN test && node smoke.js"
      acc_ec=$?
    elif [[ -f "requirements.txt" ]]; then
      # Generic Python project
      timeout "${TIMEOUT_SEC}s" bash -lc "python3 -m venv venv && source venv/bin/activate && python -m pip install -r requirements.txt && python -m pytest -q"
      acc_ec=$?
    elif [[ -f "index.html" && -f "*.js" ]]; then
      # Static web project - basic validation
      timeout "${TIMEOUT_SEC}s" bash -lc "echo 'Static web project detected - basic validation only' && [[ -f index.html ]]"
      acc_ec=$?
    else
      # Fallback - just check if basic files exist
      echo "No recognized project structure - performing basic validation"
      timeout "${TIMEOUT_SEC}s" bash -lc "ls -la && echo 'Project structure validation passed'"
      acc_ec=$?
    fi
  fi
  set -e

  local t1=$(timestamp)
  local dt=$((t1 - t0))

  # Success = both generation and acceptance passed
  local success="N"
  if [[ $gen_ec -eq 0 && $acc_ec -eq 0 ]]; then success="Y"; fi

  append_to_csv "${TASK},${run_id},${agent},${success},$((dt/60)).$(((dt%60)))"
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

# Function to run all agents for a single task
run_single_task() {
  local task_name="$1"

  echo ""
  echo "=========================================="
  echo "🚀 Starting evaluation for task: $task_name"
  echo "=========================================="

  # Load prompt for current task
  local prompt_file="$PROMPTS_DIR/${task_name}.txt"
  local prompt="$(cat "$prompt_file")"
  echo "Loaded prompt from: $prompt_file"

  # Set project root name for this task
  PROJECT_ROOT_NAME="$task_name"

  # Set up task-specific directories
  local claude_base="$BASE_DIR/${task_name}-claude"
  local copilot_base="$BASE_DIR/${task_name}-copilot"
  local gemini_base="$BASE_DIR/${task_name}-gemini"

  if [[ -n "$AGENT" ]]; then
    echo "Running single agent: $AGENT for task: $task_name"
    case "$AGENT" in
      claude)  run_agent claude  "$prompt" "$claude_base";;
      copilot) run_agent copilot "$prompt" "$copilot_base";;
      gemini)  run_agent gemini  "$prompt" "$gemini_base";;
    esac
  elif [[ "$MODE" == "parallel" ]]; then
    echo "Running agents in parallel mode for task: $task_name..."

    # Start all agents in parallel in background processes
    local pids=()

    if [[ $have_claude -eq 1 ]]; then
      echo "Starting Claude in background for task: $task_name..."
      run_agent claude "$prompt" "$claude_base" &
      local pid=$!
      pids+=($pid)
      echo "Claude started (PID: $pid)"
    fi

    if [[ $have_copilot -eq 1 ]]; then
      echo "Starting Copilot in background for task: $task_name..."
      run_agent copilot "$prompt" "$copilot_base" &
      local pid=$!
      pids+=($pid)
      echo "Copilot started (PID: $pid)"
    fi

    if [[ $have_gemini -eq 1 ]]; then
      echo "Starting Gemini in background for task: $task_name..."
      run_agent gemini "$prompt" "$gemini_base" &
      local pid=$!
      pids+=($pid)
      echo "Gemini started (PID: $pid)"
    fi

    echo "Waiting for all agents to complete for task: $task_name..."

    # Wait for all background processes
    for pid in "${pids[@]}"; do
      echo "Waiting for process $pid..."
      wait "$pid" || echo "Process $pid completed with error"
    done
  else
    echo "Running agents in serial mode for task: $task_name..."

    if [[ $have_claude -eq 1 ]]; then
      echo "Running Claude for task: $task_name..."
      run_agent claude  "$prompt" "$claude_base"
    fi

    if [[ $have_copilot -eq 1 ]]; then
      echo "Running Copilot for task: $task_name..."
      run_agent copilot "$prompt" "$copilot_base"
    fi

    if [[ $have_gemini -eq 1 ]]; then
      echo "Running Gemini for task: $task_name..."
      run_agent gemini  "$prompt" "$gemini_base"
    fi
  fi

  echo "✅ Completed evaluation for task: $task_name"
}



# =========================
# Run
# =========================
# Ensure the base directory exists and is writable
mkdir -p "$BASE_DIR"
if [[ ! -w "$BASE_DIR" ]]; then
  echo "Error: Cannot write to directory $BASE_DIR"
  exit 1
fi

echo "Task,RunId,Agent,Success(Y/N),Time(min)" > "$RESULTS_CSV"

if [[ -n "$AGENT" ]]; then
  echo "Running single agent: $AGENT"
else
  if [[ "$MODE" == "parallel" ]]; then
    echo "Running multiple agents in parallel..."
  else
    echo "Running multiple agents in serial..."
  fi
  echo "Each agent will run and log to files in $BASE_DIR."
fi

# Run evaluation for each task
for task in "${TASKS_TO_RUN[@]}"; do
  # Set TASK environment variable for report generation
  export TASK="$task"
  run_single_task "$task"
done

echo ""
echo "=========================================="
echo "🎉 All evaluations completed!"
echo "=========================================="
echo "Tasks evaluated: ${TASKS_TO_RUN[*]}"
if [[ ${#TASKS_TO_RUN[@]} -gt 1 ]]; then
  echo "Total tasks: ${#TASKS_TO_RUN[@]}"
fi

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

# Set TASK for report generation (use first task if multiple)
export TASK="${TASKS_TO_RUN[0]}"
if [[ ${#TASKS_TO_RUN[@]} -gt 1 ]]; then
  export TASK="Multiple Tasks (${TASKS_TO_RUN[*]})"
fi

"$PYTHON_BIN" "$REPORT_PY"

echo
echo "==== RESULTS CSV ===="
cat "$RESULTS_CSV"
echo
echo "📊 Report: $REPORT_HTML"
echo "📁 Workspaces under: $BASE_DIR"
if [[ ${#TASKS_TO_RUN[@]} -gt 1 ]]; then
  echo "📋 Tasks completed: ${TASKS_TO_RUN[*]}"
fi

