const add = (a, b) => a + b;

const substract = (a, b) => a - b;

const multiply = (a, b) => a * b;

const divide = (a, b) => {
    if (b === 0) return "Nice try. Dividing by zero? 😏";
    return Number((a / b).toFixed(4));
};

const exponintial = (a, b) => a ** b;

const round = (n) => Number(n.toFixed(4));

const operate = (num1, op, num2) => {
    switch (op) {
        case "+":
            return add(num1, num2);

        case "-":
            return substract(num1, num2);

        case "*":
            return multiply(num1, num2);

        case "/":
            return divide(num1, num2);

        case "**":
            return exponintial(num1, num2);

        default:
            return ` ${op} does not exist `;
    }
};

function splitExpression(s) {
    s = s.replace(/\s/g, "");

    const operators = ["**", "+", "-", "*", "/"];

    for (let op of operators) {
        // for "-", start searching at 1 so a leading negative sign is skipped
        let index = s.indexOf(op, op === "-" ? 1 : 0);

        if (index !== -1) {
            let firstNumber = s.slice(0, index);
            let lastNumber = s.slice(index + op.length);

            if (lastNumber === "") throw new Error("Incomplete expression");

            return [Number(firstNumber), op, Number(lastNumber)];
        }
    }

    throw new Error("No operator found");
}

function calculate(s) {
    let [first, op, last] = splitExpression(s);
    const result = operate(first, op, last);
    return typeof result === "number" ? round(result) : result;
}

// returns null if the expression isn't a complete "number op number"
function safeCalculate(s) {
    try {
        return calculate(s);
    } catch {
        return null;
    }
}

const display = document.getElementById('display');
let justEvaluated = false;
let isError = false;

document.querySelector('.keys').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    switch (btn.dataset.action) {
        case 'num':
            if (justEvaluated || isError || display.textContent === '0') {
                display.textContent = btn.dataset.value; // start fresh
            } else {
                display.textContent += btn.dataset.value;
            }
            justEvaluated = false;
            isError = false;
            break;

        case 'op': {
            if (isError) break; // ignore operators on an error message

            const current = display.textContent;

            // consecutive operators: just swap the last one, no evaluation
            if (/(\*\*|[+\-*/])$/.test(current)) {
                display.textContent =
                    current.replace(/(\*\*|[+\-*/])$/, '') + btn.dataset.value;
                justEvaluated = false;
                break;
            }

            // a full pair exists (12+7) -> evaluate before adding the next operator
            const result = safeCalculate(current);

            if (result === null) {
                // only a single number so far, just append the operator
                display.textContent += btn.dataset.value;
                justEvaluated = false;
            } else if (typeof result === 'string') {
                // snarky error message
                display.textContent = result;
                isError = true;
                justEvaluated = true;
            } else {
                // continue from the result
                display.textContent = result + btn.dataset.value;
                justEvaluated = false;
            }
            break;
        }

        case 'equals': {
            const result = safeCalculate(display.textContent);
            if (result === null) break; // incomplete expression: do nothing

            display.textContent = result;
            isError = typeof result === 'string';
            justEvaluated = true;
            break;
        }

        case 'clear':
            display.textContent = '0';
            justEvaluated = false;
            isError = false;
            break;

        case 'back':
            if (justEvaluated || isError) {
                display.textContent = '0';
                justEvaluated = false;
                isError = false;
            } else {
                display.textContent = display.textContent.slice(0, -1) || '0';
            }
            break;
    }
});