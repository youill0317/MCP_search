import { checkRateLimit } from '../utils/rate-limiter.js';

const BRAVE_BASE_URL = 'https://api.search.brave.com/res/v1';

type QueryParamValue = string | number | boolean | Array<string | number> | undefined;

interface BraveSearchOptions {
    query: string;
    count?: number;
    country?: string;
    freshness?: string;
}

function setQueryParams(url: URL, params: Record<string, QueryParamValue>): void {
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined) continue;

        if (Array.isArray(value)) {
            for (const item of value) {
                if (item !== undefined && item !== null && String(item).length > 0) {
                    url.searchParams.append(key, String(item));
                }
            }
            continue;
        }

        url.searchParams.set(key, String(value));
    }
}

async function braveRequest(endpoint: string, params: Record<string, QueryParamValue>, apiKey: string): Promise<any> {
    await checkRateLimit('brave');

    const url = new URL(`${BRAVE_BASE_URL}/${endpoint}`);
    setQueryParams(url, params);

    const response = await fetch(url.toString(), {
        headers: {
            Accept: 'application/json',
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
    return braveRequest(
        'web/search',
        {
            q: options.query,
            count: options.count,
            country: options.country,
            freshness: options.freshness,
        },
        apiKey
    );
}

export async function braveNewsSearch(apiKey: string, options: BraveSearchOptions): Promise<any> {
    return braveRequest(
        'news/search',
        {
            q: options.query,
            count: options.count,
            freshness: options.freshness,
        },
        apiKey
    );
}

export async function braveImageSearch(apiKey: string, options: { query: string; count?: number }): Promise<any> {
    return braveRequest(
        'images/search',
        {
            q: options.query,
            count: options.count,
        },
        apiKey
    );
}

export async function braveVideoSearch(apiKey: string, options: BraveSearchOptions): Promise<any> {
    return braveRequest(
        'videos/search',
        {
            q: options.query,
            count: options.count,
            country: options.country,
            freshness: options.freshness,
        },
        apiKey
    );
}
