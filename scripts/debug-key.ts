
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
const https = require('https');

const key = process.env.GOOGLE_GENAI_API_KEY;
console.log(`Key length: ${key ? key.length : 'MISSING'}`);

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models?key=${key}`,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const fs = require('fs');
        fs.writeFileSync('models.json', data);
        console.log("Models saved to models.json");
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
