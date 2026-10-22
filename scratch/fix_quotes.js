const fs = require('fs');
const vm = require('vm');

let content = fs.readFileSync('c:/Users/AliCom/Desktop/1-maktab/java.js', 'utf8');

function findErrors() {
    let lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        // Let's check single quote showToast or alert or strings
    }
}

// Let's write an iterative tester that shows line by line syntax errors
let code = content;
let maxAttempts = 100;
let errors = [];

while (maxAttempts-- > 0) {
    try {
        new vm.Script(code);
        console.log('SUCCESS: Script parsed cleanly with no syntax errors!');
        break;
    } catch (e) {
        let match = e.stack.match(/<anonymous>:(\d+)/);
        let lineNum = match ? parseInt(match[1], 10) : null;
        let lines = code.split('\n');
        let errLine = lineNum ? lines[lineNum - 1] : null;
        console.log(`Error at line ${lineNum}:`, errLine, '->', e.message);
        errors.push({ line: lineNum, text: errLine, msg: e.message });
        
        if (!lineNum) {
            console.error('Cannot determine line number:', e.stack);
            break;
        }
        
        // Let's fix showToast or similar single-quoted strings on that line
        let original = lines[lineNum - 1];
        // replace showToast('...', ...) where inside has unescaped quotes
        // Or if showToast('...') replace outer with double quotes or fix inner quotes
        let fixed = original;
        if (fixed.includes("showToast('") || fixed.includes("showToast( '")) {
            // Convert showToast('...', '...') properly
            fixed = fixed.replace(/showToast\(\s*'([\s\S]*?)',\s*'(.*?)'\s*\)/g, (m, p1, p2) => {
                let cleanP1 = p1.replace(/'/g, "\\'");
                return `showToast("${cleanP1}", "${p2}")`;
            });
        }
        if (fixed === original) {
            // Try generic single quote replace if there's an apostrophe in uzbek word like o'quv, to'liq, etc.
            fixed = fixed.replace(/(\w)'(\w)/g, '$1\\\'$2');
        }
        if (fixed === original) {
            console.error('Could not auto-fix line:', original);
            break;
        }
        lines[lineNum - 1] = fixed;
        code = lines.join('\n');
    }
}

console.log('Total errors fixed:', errors.length);
fs.writeFileSync('c:/Users/AliCom/Desktop/1-maktab/scratch/fixed_java.js', code, 'utf8');
