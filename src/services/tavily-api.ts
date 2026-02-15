// ============================================================
// Tavily API 클라이언트
// ============================================================

import { checkRateLimit } from '../utils/rate-limiter.js';

const TAVILY_BASE_URL = 'https://api.tavily.com';

export async function tavilySearch(
    apiKey: string,
    options: {
        query: string;
        search_depth?: 'basic' | 'advanced';
        include_raw_content?: boolean;
        max_results?: number;
    }
): Promise<any> {
    await checkRateLimit('tavily');

    const response = await fetch(`${TAVILY_BASE_URL}/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            api_key: apiKey,
            query: options.query,
            search_depth: options.search_depth ?? 'basic',
            include_raw_content: options.include_raw_content ?? false,
            max_results: options.max_results ?? 10,
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Tavily API error (${response.status}): ${text}`);
    }

    return response.json();
}

export async function tavilyExtract(
    apiKey: string,
    urls: string[]
): Promise<any> {
    await checkRateLimit('tavily');

    const response = await fetch(`${TAVILY_BASE_URL}/extract`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            api_key: apiKey,
            urls,
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Tavily Extract API error (${response.status}): ${text}`);
    }

    return response.json();
}

export async function tavilyUsage(apiKey: string): Promise<any> {
    const response = await fetch(`${TAVILY_BASE_URL}/usage`, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Tavily Usage API error (${response.status}): ${text}`);
    }

    return response.json();
}
