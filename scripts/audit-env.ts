
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
const content = fs.readFileSync(envPath, 'utf8');

console.log("--- .env Analysis ---");
const lines = content.split(/\r?\n/);
lines.forEach((line: string, i: number) => {
    if (line.startsWith('GOOGLE_GENAI_API_KEY=')) {
        const val = line.split('=')[1];
        console.log(`Line ${i}: GOOGLE_GENAI_API_KEY found.`);
        console.log(`Length: ${val.length}`);
        console.log(`Ends with newline? ${val.endsWith('\n')}`);
        console.log(`Contains whitespace? ${/\s/.test(val)}`);
        console.log(`First 5: ${val.substring(0, 5)}`);
        console.log(`Last 5: ${val.substring(val.length - 5)}`);
    } else if (line.trim() === '') {
        console.log(`Line ${i}: <EMPTY>`);
    } else {
        console.log(`Line ${i}: ${line.split('=')[0]}=...`);
    }
});
console.log("--- End Analysis ---");

export { };
