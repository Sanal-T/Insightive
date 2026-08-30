import { NextRequest, NextResponse } from 'next/server';
import { suggestPapers } from '@/ai/flows/suggest-papers';

export async function GET(request: NextRequest) {
    const q = request.nextUrl.searchParams.get('q');
    if (!q) {
        return NextResponse.json({ papers: [] });
    }

    try {
        const papers = await suggestPapers(q);
        // Map to the shape the literature review page expects
        const mapped = papers.map(p => ({
            title: p.title,
            description: p.description,
            authors: Array.isArray(p.authors) ? p.authors.join(', ') : (p.authors || ''),
            source: p.source,
            url: p.url,
            type: 'search',
        }));
        return NextResponse.json({ papers: mapped });
    } catch (error) {
        console.error('[api/search-papers]', error);
        return NextResponse.json({ papers: [], error: 'Search failed' }, { status: 500 });
    }
}
