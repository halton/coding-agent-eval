const display = document.querySelector('.current-input');
const historyDisplay = document.querySelector('.history');
const buttons = document.querySelector('.buttons');

let currentInput = '0';
let operator = null;
let firstOperand = null;
let shouldResetDisplay = false;
let memory = 0;
const calculationHistory = [];

function updateDisplay() {
    display.textContent = currentInput;
}

function updateHistory() {
    historyDisplay.textContent = calculationHistory.slice(-5).join(', ');
}

function handleNumberClick(number) {
    if (shouldResetDisplay) {
        currentInput = number;
        shouldResetDisplay = false;
    } else {
        currentInput = currentInput === '0' ? number : currentInput + number;
    }
    updateDisplay();
}

function handleOperatorClick(op) {
    if (operator !== null) {
        calculate();
    }
    firstOperand = parseFloat(currentInput);
    operator = op;
    shouldResetDisplay = true;
}

function handleEqualsClick() {
    if (operator === null || shouldResetDisplay) {
        return;
    }
    calculate();
    operator = null;
}

function calculate() {
    const secondOperand = parseFloat(currentInput);
    let result;

    if (operator === 'add') {
        result = firstOperand + secondOperand;
    } else if (operator === 'subtract') {
        result = firstOperand - secondOperand;
    } else if (operator === 'multiply') {
        result = firstOperand * secondOperand;
    } else if (operator === 'divide') {
        if (secondOperand === 0) {
            result = 'Error';
        } else {
            result = firstOperand / secondOperand;
        }
    }

    currentInput = result.toString();
    calculationHistory.push(`${firstOperand} ${getOperatorSymbol(operator)} ${secondOperand} = ${result}`);
    updateDisplay();
    updateHistory();
    shouldResetDisplay = true;
}

function getOperatorSymbol(op) {
    switch (op) {
        case 'add': return '+';
        case 'subtract': return '-';
        case 'multiply': return '*';
        case 'divide': return '/';
        default: return '';
    }
}

function handleClearClick() {
    currentInput = '0';
    operator = null;
    firstOperand = null;
    shouldResetDisplay = false;
    updateDisplay();
}

function handleDecimalClick() {
    if (shouldResetDisplay) {
        currentInput = '0.';
        shouldResetDisplay = false;
        return;
    }
    if (!currentInput.includes('.')) {
        currentInput += '.';
    }
    updateDisplay();
}

function handleMemoryClick(action) {
    const value = parseFloat(currentInput);
    switch (action) {
        case 'mclear':
            memory = 0;
            break;
        case 'mrecall':
            currentInput = memory.toString();
            updateDisplay();
            break;
        case 'mplus':
            memory += value;
            break;
        case 'mminus':
            memory -= value;
            break;
    }
}

buttons.addEventListener('click', (event) => {
    const { key } = event.target.dataset;

    if (!key) return;

    if (key >= '0' && key <= '9') {
        handleNumberClick(key);
    } else if (key === 'decimal') {
        handleDecimalClick();
    } else if (key === 'clear') {
        handleClearClick();
    } else if (key === 'equals') {
        handleEqualsClick();
    } else if (['add', 'subtract', 'multiply', 'divide'].includes(key)) {
        handleOperatorClick(key);
    } else if (['mclear', 'mrecall', 'mplus', 'mminus'].includes(key)) {
        handleMemoryClick(key);
    }
});

document.addEventListener('keydown', (event) => {
    const { key } = event;

    if (key >= '0' && key <= '9') {
        handleNumberClick(key);
    } else if (key === '.') {
        handleDecimalClick();
    } else if (key === 'c' || key === 'C') {
        handleClearClick();
    } else if (key === '=' || key === 'Enter') {
        handleEqualsClick();
    } else if (key === '+') {
        handleOperatorClick('add');
    } else if (key === '-') {
        handleOperatorClick('subtract');
    } else if (key === '*') {
        handleOperatorClick('multiply');
    } else if (key === '/') {
        handleOperatorClick('divide');
    }
});
