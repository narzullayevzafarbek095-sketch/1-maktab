const fs = require('fs');

let content = fs.readFileSync('c:/Users/AliCom/Desktop/1-maktab/java.js', 'utf8');

// Let's find lines with syntax issues or check with acorn/vm or regex
const vm = require('vm');

function testCode(code) {
    try {
        new vm.Script(code);
        return { valid: true };
    } catch (e) {
        return { valid: false, error: e.message, stack: e.stack };
    }
}

console.log('Initial test:', testCode(content));
