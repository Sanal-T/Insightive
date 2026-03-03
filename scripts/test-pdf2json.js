
const PDFParser = require("pdf2json");

async function parsePdf(buffer) {
    const pdfParser = new PDFParser(null, 1); // 1 = text only
    return new Promise((resolve, reject) => {
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {
            try {
                const rawText = pdfData.Pages.map(page => {
                    return page.Texts.map(textItem => {
                        return decodeURIComponent(textItem.R[0].T);
                    }).join(' ');
                }).join('\n');
                resolve(rawText);
            } catch (err) {
                reject(err);
            }
        });
        pdfParser.parseBuffer(buffer);
    });
}

try {
    const validPdfBase64 = "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmogICUgcGFnZXM3Cjw8CiAgL1R5cGUgL1BhZ2VzCiAgL01lZGlhQm94IFsgMCAwIDIwMCAyMDAgXQogIC9Db3VudCAxCiAgL0tpZHMgWyAzIDAgUiBdCj4+CmVuZG9iagoKMyAwIG9iaiAgJSBwYWdlIDEKPDwKICAvVHlwZSAvUGFnZQogIC9QYXJlbnQgMiAwIFIKICAvUmVzb3VyY2VzIDw8CiAgICAvRm9udCA8PAogICAgICAvRjEgNCAwIFIKICAgID4+CiAgPj4KICAvQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCgo0IDAgb2JqICAlIGZvbnQKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAjw8CiAgL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjEwIDEwIFRkCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjAgMDAwMDAgbiAKMDAwMDAwMDAxNTcgMDAwMDAgbiAKMDAwMDAwMDI1NSAwMDAwMCBuIAowMDAwMDAwMzQ0IDAwMDAwIG4gCnRyYWlsZXIKPDwKICAvU2l6ZSA2CiAgL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQzOQolJUVPRgo=";
    const buffer = Buffer.from(validPdfBase64, 'base64');

    console.log("Parsing PDF...");
    parsePdf(buffer).then(text => {
        console.log("Success! Text length:", text.length);
        console.log("Text content:", text);
    }).catch(e => {
        console.error("Failed:", e);
    });

} catch (e) {
    console.error("Setup error:", e);
}
