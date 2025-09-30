class Calculator {
    constructor() {
        this.displayElement = document.getElementById('display');
        this.historyElement = document.getElementById('displayHistory');
        this.historyPanel = document.getElementById('historyPanel');
        this.historyList = document.getElementById('historyList');
        this.memoryIndicator = document.getElementById('memoryIndicator');

        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.memory = 0;
        this.history = [];
        this.maxHistoryItems = 5;

        this.initializeEventListeners();
        this.loadHistory();
        this.updateDisplay();
    }

    initializeEventListeners() {
        // Number buttons
        document.querySelectorAll('.number-btn').forEach(button => {
            button.addEventListener('click', () => {
                const number = button.dataset.number;
                if (number !== undefined) {
                    this.appendNumber(number);
                }
            });
        });

        // Operator buttons
        document.querySelectorAll('.operator-btn').forEach(button => {
            button.addEventListener('click', () => {
                this.setOperation(button.dataset.operator);
                this.updateOperatorButtons(button);
            });
        });

        // Function buttons
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', () => {
                this.handleAction(button.dataset.action);
            });
        });

        // Clear history button
        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearHistory();
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    appendNumber(number) {
        if (this.shouldResetDisplay) {
            this.currentValue = '0';
            this.shouldResetDisplay = false;
        }

        if (this.currentValue === '0') {
            this.currentValue = number;
        } else {
            if (this.currentValue.length < 12) {
                this.currentValue += number;
            }
        }

        this.updateDisplay();
    }

    setOperation(op) {
        if (this.operation !== null && !this.shouldResetDisplay) {
            this.calculate();
        }

        this.operation = op;
        this.previousValue = this.currentValue;
        this.shouldResetDisplay = true;
        this.updateHistoryDisplay();
    }

    calculate() {
        if (this.operation === null || this.previousValue === '') return;

        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        let result;

        switch (this.operation) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.showError('Cannot divide by zero');
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }

        // Add to history
        const expression = `${this.previousValue} ${this.getOperatorSymbol(this.operation)} ${this.currentValue}`;
        this.addToHistory(expression, result);

        this.currentValue = this.formatResult(result);
        this.operation = null;
        this.previousValue = '';
        this.shouldResetDisplay = true;
        this.updateDisplay();
        this.updateHistoryDisplay();
        this.clearOperatorButtons();
    }

    formatResult(result) {
        if (isNaN(result) || !isFinite(result)) {
            return 'Error';
        }

        // Handle very large or very small numbers
        if (Math.abs(result) > 999999999999) {
            return result.toExponential(6);
        }

        // Round to avoid floating point issues
        const rounded = Math.round(result * 100000000) / 100000000;
        const str = rounded.toString();

        // Limit display length
        if (str.length > 12) {
            return parseFloat(rounded.toPrecision(10)).toString();
        }

        return str;
    }

    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'clearEntry':
                this.clearEntry();
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'equals':
                this.calculate();
                break;
            case 'decimal':
                this.appendDecimal();
                break;
            case 'negate':
                this.negate();
                break;
            case 'mc':
                this.memoryClear();
                break;
            case 'mr':
                this.memoryRecall();
                break;
            case 'm+':
                this.memoryAdd();
                break;
            case 'm-':
                this.memorySubtract();
                break;
        }
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.updateDisplay();
        this.updateHistoryDisplay();
        this.clearOperatorButtons();
    }

    clearEntry() {
        this.currentValue = '0';
        this.updateDisplay();
    }

    backspace() {
        if (this.shouldResetDisplay) return;

        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }

        this.updateDisplay();
    }

    appendDecimal() {
        if (this.shouldResetDisplay) {
            this.currentValue = '0';
            this.shouldResetDisplay = false;
        }

        if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
        }

        this.updateDisplay();
    }

    negate() {
        if (this.currentValue !== '0') {
            if (this.currentValue.startsWith('-')) {
                this.currentValue = this.currentValue.slice(1);
            } else {
                this.currentValue = '-' + this.currentValue;
            }
            this.updateDisplay();
        }
    }

    // Memory functions
    memoryClear() {
        this.memory = 0;
        this.updateMemoryIndicator();
    }

    memoryRecall() {
        this.currentValue = this.memory.toString();
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    memoryAdd() {
        this.memory += parseFloat(this.currentValue);
        this.updateMemoryIndicator();
        this.shouldResetDisplay = true;
    }

    memorySubtract() {
        this.memory -= parseFloat(this.currentValue);
        this.updateMemoryIndicator();
        this.shouldResetDisplay = true;
    }

    updateMemoryIndicator() {
        if (this.memory !== 0) {
            this.memoryIndicator.classList.add('active');
        } else {
            this.memoryIndicator.classList.remove('active');
        }
    }

    // History functions
    addToHistory(expression, result) {
        const item = {
            expression: expression,
            result: this.formatResult(result),
            timestamp: new Date().getTime()
        };

        this.history.unshift(item);

        if (this.history.length > this.maxHistoryItems) {
            this.history = this.history.slice(0, this.maxHistoryItems);
        }

        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        this.historyList.innerHTML = '';

        this.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">= ${item.result}</div>
            `;

            historyItem.addEventListener('click', () => {
                this.currentValue = item.result;
                this.shouldResetDisplay = true;
                this.updateDisplay();
            });

            this.historyList.appendChild(historyItem);
        });
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
    }

    saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    }

    loadHistory() {
        const saved = localStorage.getItem('calculatorHistory');
        if (saved) {
            try {
                this.history = JSON.parse(saved);
                this.renderHistory();
            } catch (e) {
                this.history = [];
            }
        }
    }

    toggleHistory() {
        this.historyPanel.classList.toggle('show');
    }

    // Display functions
    updateDisplay() {
        this.displayElement.textContent = this.currentValue;

        // Adjust font size based on content length
        if (this.currentValue.length > 10) {
            this.displayElement.classList.add('large');
        } else if (this.currentValue.length > 8) {
            this.displayElement.classList.add('medium');
        } else {
            this.displayElement.classList.remove('large', 'medium');
        }
    }

    updateHistoryDisplay() {
        if (this.operation && this.previousValue) {
            this.historyElement.textContent = `${this.previousValue} ${this.getOperatorSymbol(this.operation)}`;
        } else {
            this.historyElement.textContent = '';
        }
    }

    getOperatorSymbol(op) {
        const symbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷'
        };
        return symbols[op] || op;
    }

    updateOperatorButtons(activeButton) {
        document.querySelectorAll('.operator-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    clearOperatorButtons() {
        document.querySelectorAll('.operator-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    showError(message) {
        this.currentValue = 'Error';
        this.updateDisplay();
        setTimeout(() => {
            this.clear();
        }, 2000);
    }

    // Keyboard support
    handleKeyboard(e) {
        // Prevent default for keys we handle
        const handledKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                           '+', '-', '*', '/', '.', '=', 'Enter', 'Escape',
                           'Backspace', 'Delete', 'c', 'C', 'm', 'M', 'r', 'R', 'h', 'H'];

        if (handledKeys.includes(e.key)) {
            e.preventDefault();
        }

        // Numbers
        if (e.key >= '0' && e.key <= '9') {
            this.appendNumber(e.key);
        }

        // Operations
        else if (e.key === '+') {
            this.setOperation('+');
            this.updateOperatorButtons(document.querySelector('[data-operator="+"]'));
        } else if (e.key === '-') {
            this.setOperation('-');
            this.updateOperatorButtons(document.querySelector('[data-operator="-"]'));
        } else if (e.key === '*') {
            this.setOperation('*');
            this.updateOperatorButtons(document.querySelector('[data-operator="*"]'));
        } else if (e.key === '/') {
            this.setOperation('/');
            this.updateOperatorButtons(document.querySelector('[data-operator="/"]'));
        }

        // Other functions
        else if (e.key === '=' || e.key === 'Enter') {
            this.calculate();
        } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
            this.clear();
        } else if (e.key === 'Backspace') {
            this.backspace();
        } else if (e.key === '.') {
            this.appendDecimal();
        } else if (e.key === 'Delete') {
            this.memoryClear();
        } else if (e.key === 'm' || e.key === 'M') {
            this.memoryAdd();
        } else if (e.key === 'r' || e.key === 'R') {
            this.memoryRecall();
        } else if (e.key === 'h' || e.key === 'H') {
            this.toggleHistory();
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new Calculator();
});