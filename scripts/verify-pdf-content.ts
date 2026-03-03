
const PDFParser = require("pdf2json");
const fs = require('fs');
const path = require('path');

// Mock a PDF buffer (empty/minimal for test if no file exists, but ideally we want a real one)
// Since I can't easily upload a file to the script, I'll use the one from the "public" folder if it exists, or create a dummy one.
// Actually, better: I'll use the logic I wrote in actions.ts to test the library itself.

async function testExtraction() {
    console.log("Testing PDF Extraction Logic...");

    // Create a minimal valid PDF buffer (Hello World)
    const pdfContent = `%PDF-1.7
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 24 >>
stream
BT
/F1 12 Tf
100 700 Td
(Hello World from PDF!) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000157 00000 n 
0000000259 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
333
%%EOF`;
    const buffer = Buffer.from(pdfContent);

    try {
        const pdfParser = new PDFParser(null, 1); // 1 = text only

        const text = await new Promise((resolve, reject) => {
            pdfParser.on("pdfParser_dataError", (errData) => reject(errData.parserError));
            pdfParser.on("pdfParser_dataReady", (pdfData) => {
                try {
                    // The logic from src/app/actions.ts
                    const rawText = pdfData.Pages.map((page) => {
                        return page.Texts.map((textItem) => {
                            try {
                                return decodeURIComponent(textItem.R[0].T);
                            } catch (e) {
                                return textItem.R[0].T;
                            }
                        }).join(' ');
                    }).join('\n');
                    resolve(rawText);
                } catch (err) {
                    reject(err);
                }
            });
            pdfParser.parseBuffer(buffer);
        });

        console.log("--- Extracted Text Start ---");
        console.log(text);
        console.log("--- Extracted Text End ---");

        if (text.toString().includes("Hello World")) {
            console.log("✅ PDF Extraction SUCCESS");
        } else {
            console.log("❌ PDF Extraction FAILED to find expected text");
        }

    } catch (error) {
        console.error("Critical Error:", error);
    }
}

testExtraction();
