const fs = require('fs');
let html = fs.readFileSync('c:/Users/AliCom/Desktop/1-maktab/index.html', 'utf8');

let onclickRegex = /onclick="([^"]*)"/g;
let match;
let issues = [];

while ((match = onclickRegex.exec(html)) !== null) {
    let code = match[1];
    try {
        new Function(code);
    } catch (e) {
        issues.push({ code, err: e.message });
        console.log('Onclick error:', code, '-->', e.message);
    }
}

console.log('Total onclick issues found:', issues.length);
