import assert from 'node:assert/strict';
import { braveVideoSearch } from '../src/services/brave-api.js';
import { __resetRateLimiterForTests } from '../src/utils/rate-limiter.js';

function toUrlString(input: RequestInfo | URL): string {
    if (typeof input === 'string') return input;
    if (input instanceof URL) return input.toString();
    return input.url;
}

export async function runBraveApiTests(): Promise<void> {
    await testVideoEndpoint();
}

async function testVideoEndpoint(): Promise<void> {
    __resetRateLimiterForTests();
    const originalFetch = globalThis.fetch;

    let requestedUrl = '';
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        requestedUrl = toUrlString(input);
        return new Response(JSON.stringify({ results: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }) as typeof fetch;

    try {
        await braveVideoSearch('k', { query: 'mcp', count: 3 });
    } finally {
        globalThis.fetch = originalFetch;
    }

    assert.ok(requestedUrl.includes('/videos/search?'));
    const url = new URL(requestedUrl);
    assert.equal(url.searchParams.get('q'), 'mcp');
    assert.equal(url.searchParams.get('count'), '3');
}
