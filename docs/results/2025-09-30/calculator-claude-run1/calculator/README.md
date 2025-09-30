# Web Calculator

A feature-rich, responsive web calculator built with vanilla HTML, CSS, and JavaScript.

## Features

### Core Functionality
- **Basic Operations**: Addition (+), Subtraction (-), Multiplication (*), Division (/)
- **Clear Functions**:
  - C: Clear all
  - CE: Clear entry
  - ⌫: Backspace
- **Decimal Support**: Handle decimal numbers with precision
- **Negative Numbers**: Toggle positive/negative with +/- button
- **Error Handling**: Graceful handling of division by zero and other errors

### Advanced Features
- **Memory Functions**:
  - M+: Add current value to memory
  - M-: Subtract current value from memory
  - MR: Recall memory value
  - MC: Clear memory
  - Visual indicator when memory contains a value

- **Calculation History**:
  - Stores last 5 calculations
  - Click on history items to reuse results
  - Persistent across browser sessions
  - Clear history option

### User Interface
- **Modern Design**: Clean, dark theme with gradient background
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Visual Feedback**: Button animations and hover effects
- **Accessibility**: Full ARIA labels for screen readers
- **Display**: Shows both current calculation and history

### Keyboard Support
- **Numbers**: 0-9 keys for number input
- **Operations**: +, -, *, / for calculations
- **Enter/=**: Calculate result
- **Escape/C**: Clear calculator
- **Backspace**: Delete last digit
- **Decimal**: . for decimal point
- **Memory shortcuts**:
  - M: Memory add (M+)
  - R: Memory recall (MR)
  - Delete: Memory clear (MC)
- **H**: Toggle history panel

## File Structure

```
calculator/
├── index.html     # Main HTML structure
├── style.css      # Styles and responsive design
├── script.js      # Calculator logic and functionality
├── tests.html     # Test suite for calculator functions
└── README.md      # Documentation
```

## Installation

1. Clone or download the calculator folder
2. Open `index.html` in a modern web browser
3. No build process or dependencies required!

## Browser Compatibility

Works on all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Testing

Open `tests.html` in your browser and click "Run Tests" to execute the test suite. The tests cover:
- Basic arithmetic operations
- Decimal number calculations
- Edge cases (division by zero, negative numbers)
- Memory functions
- Chain operations

## Usage Examples

### Basic Calculation
1. Click or type numbers
2. Select an operation
3. Enter second number
4. Press = or Enter for result

### Using Memory
1. Enter a number
2. Press M+ to store in memory
3. Clear and perform other calculations
4. Press MR to recall the stored value
5. Press MC to clear memory

### Keyboard Navigation
- Type calculations naturally: "5+3="
- Use Escape to clear
- Use Backspace to correct mistakes
- Press H to view history

## Technical Details

- **No Dependencies**: Pure vanilla JavaScript
- **Local Storage**: Used for persistent history
- **Event Delegation**: Efficient event handling
- **Object-Oriented**: Clean, maintainable code structure
- **Responsive Design**: CSS Grid and Flexbox layout

## Customization

You can easily customize the calculator by modifying:
- `style.css`: Change colors, sizes, animations
- `script.js`: Add new operations or modify behavior
- `index.html`: Adjust button layout or add new features

## License

Free to use for personal and educational purposes.

## Support

For issues or questions, please check the test suite first (`tests.html`) to verify functionality.