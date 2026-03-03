
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const key = 'APIFY_API_TOKEN=apify_api_6XMcqa0w3QCSo00bXGTV0zUiHPXVW40cnv9O';

try {
    let content = '';
    if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf8');
    }

    if (content.includes('APIFY_API_TOKEN')) {
        console.log('Token already exists (checking value...)');
        // We could replace it, but simple append might duplicate. 
        // Let's replace the line if it exists.
        const lines = content.split('\n');
        const newLines = lines.map(line => line.startsWith('APIFY_API_TOKEN=') ? key : line);
        content = newLines.join('\n');
    } else {
        if (content && !content.endsWith('\n')) {
            content += '\n';
        }
        content += key + '\n';
    }

    fs.writeFileSync(envPath, content);
    console.log('Successfully updated .env with Apify key.');
} catch (e) {
    console.error('Failed to update .env:', e);
}
