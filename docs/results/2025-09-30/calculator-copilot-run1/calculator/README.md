# Web Calculator

A modern, responsive web calculator built with vanilla HTML, CSS, and JavaScript. Features a clean interface, comprehensive functionality, and full accessibility support.

## Features

### Core Functionality
- ✅ Basic arithmetic operations: Addition (+), Subtraction (-), Multiplication (×), Division (÷)
- ✅ Clear (C) and Clear Entry (CE) functions
- ✅ Decimal point support
- ✅ Backspace functionality
- ✅ Real-time display updates

### Advanced Features
- 🧠 **Memory Functions**: M+, M-, MR, MC for storing and recalling values
- 📊 **Calculation History**: Displays last 5 calculations with click-to-use functionality
- ⌨️ **Full Keyboard Support**: All functions accessible via keyboard shortcuts
- 📱 **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- ♿ **Accessibility**: ARIA labels, keyboard navigation, high contrast support

### Error Handling
- Division by zero protection
- Input validation
- Floating point precision management
- Visual error feedback

## File Structure

```
calculator/
├── index.html          # Main calculator interface
├── style.css          # Responsive styling and themes
├── script.js          # Calculator logic and functionality
├── tests.html         # Automated and manual test suite
└── README.md          # This documentation
```

## Usage

### Basic Operations
1. **Numbers**: Click number buttons or use keyboard (0-9)
2. **Operations**: Click operator buttons or use keyboard (+, -, *, /)
3. **Equals**: Click = button or press Enter
4. **Clear**: Click C button or press Escape
5. **Clear Entry**: Click CE button or press Delete
6. **Decimal**: Click . button or press period key
7. **Backspace**: Click ⌫ button or press Backspace

### Memory Functions
- **MC (Memory Clear)**: Clears stored memory value
- **MR (Memory Recall)**: Displays stored memory value
- **M+ (Memory Add)**: Adds current display to memory
- **M- (Memory Subtract)**: Subtracts current display from memory

### Keyboard Shortcuts
| Key | Function |
|-----|----------|
| 0-9 | Number input |
| +, -, *, / | Operators |
| Enter, = | Calculate |
| Escape | Clear all |
| Delete | Clear entry |
| Backspace | Remove last digit |
| . | Decimal point |
| Ctrl+M | Memory add |
| Ctrl+R | Memory recall |
| Ctrl+L | Memory clear |

### History Panel
- Automatically saves last 5 calculations
- Click any history item to use its result
- Clear history with "Clear History" button
- Persists between browser sessions

## Technical Details

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Responsive Breakpoints
- **Desktop**: > 768px - Full layout with side-by-side panels
- **Tablet**: 481px - 768px - Stacked layout
- **Mobile**: ≤ 480px - Compact single-column layout

### Accessibility Features
- ARIA labels for all interactive elements
- Keyboard navigation support
- High contrast mode detection
- Reduced motion support
- Screen reader compatibility
- Focus indicators

### Performance
- Vanilla JavaScript (no dependencies)
- Lightweight (~15KB total)
- Local storage for history persistence
- Efficient DOM manipulation
- Optimized for mobile touch

## Error Handling

The calculator handles various error conditions gracefully:

1. **Division by Zero**: Shows "Error" message and auto-clears after 2 seconds
2. **Invalid Operations**: Input validation prevents invalid states
3. **Floating Point Precision**: Rounds results to avoid precision errors
4. **Large Numbers**: Uses exponential notation for very large/small numbers
5. **Memory Persistence**: Graceful fallback if localStorage is unavailable

## Testing

### Automated Tests
Open `tests.html` in your browser to run the automated test suite:
- Basic arithmetic operations
- Error handling
- Memory functions
- Clear operations
- Keyboard input simulation

### Manual Testing
The test page includes a live calculator iframe for manual testing:
1. Responsive design testing
2. Touch interaction testing
3. Accessibility testing
4. Cross-browser compatibility
5. Mobile device testing

### Test Coverage
- ✅ All arithmetic operations
- ✅ Error conditions
- ✅ Memory functions
- ✅ Clear operations
- ✅ Keyboard input
- ✅ Edge cases (decimals, large numbers)
- ✅ UI responsiveness
- ✅ Accessibility compliance

## Installation & Setup

1. Clone or download the calculator files
2. Open `index.html` in a web browser
3. No additional setup or dependencies required

For development:
```bash
# Serve locally (optional)
python -m http.server 8000
# or
npx serve .
```

## Browser Support

### Desktop
- Chrome/Chromium 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Mobile
- iOS Safari 12+
- Chrome Mobile 60+
- Samsung Internet 8+
- Firefox Mobile 55+

## Contributing

This calculator is built with modern web standards and best practices:

- Semantic HTML5
- CSS3 with Flexbox/Grid
- ES6+ JavaScript
- Progressive enhancement
- Mobile-first responsive design
- WCAG 2.1 accessibility compliance

## License

This project is open source and available under the MIT License.

## Changelog

### Version 1.0.0
- Initial release with full calculator functionality
- Responsive design implementation
- Accessibility features
- Memory functions
- History tracking
- Comprehensive test suite
- Cross-browser compatibility

---

**Live Demo**: Open `index.html` in your browser to start calculating!
**Tests**: Open `tests.html` to run the test suite and manual testing interface.