class Calculator {
    constructor() {
        this.currentNumber = '0';
        this.previousNumber = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.memory = 0;
        this.history = [];
        this.maxHistoryItems = 5;
        
        this.display = document.getElementById('display');
        this.historyDisplay = document.getElementById('history');
        this.historyList = document.getElementById('history-list');
        
        this.initializeEventListeners();
        this.updateDisplay();
        this.loadHistory();
    }
    
    initializeEventListeners() {
        // Number buttons
        document.querySelectorAll('.number').forEach(button => {
            button.addEventListener('click', (e) => {
                if (e.target.id === 'decimal') {
                    this.inputDecimal();
                } else {
                    this.inputNumber(e.target.dataset.number);
                }
            });
        });
        
        // Operator buttons
        document.querySelectorAll('.operator').forEach(button => {
            button.addEventListener('click', (e) => {
                this.inputOperator(e.target.dataset.operator);
            });
        });
        
        // Equals button
        document.getElementById('equals').addEventListener('click', () => {
            this.calculate();
        });
        
        // Clear buttons
        document.getElementById('clear').addEventListener('click', () => {
            this.clear();
        });
        
        document.getElementById('clear-entry').addEventListener('click', () => {
            this.clearEntry();
        });
        
        // Backspace button
        document.getElementById('backspace').addEventListener('click', () => {
            this.backspace();
        });
        
        // Memory buttons
        document.getElementById('mc').addEventListener('click', () => {
            this.memoryClear();
        });
        
        document.getElementById('mr').addEventListener('click', () => {
            this.memoryRecall();
        });
        
        document.getElementById('m-plus').addEventListener('click', () => {
            this.memoryAdd();
        });
        
        document.getElementById('m-minus').addEventListener('click', () => {
            this.memorySubtract();
        });
        
        // History buttons
        document.getElementById('clear-history').addEventListener('click', () => {
            this.clearHistory();
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
        
        // History item clicks
        this.historyList.addEventListener('click', (e) => {
            if (e.target.classList.contains('history-item')) {
                const result = e.target.dataset.result;
                this.currentNumber = result;
                this.updateDisplay();
            }
        });
    }
    
    inputNumber(number) {
        if (this.waitingForOperand) {
            this.currentNumber = number;
            this.waitingForOperand = false;
        } else {
            this.currentNumber = this.currentNumber === '0' ? number : this.currentNumber + number;
        }
        this.updateDisplay();
    }
    
    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentNumber = '0.';
            this.waitingForOperand = false;
        } else if (this.currentNumber.indexOf('.') === -1) {
            this.currentNumber += '.';
        }
        this.updateDisplay();
    }
    
    inputOperator(nextOperator) {
        const inputValue = parseFloat(this.currentNumber);
        
        if (this.previousNumber === '') {
            this.previousNumber = inputValue;
        } else if (this.operator) {
            const currentValue = this.previousNumber || 0;
            const newValue = this.performCalculation();
            
            if (newValue === null) return;
            
            this.currentNumber = String(newValue);
            this.previousNumber = newValue;
        }
        
        this.waitingForOperand = true;
        this.operator = nextOperator;
        this.updateOperatorButtons();
        this.updateHistoryDisplay();
    }
    
    calculate() {
        if (this.operator && !this.waitingForOperand) {
            const newValue = this.performCalculation();
            
            if (newValue === null) return;
            
            const calculation = `${this.previousNumber} ${this.getOperatorSymbol(this.operator)} ${this.currentNumber} = ${newValue}`;
            this.addToHistory(calculation, newValue);
            
            this.currentNumber = String(newValue);
            this.previousNumber = '';
            this.operator = null;
            this.waitingForOperand = true;
            
            this.updateDisplay();
            this.updateOperatorButtons();
            this.historyDisplay.textContent = '';
        }
    }
    
    performCalculation() {
        const prev = parseFloat(this.previousNumber);
        const current = parseFloat(this.currentNumber);
        
        if (isNaN(prev) || isNaN(current)) return null;
        
        let result;
        switch (this.operator) {
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
                    return null;
                }
                result = prev / current;
                break;
            default:
                return null;
        }
        
