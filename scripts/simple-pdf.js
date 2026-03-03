
try {
    const pdf = require('pdf-parse');
    console.log('pdf-parse loaded successfully');

    const buffer = Buffer.from('%PDF-1.7\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n223\n%%EOF');

    pdf(buffer).then(data => {
        console.log('Parsed text length:', data.text.length);
    }).catch(e => {
        console.error('Parse error:', e);
    });
} catch (e) {
    console.error('Load error:', e);
}
