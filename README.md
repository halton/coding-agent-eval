# AI CLI Agent Evaluation Framework

A comprehensive evaluation framework for comparing AI coding agents (Claude CLI, GitHub Copilot CLI, and Gemini CLI) on coding tasks. This tool automatically runs prompts against multiple AI agents, executes acceptance tests, and generates detailed performance reports.

## Features

- 🤖 **Multi-Agent Support**: Test Claude, GitHub Copilot, and Gemini CLI agents
- 📊 **Automated Evaluation**: Run coding tasks with automatic acceptance testing
- 🔄 **Flexible Execution**: Parallel or serial execution modes
- 📈 **Rich Reporting**: HTML reports with success rates, timing, and visualizations
- 🎯 **Dynamic Task Loading**: Automatically discovers tasks from prompt files
- 📅 **Date-based Results**: Organized output directories by date
- 🛡️ **Permission Control**: Configurable agent permissions and safety restrictions

## Quick Start

### Prerequisites

Install the required AI CLI tools:

```bash
# Claude CLI (Anthropic)
# Follow installation instructions from Anthropic

# GitHub Copilot CLI
npm install -g @githubnext/github-copilot-cli

# Gemini CLI (Google)
# Follow installation instructions from Google AI
```

### Basic Usage

```bash
# Run all available agents on default task
./coding-agent-eval.sh

# Run specific agent
./coding-agent-eval.sh --agent claude

# Run specific task in serial mode
./coding-agent-eval.sh --task calculator --mode serial

# Run multiple iterations
./coding-agent-eval.sh --agent copilot --runs 3
```

## Configuration

### Command Line Options

```
Usage: ./coding-agent-eval.sh [OPTIONS]

Options:
  --task TASK        Task to run (default: first available)
                     Available tasks: calculator dodgefall neon
  --agent AGENT      Run only specified agent: claude, copilot, or gemini
  --mode MODE        Execution mode: parallel or serial (default: parallel)
  --runs N           Number of runs per agent (default: 1)
  --base-dir DIR     Base directory for output (default: ./eval_results_YYMMDD)
  --timeout SEC      Timeout per agent in seconds (default: 2400)
  --help, -h         Show this help message

Examples:
  ./coding-agent-eval.sh                           # Run all agents in parallel
  ./coding-agent-eval.sh --agent claude            # Run only Claude
  ./coding-agent-eval.sh --task dodgefall --mode serial  # Serial execution
  ./coding-agent-eval.sh --agent gemini --runs 3   # Multiple runs
```

### Adding New Tasks

1. Create a new prompt file in the `prompts/` directory:
   ```bash
   echo "Your prompt here" > prompts/mytask.txt
   ```

2. The task will be automatically discovered and available via:
   ```bash
   ./coding-agent-eval.sh --task mytask
   ```

### Agent Configuration

The script automatically configures each agent with appropriate permissions:

- **Claude**: Configured with specific allow/deny permissions for safe execution
- **Copilot**: Restricted dangerous operations while allowing development tools
- **Gemini**: Runs in "yolo" mode with standard restrictions

## Project Structure

```
├── coding-agent-eval.sh    # Main evaluation script
├── prompts/                # Task prompt files
│   ├── calculator.txt      # Web calculator task
│   ├── dodgefall.txt      # Pygame arcade game task
│   └── neon.txt           # HTML5 Canvas game task
├── eval_results_YYMMDD/   # Results directory (auto-created)
│   ├── results.csv        # Raw evaluation data
│   ├── report.html        # Visual report
│   └── [task-agent-run]/  # Individual execution directories
└── README.md              # This file
```

## Output and Reporting

### Results Directory

Each run creates a timestamped directory (e.g., `eval_results_250929`) containing:

- **results.csv**: Raw performance data
- **report.html**: Interactive HTML report with charts
- **Individual run folders**: Complete logs and generated code for each agent

### HTML Report Features

- Success rate comparison charts
- Median execution time analysis  
- Per-agent performance summary
- Detailed run-by-run results
- Interactive visualizations

### CSV Data Format

```csv
Task,RunId,Agent,Success(Y/N),Time(min)
calculator,1,claude,Y,2.5
calculator,1,copilot,N,1.8
calculator,1,gemini,Y,3.2
```

## Acceptance Testing

The framework includes intelligent acceptance testing:

1. **Custom Scripts**: Uses `accept.sh` if present in generated code
2. **Python Projects**: Automatically detects and runs pytest + project validation
3. **Node.js Projects**: Runs `npm ci`, `npm test`, and smoke tests
4. **Static Web**: Basic HTML/JS validation
5. **Fallback**: General project structure validation

## Execution Modes

### Parallel Mode (Default)
- All agents run simultaneously in separate terminal windows
- Faster overall execution
- Real-time progress monitoring in individual terminals

### Serial Mode
- Agents run one after another
- Sequential execution for resource-constrained environments
- Easier to follow individual agent progress

## Safety and Permissions

### Built-in Safety Features
- Restricted shell commands (no `rm`, `curl | sh`, etc.)
- Limited file system access
- Timeout protection (40 minutes default)
- Sandboxed execution environments

### Permission Configuration
Agents are configured with specific tool restrictions:
- **Allowed**: File editing, Python/Node execution, mkdir, package installation
- **Denied**: File deletion, remote code execution, git push operations

## Troubleshooting

### Common Issues

1. **Agent CLI not found**
   ```bash
   Error: claude CLI not found
   ```
   Install the missing CLI tool and ensure it's in your PATH.

2. **Permission denied**
   ```bash
   chmod +x coding-agent-eval.sh
   ```

3. **Timeout issues**
   ```bash
   ./coding-agent-eval.sh --timeout 3600  # Increase to 1 hour
   ```

4. **No prompts found**
   ```bash
   Error: No .txt files found in ./prompts
   ```
   Ensure prompt files exist in the `prompts/` directory.

### Debug Mode

For detailed debugging, check individual agent logs in the results directory:
- `[agent]_generation.log` - Agent execution logs
- Terminal windows show real-time progress
- HTML report includes failure analysis

## Contributing

### Adding New Agents

1. Add CLI detection in the prechecks section
2. Configure agent command and permissions
3. Add execution case in `run_agent_once` function
4. Update help text and documentation

### Adding New Task Types

1. Create prompt file in `prompts/` directory
2. Add any special project structure detection in acceptance testing
3. Update PROJECT_ROOT_NAME mapping if needed

## License

This project is open source. See individual AI CLI tools for their respective licenses.

## Support

- Check terminal output for real-time progress
- Review HTML reports for detailed analysis
- Examine individual run logs for debugging
- Ensure all AI CLI tools are properly authenticated

---

**Note**: This tool requires active API access for Claude, GitHub Copilot, and Gemini services. Ensure proper authentication and API limits before running evaluations.