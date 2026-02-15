// ============================================================
// Exa API 클라이언트
// ============================================================

import { checkRateLimit } from '../utils/rate-limiter.js';

const EXA_BASE_URL = 'https://api.exa.ai';

async function exaRequest(endpoint: string, body: any, apiKey: string): Promise<any> {
    await checkRateLimit('exa');

    const response = await fetch(`${EXA_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Exa API error (${response.status}): ${text}`);
    }

    return response.json();
}

export async function exaSearch(
    apiKey: string,
    options: {
        query: string;
        num_results?: number;
        type?: 'auto' | 'neural' | 'keyword';
        include_text?: boolean;
    }
): Promise<any> {
    const body: any = {
        query: options.query,
        numResults: options.num_results ?? 10,
        type: options.type ?? 'auto',
    };

    if (options.include_text) {
        body.contents = { text: true };
    }

    return exaRequest('/search', body, apiKey);
}

export async function exaAnswer(
    apiKey: string,
    query: string
): Promise<any> {
    return exaRequest('/answer', { query }, apiKey);
}
