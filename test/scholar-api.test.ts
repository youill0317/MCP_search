import assert from 'node:assert/strict';
import {
    PAPER_FIELDS_DEFAULT,
    scholarAuthorBatch,
    scholarPaperSearch,
    scholarPaperBatch,
    scholarPaperSearchBulk,
    scholarPaperSearchMatch,
    scholarRecommendSingle,
    scholarRecommendList,
} from '../src/services/scholar-api.js';
import { __resetRateLimiterForTests } from '../src/utils/rate-limiter.js';

type Call = {
    url: string;
    method?: string;
    body?: any;
};

function toUrlString(input: RequestInfo | URL): string {
    if (typeof input === 'string') return input;
    if (input instanceof URL) return input.toString();
    return input.url;
}

function jsonResponse(data: unknown): Response {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function runScholarApiTests(): Promise<void> {
    await testSearchDefaultAndOverrideFields();
    await testBulkSearchEndpoint();
    await testSearchMatchDefaultAndOverrideFields();
    await testBatchEndpoints();
    await testRecommendSingleEndpoint();
    await testRecommendListEndpoint();
}

async function testSearchDefaultAndOverrideFields(): Promise<void> {
    __resetRateLimiterForTests();
    const originalFetch = globalThis.fetch;

    const calls: string[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        calls.push(toUrlString(input));
        return jsonResponse({ data: [] });
    }) as typeof fetch;

    try {
        await scholarPaperSearch({ query: 'transformers' });
        await scholarPaperSearch({ query: 'transformers', fields: 'paperId,title' });
    } finally {
        globalThis.fetch = originalFetch;
    }

    const defaultUrl = new URL(calls[0]);
    const overrideUrl = new URL(calls[1]);

    assert.equal(defaultUrl.searchParams.get('fields'), PAPER_FIELDS_DEFAULT);
    assert.equal(overrideUrl.searchParams.get('fields'), 'paperId,title');
}

async function testBulkSearchEndpoint(): Promise<void> {
    __resetRateLimiterForTests();
    const originalFetch = globalThis.fetch;

    const calls: string[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        calls.push(toUrlString(input));
        return jsonResponse({ data: [] });
    }) as typeof fetch;

    try {
        await scholarPaperSearchBulk({ query: 'transformers' });
        await scholarPaperSearchBulk({ query: 'transformers', fields: 'paperId,title' });
    } finally {
        globalThis.fetch = originalFetch;
    }

    const defaultUrl = new URL(calls[0]);
    const overrideUrl = new URL(calls[1]);

    assert.ok(calls[0].includes('/paper/search/bulk?'));
    assert.equal(defaultUrl.searchParams.get('query'), 'transformers');
    assert.equal(defaultUrl.searchParams.get('fields'), PAPER_FIELDS_DEFAULT);
    assert.equal(overrideUrl.searchParams.get('fields'), 'paperId,title');
}

async function testSearchMatchDefaultAndOverrideFields(): Promise<void> {
    __resetRateLimiterForTests();
    const originalFetch = globalThis.fetch;

    const calls: string[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        calls.push(toUrlString(input));
        return jsonResponse({ data: [] });
    }) as typeof fetch;

    try {
        await scholarPaperSearchMatch({ query: 'transformers' });
        await scholarPaperSearchMatch({ query: 'transformers', fields: 'paperId,title' });
    } finally {
        globalThis.fetch = originalFetch;
    }

    const defaultUrl = new URL(calls[0]);
    const overrideUrl = new URL(calls[1]);

    assert.ok(calls[0].includes('/paper/search/match?'));
    assert.equal(defaultUrl.searchParams.get('fields'), PAPER_FIELDS_DEFAULT);
    assert.equal(overrideUrl.searchParams.get('fields'), 'paperId,title');
}

async function testBatchEndpoints(): Promise<void> {
    __resetRateLimiterForTests();
    const originalFetch = globalThis.fetch;

    const calls: Call[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        calls.push({
            url: toUrlString(input),
            method: init?.method,
            body: init?.body ? JSON.parse(String(init.body)) : undefined,
        });
        return jsonResponse([]);
    }) as typeof fetch;

    try {
        await scholarPaperBatch(['p1', 'p2']);
        await scholarAuthorBatch(['a1', 'a2']);
    } finally {
        globalThis.fetch = originalFetch;
    }

    const paperCall = calls.find((c) => c.url.includes('/paper/batch?'));
    const authorCall = calls.find((c) => c.url.includes('/author/batch?'));

    assert.ok(paperCall);
    assert.ok(authorCall);
    assert.equal(paperCall!.method, 'POST');
    assert.equal(authorCall!.method, 'POST');
    assert.deepEqual(paperCall!.body.ids, ['p1', 'p2']);
    assert.deepEqual(authorCall!.body.ids, ['a1', 'a2']);
}

async function testRecommendSingleEndpoint(): Promise<void> {
    __resetRateLimiterForTests();
    const originalFetch = globalThis.fetch;

    const calls: string[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        calls.push(toUrlString(input));
        return jsonResponse({ recommendedPapers: [] });
    }) as typeof fetch;

    try {
        await scholarRecommendSingle('test-paper-id', { limit: 5 });
    } finally {
        globalThis.fetch = originalFetch;
    }

    assert.ok(calls[0].includes('/recommendations/v1/papers/forpaper/test-paper-id'));
    const url = new URL(calls[0]);
    assert.equal(url.searchParams.get('limit'), '5');
    assert.ok(url.searchParams.get('fields'));
}

async function testRecommendListEndpoint(): Promise<void> {
    __resetRateLimiterForTests();
    const originalFetch = globalThis.fetch;

    const calls: Call[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        calls.push({
            url: toUrlString(input),
            method: init?.method,
            body: init?.body ? JSON.parse(String(init.body)) : undefined,
        });
        return jsonResponse({ recommendedPapers: [] });
    }) as typeof fetch;

    try {
        await scholarRecommendList({
            positivePaperIds: ['p1', 'p2'],
            negativePaperIds: ['n1'],
            limit: 10,
        });
    } finally {
        globalThis.fetch = originalFetch;
    }

    const call = calls[0];
    assert.ok(call);
    assert.ok(call.url.includes('/recommendations/v1/papers/'));
    assert.equal(call.method, 'POST');
    assert.deepEqual(call.body.positivePaperIds, ['p1', 'p2']);
    assert.deepEqual(call.body.negativePaperIds, ['n1']);
}
