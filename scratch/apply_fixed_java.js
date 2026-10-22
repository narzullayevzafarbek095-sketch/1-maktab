const fs = require('fs');

let fixedContent = fs.readFileSync('c:/Users/AliCom/Desktop/1-maktab/scratch/fixed_java.js', 'utf8');

// Also ensure initCounters triggers properly and immediately
// Let's inspect initCounters in fixedContent
const vm = require('vm');

try {
    new vm.Script(fixedContent);
    console.log('Valid script. Writing to java.js...');
    fs.writeFileSync('c:/Users/AliCom/Desktop/1-maktab/java.js', fixedContent, 'utf8');
    console.log('java.js updated successfully!');
} catch (e) {
    console.error('Validation error before write:', e);
}