        // Round to avoid floating point precision issues
        return Math.round((result + Number.EPSILON) * 100000000) / 100000000;
    }
    
    clear() {
        this.currentNumber = '0';
        this.previousNumber = '';
        this.operator = null;
        this.waitingForOperand = false;
        this.updateDisplay();
        this.updateOperatorButtons();
        this.historyDisplay.textContent = '';
        this.clearError();
    }
    
    clearEntry() {
        this.currentNumber = '0';
        this.updateDisplay();
        this.clearError();
    }
    
    backspace() {
        if (this.currentNumber.length > 1) {
            this.currentNumber = this.currentNumber.slice(0, -1);
        } else {
            this.currentNumber = '0';
        }
        this.updateDisplay();
    }
    
    memoryClear() {
        this.memory = 0;
        this.updateMemoryButtons();
    }
    
    memoryRecall() {
        this.currentNumber = String(this.memory);
        this.updateDisplay();
    }
    
    memoryAdd() {
        this.memory += parseFloat(this.currentNumber) || 0;
        this.updateMemoryButtons();
    }
    
    memorySubtract() {
        this.memory -= parseFloat(this.currentNumber) || 0;
        this.updateMemoryButtons();
    }
    
    updateMemoryButtons() {
        const buttons = document.querySelectorAll('.memory-btn');
        buttons.forEach(btn => {
            if (this.memory !== 0) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    addToHistory(calculation, result) {
        this.history.unshift({ calculation, result });
        if (this.history.length > this.maxHistoryItems) {
            this.history = this.history.slice(0, this.maxHistoryItems);
        }
        this.updateHistoryDisplay();
        this.saveHistory();
    }
    
    updateHistoryDisplay() {
        this.historyList.innerHTML = '';
        this.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = item.calculation;
            historyItem.dataset.result = item.result;
            historyItem.setAttribute('aria-label', `Previous calculation: ${item.calculation}`);
            this.historyList.appendChild(historyItem);
        });
        
        // Update current calculation display
        if (this.operator && this.previousNumber !== '') {
            this.historyDisplay.textContent = `${this.previousNumber} ${this.getOperatorSymbol(this.operator)}`;
        }
    }
    
    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
        this.saveHistory();
    }
    
    saveHistory() {
        try {
            localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        } catch (e) {
            console.warn('Could not save history to localStorage:', e);
        }
    }
    
    loadHistory() {
        try {
            const savedHistory = localStorage.getItem('calculatorHistory');
            if (savedHistory) {
                this.history = JSON.parse(savedHistory);
                this.updateHistoryDisplay();
            }
        } catch (e) {
            console.warn('Could not load history from localStorage:', e);
        }
    }
    
    updateDisplay() {
        this.display.textContent = this.formatNumber(this.currentNumber);
    }
    
    updateOperatorButtons() {
        document.querySelectorAll('.operator').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.operator === this.operator) {
                btn.classList.add('active');
            }
        });
    }
    
    formatNumber(number) {
        const num = parseFloat(number);
        if (isNaN(num)) return number;
        
        // Handle very large or very small numbers
        if (Math.abs(num) > 1e15 || (Math.abs(num) < 1e-6 && num !== 0)) {
            return num.toExponential(6);
        }
        
        // Format with appropriate decimal places
        const formatted = num.toString();
        return formatted.length > 12 ? num.toPrecision(12) : formatted;
    }
    
    getOperatorSymbol(operator) {
        const symbols = {
            '+': '+',
            '-': '-',
            '*': '×',
            '/': '÷'
        };
        return symbols[operator] || operator;
    }
    
    showError(message) {
        this.display.textContent = 'Error';
        this.display.parentElement.classList.add('error');
        console.error('Calculator Error:', message);
        
        // Clear error after 2 seconds
        setTimeout(() => {
            this.clearError();
            this.clear();
        }, 2000);
    }
    
    clearError() {
        this.display.parentElement.classList.remove('error');
    }
    
    handleKeyboard(event) {
        const key = event.key;
        
        // Prevent default for calculator keys
        if (/[0-9+\-*/=.\r\n\b]/.test(key) || key === 'Escape' || key === 'Delete') {
            event.preventDefault();
        }
        
        // Numbers
        if (/[0-9]/.test(key)) {
            this.inputNumber(key);
        }
        
        // Operators
        else if (key === '+') {
            this.inputOperator('+');
        }
        else if (key === '-') {
            this.inputOperator('-');
        }
        else if (key === '*') {
            this.inputOperator('*');
        }
        else if (key === '/') {
            this.inputOperator('/');
        }
        
        // Decimal point
        else if (key === '.') {
            this.inputDecimal();
        }
        
        // Equals
        else if (key === '=' || key === 'Enter') {
            this.calculate();
        }
        
        // Clear
        else if (key === 'Escape') {
            this.clear();
        }
        else if (key === 'Delete') {
            this.clearEntry();
        }
        
        // Backspace
        else if (key === 'Backspace') {
            this.backspace();
        }
        
        // Memory shortcuts
        else if (event.ctrlKey && key === 'm') {
            this.memoryAdd();
        }
        else if (event.ctrlKey && key === 'r') {
            this.memoryRecall();
        }
        else if (event.ctrlKey && key === 'l') {
            this.memoryClear();
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});

// Service Worker registration for offline support (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}