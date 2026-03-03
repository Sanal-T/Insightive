import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Prepare data to send to Python backend
        const backendUrl = 'http://127.0.0.1:8000/analyze';

        // We can't just pass the formData directly because of how Next.js/Node handles it vs fetch
        // We need to reconstruct it or stream it.
        // Simplest way for a single file is to read the buffer and send it.

        const blob = file as Blob;
        const arrayBuffer = await blob.arrayBuffer();


        const backendFormData = new FormData();
        // Re-create the file object for the backend request
        // Note: In Node environment, FormData comes from 'undici' or native in Node 18+
        // But dealing with file uploads can be tricky. 
        // Let's use the buffer with filename.
        backendFormData.append('file', new Blob([arrayBuffer]), (file as File).name);

        const response = await fetch(backendUrl, {
            method: 'POST',
            body: backendFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ error: `Backend error: ${errorText}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error in analyze-paper route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
