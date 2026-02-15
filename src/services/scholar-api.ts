// ============================================================
// Semantic Scholar API 클라이언트
// ============================================================

import { checkRateLimit } from '../utils/rate-limiter.js';

const S2_BASE_URL = 'https://api.semanticscholar.org/graph/v1';

const PAPER_FIELDS = [
    'paperId', 'title', 'abstract', 'url', 'venue', 'year',
    'authors', 'citationCount', 'publicationDate',
    'externalIds', 'openAccessPdf', 'fieldsOfStudy',
].join(',');

async function s2Request(url: string, apiKey?: string): Promise<any> {
    await checkRateLimit('semantic_scholar');

    const headers: Record<string, string> = {
        'Accept': 'application/json',
    };
    if (apiKey) {
        headers['x-api-key'] = apiKey;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Semantic Scholar API error (${response.status}): ${text}`);
    }

    return response.json();
}

export async function scholarPaperSearch(
    options: {
        query: string;
        year?: string;
        fieldsOfStudy?: string;
        limit?: number;
    },
    apiKey?: string
): Promise<any> {
    const params = new URLSearchParams({
        query: options.query,
        fields: PAPER_FIELDS,
        limit: String(options.limit ?? 10),
    });
    if (options.year) params.set('year', options.year);
    if (options.fieldsOfStudy) params.set('fieldsOfStudy', options.fieldsOfStudy);

    return s2Request(`${S2_BASE_URL}/paper/search?${params}`, apiKey);
}

export async function scholarPaperDetails(
    paperId: string,
    apiKey?: string
): Promise<any> {
    return s2Request(`${S2_BASE_URL}/paper/${encodeURIComponent(paperId)}?fields=${PAPER_FIELDS}`, apiKey);
}

export async function scholarCitations(
    paperId: string,
    direction: 'citations' | 'references',
    limit: number = 20,
    apiKey?: string
): Promise<any> {
    const fields = direction === 'citations'
        ? `citingPaper.${PAPER_FIELDS}`
        : `citedPaper.${PAPER_FIELDS}`;

    return s2Request(
        `${S2_BASE_URL}/paper/${encodeURIComponent(paperId)}/${direction}?fields=${fields}&limit=${limit}`,
        apiKey
    );
}
