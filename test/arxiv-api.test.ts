import assert from 'node:assert/strict';
import { arxivSearch } from '../src/services/arxiv-api.js';
import { __resetRateLimiterForTests } from '../src/utils/rate-limiter.js';

function toUrlString(input: RequestInfo | URL): string {
    if (typeof input === 'string') return input;
    if (input instanceof URL) return input.toString();
    return input.url;
}

export async function runArxivApiTests(): Promise<void> {
    await testAvoidsDoubleEncoding();
    await testCategoryQueryEncoding();
}

async function testAvoidsDoubleEncoding(): Promise<void> {
    __resetRateLimiterForTests();
    const originalFetch = globalThis.fetch;

    let requestedUrl = '';
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        requestedUrl = toUrlString(input);
        return new Response('<feed xmlns="http://www.w3.org/2005/Atom"></feed>', {
            status: 200,
            headers: { 'Content-Type': 'application/atom+xml' },
        });
    }) as typeof fetch;

    try {
        await arxivSearch({ query: 'deep learning' });
    } finally {
        globalThis.fetch = originalFetch;
    }

    assert.ok(requestedUrl.includes('search_query='));
    assert.equal(requestedUrl.includes('%2520'), false);

    const url = new URL(requestedUrl);
    assert.equal(url.searchParams.get('search_query'), 'all:deep learning');
}

async function testCategoryQueryEncoding(): Promise<void> {
    __resetRateLimiterForTests();
    const originalFetch = globalThis.fetch;

    let requestedUrl = '';
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        requestedUrl = toUrlString(input);
        return new Response('<feed xmlns="http://www.w3.org/2005/Atom"></feed>', {
            status: 200,
            headers: { 'Content-Type': 'application/atom+xml' },
        });
    }) as typeof fetch;

    try {
        await arxivSearch({ query: 'deep learning', category: 'cs.AI' });
    } finally {
        globalThis.fetch = originalFetch;
    }

    const url = new URL(requestedUrl);
    assert.equal(url.searchParams.get('search_query'), 'cat:cs.AI AND all:deep learning');
}


