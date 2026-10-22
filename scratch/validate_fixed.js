const fs = require('fs');
const vm = require('vm');

let fileContent = fs.readFileSync('c:/Users/AliCom/Desktop/1-maktab/scratch/fixed_java.js', 'utf8');

try {
    new vm.Script(fileContent);
    console.log('scratch/fixed_java.js is completely VALID JavaScript!');
} catch (e) {
    console.error('Syntax error:', e);
}
