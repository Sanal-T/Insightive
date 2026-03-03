
import 'dotenv/config';
import { searchKaggleDatasets } from '../src/lib/api/kaggle';
import { searchHuggingFaceDatasets } from '../src/lib/api/huggingface';

async function test() {
    console.log('--- Testing Hugging Face ---');
    try {
        const hf = await searchHuggingFaceDatasets('machine learning');
        console.log(`HF Results found: ${Array.isArray(hf) ? hf.length : 'Invalid response'}`);
        if (Array.isArray(hf) && hf.length > 0) {
            console.log('First HF Result:', hf[0].id);
        }
    } catch (e) {
        console.error('HF Error:', e);
    }

    console.log('\n--- Testing Kaggle ---');
    try {
        const kaggle = await searchKaggleDatasets('machine learning');
        console.log(`Kaggle Results found: ${Array.isArray(kaggle) ? kaggle.length : 'Invalid response'}`);
        if (Array.isArray(kaggle) && kaggle.length > 0) {
            console.log('First Kaggle Result:', kaggle[0].title || kaggle[0].ref);
        }
    } catch (e) {
        console.error('Kaggle Error:', e);
    }
}

test();
