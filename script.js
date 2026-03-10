class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
            this.currentOperand = '0';
            return;
        }
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = '';
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '' && number === '.') {
            this.currentOperand = '0';
        }
        this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '' && operation === '-') {
            this.currentOperand = '-';
            return;
        }
        if (this.currentOperand === '' || this.currentOperand === '-') return;
        
        if (operation === '%') {
            const current = parseFloat(this.currentOperand);
            if (isNaN(current)) return;
            this.currentOperand = (current / 100).toString();
            return;
        }

        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    alert("Cannot divide by zero");
                    this.clear();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // Handle floating point precision issues
        this.currentOperand = Math.round(computation * 10000000000) / 10000000000;
        this.currentOperand = this.currentOperand.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }

    getDisplayNumber(number) {
        if (number === '' || number === '-') return number;
        
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }

        // Adjust font size based on length
        const length = this.currentOperand.toString().length;
        if (length > 12) {
            this.currentOperandElement.style.fontSize = '1.5rem';
        } else if (length > 8) {
            this.currentOperandElement.style.fontSize = '2rem';
        } else {
            this.currentOperandElement.style.fontSize = '2.5rem';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const previousOperandElement = document.getElementById('previous-operand');
    const currentOperandElement = document.getElementById('current-operand');
    const buttons = document.querySelectorAll('.btn');
    
    const calculator = new Calculator(previousOperandElement, currentOperandElement);

    // Button click handlers
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Visual feedback
            button.classList.add('clicked');
            setTimeout(() => button.classList.remove('clicked'), 150);

            if (button.classList.contains('number')) {
                calculator.appendNumber(button.dataset.value);
            } else if (button.classList.contains('operator')) {
                calculator.chooseOperation(button.dataset.value);
                
                // Active state for operators
                document.querySelectorAll('.operator').forEach(op => op.classList.remove('active'));
                if (button.dataset.value !== '%') {
                    button.classList.add('active');
                }
            } else if (button.classList.contains('equals')) {
                calculator.compute();
                document.querySelectorAll('.operator').forEach(op => op.classList.remove('active'));
            } else if (button.classList.contains('clear')) {
                calculator.clear();
                document.querySelectorAll('.operator').forEach(op => op.classList.remove('active'));
            } else if (button.classList.contains('delete')) {
                calculator.delete();
            }
            
            calculator.updateDisplay();
        });
    });

    // Keyboard support
    document.addEventListener('keydown', e => {
        let key = e.key;
        let buttonToClick = null;

        if (/[0-9.]/.test(key)) {
            calculator.appendNumber(key);
            buttonToClick = document.querySelector(`.number[data-value="${key}"]`);
        } else if (key === '+' || key === '-') {
            calculator.chooseOperation(key);
            buttonToClick = document.querySelector(`.operator[data-value="${key}"]`);
        } else if (key === '*' || key === 'x') {
            calculator.chooseOperation('×');
            buttonToClick = document.querySelector(`.operator[data-value="×"]`);
        } else if (key === '/') {
            e.preventDefault(); // Prevent quick find in Firefox
            calculator.chooseOperation('÷');
            buttonToClick = document.querySelector(`.operator[data-value="÷"]`);
        } else if (key === '%') {
            calculator.chooseOperation('%');
            buttonToClick = document.querySelector(`.operator[data-value="%"]`);
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            calculator.compute();
            buttonToClick = document.querySelector('.equals');
        } else if (key === 'Backspace') {
            calculator.delete();
            buttonToClick = document.querySelector('.delete');
        } else if (key === 'Escape') {
            calculator.clear();
            buttonToClick = document.querySelector('.clear');
        }

        if (buttonToClick) {
            buttonToClick.classList.add('clicked');
            setTimeout(() => buttonToClick.classList.remove('clicked'), 150);
            
            if (buttonToClick.classList.contains('operator') && key !== '%') {
                document.querySelectorAll('.operator').forEach(op => op.classList.remove('active'));
                buttonToClick.classList.add('active');
            } else if (key === 'Enter' || key === '=' || key === 'Escape') {
                document.querySelectorAll('.operator').forEach(op => op.classList.remove('active'));
            }
        }
        
        calculator.updateDisplay();
    });
});
