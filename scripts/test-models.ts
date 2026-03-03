

const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

async function run() {
    const { ai } = await import('../src/ai/genkit');

    async function testModel(modelName) {
        console.log(`\nTesting model: "${modelName}"...`);
        try {
            const response = await ai.generate({
                model: modelName,
                prompt: 'Hello, reply with "Works".'
            });
            console.log(`✅ [${modelName}] Success: ${response.text}`);
            return true;
        } catch (e) {
            console.log(`❌ [${modelName}] Failed: ${e.message.split('\n')[0]}`); // Only first line
            return false;
        }
    }

    const models = [
        'gemini-2.0-flash',
        'gemini-flash-latest',
        'googleai/gemini-2.0-flash'
    ];

    for (const m of models) {
        if (await testModel(m)) {
            console.log(`\n🎉 WE HAVE A WINNER: ${m}`);
            break;
        }
    }
}

run();

