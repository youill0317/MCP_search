import assert from 'node:assert/strict';
import {
    tavilyCrawl,
    tavilyImageSearch,
    tavilyMap,
    tavilySearch,
} from '../src/services/tavily-api.js';
import { formatTavilyImageResults } from '../src/utils/formatter.js';
import { __resetRateLimiterForTests } from '../src/utils/rate-limiter.js';

type Call = {
    url: string;
    body: any;
};

function toUrlString(input: RequestInfo | URL): string {
    if (typeof input === 'string') return input;
    if (input instanceof URL) return input.toString();
    return input.url;
}

export async function runTavilyApiTests(): Promise<void> {
    await testSearchPayloadFlags();
    await testCrawlAndMapEndpoints();
    await testImageFormatterStringPayload();
}

async function testSearchPayloadFlags(): Promise<void> {
    __resetRateLimiterForTests();
    const originalFetch = globalThis.fetch;

    const calls: Call[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        calls.push({
            url: toUrlString(input),
            body: init?.body ? JSON.parse(String(init.body)) : undefined,
        });
        return new Response(JSON.stringify({ results: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }) as typeof fetch;

    try {
        await tavilySearch('k', { query: 'mcp' });
        await tavilyImageSearch('k', { query: 'mcp images' });
    } finally {
        globalThis.fetch = originalFetch;
    }

    assert.ok(calls.every((c) => c.url.endsWith('/search')));
    assert.equal(calls[0].body.include_answer, false);
    assert.equal(calls[0].body.include_images, false);
    assert.equal(calls[1].body.include_answer, false);
    assert.equal(calls[1].body.include_images, true);
}

async function testCrawlAndMapEndpoints(): Promise<void> {
    __resetRateLimiterForTests();
    const originalFetch = globalThis.fetch;

    const urls: string[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        urls.push(toUrlString(input));
        return new Response(JSON.stringify({ results: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }) as typeof fetch;

    try {
        await tavilyCrawl('k', { url: 'https://example.com' });
        await tavilyMap('k', { url: 'https://example.com' });
    } finally {
        globalThis.fetch = originalFetch;
    }

    assert.ok(urls.some((url) => url.endsWith('/crawl')));
    assert.ok(urls.some((url) => url.endsWith('/map')));
}

async function testImageFormatterStringPayload(): Promise<void> {
    const directImageResult = formatTavilyImageResults({
        images: ['https://example.com/a.png'],
    });
    assert.equal(directImageResult.length, 1);
    assert.equal(directImageResult[0].url, 'https://example.com/a.png');
    assert.equal(directImageResult[0].thumbnailUrl, 'https://example.com/a.png');
    assert.equal(directImageResult[0].sourceUrl, 'https://example.com/a.png');

    const nestedImageResult = formatTavilyImageResults({
        results: [{ images: ['https://example.com/b.png'] }],
    });
    assert.equal(nestedImageResult.length, 1);
    assert.equal(nestedImageResult[0].url, 'https://example.com/b.png');
    assert.equal(nestedImageResult[0].thumbnailUrl, 'https://example.com/b.png');
    assert.equal(nestedImageResult[0].sourceUrl, 'https://example.com/b.png');
}
