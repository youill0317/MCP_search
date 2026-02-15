// ============================================================
// Brave Search API 클라이언트
// ============================================================

import { checkRateLimit } from '../utils/rate-limiter.js';

const BRAVE_BASE_URL = 'https://api.search.brave.com/res/v1';

interface BraveSearchOptions {
    query: string;
    count?: number;
    country?: string;
    freshness?: string;
}

async function braveRequest(endpoint: string, params: Record<string, string>, apiKey: string): Promise<any> {
    await checkRateLimit('brave');

    const url = new URL(`${BRAVE_BASE_URL}/${endpoint}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const response = await fetch(url.toString(), {
        headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
            'X-Subscription-Token': apiKey,
        },
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Brave API error (${response.status}): ${text}`);
    }

    return response.json();
}

export async function braveWebSearch(apiKey: string, options: BraveSearchOptions): Promise<any> {
    const params: Record<string, string> = { q: options.query };
    if (options.count) params.count = String(options.count);
    if (options.country) params.country = options.country;
    if (options.freshness) params.freshness = options.freshness;

    return braveRequest('web/search', params, apiKey);
}

export async function braveNewsSearch(apiKey: string, options: BraveSearchOptions): Promise<any> {
    const params: Record<string, string> = { q: options.query };
    if (options.count) params.count = String(options.count);
    if (options.freshness) params.freshness = options.freshness;

    return braveRequest('news/search', params, apiKey);
}

export async function braveImageSearch(apiKey: string, options: { query: string; count?: number }): Promise<any> {
    const params: Record<string, string> = { q: options.query };
    if (options.count) params.count = String(options.count);

    return braveRequest('images/search', params, apiKey);
}
