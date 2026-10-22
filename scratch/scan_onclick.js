const fs = require('fs');
const html = fs.readFileSync('c:/Users/AliCom/Desktop/1-maktab/index.html', 'utf8');

const lines = html.split('\n');
lines.forEach((line, idx) => {
    if (line.includes('onclick=') && (line.includes("'") || line.includes('"'))) {
        const matches = line.match(/onclick="([^"]*)"/g);
        if (matches) {
            matches.forEach(m => {
                const code = m.slice(9, -1);
                try {
                    new Function(code);
                } catch (e) {
                    console.log(`Line ${idx + 1}: ${line.trim()} -> Error: ${e.message}`);
                }
            });
        }
    }
});
