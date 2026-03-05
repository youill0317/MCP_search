import assert from 'node:assert/strict';
import { exaContents, exaCrawl, exaFindSimilar, exaPeopleSearch, exaSearch, exaSearchAdvanced } from '../src/services/exa-api.js';
import { exaTools } from '../src/tools/exa-search.js';
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

export async function runExaApiTests(): Promise<void> {
    await testEndpointsAndBodies();
    await testAdvancedAndSpecializedEndpoints();
    testExaAnswerRemoved();
}

async function testEndpointsAndBodies(): Promise<void> {
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
        await exaSearch('k', { query: 'mcp', include_text: true });
        await exaContents('k', { urls: ['https://example.com'] });
        await exaFindSimilar('k', { url: 'https://example.com', include_text: true });
    } finally {
        globalThis.fetch = originalFetch;
    }

    assert.ok(calls.some((c) => c.url.endsWith('/search')));
    assert.ok(calls.some((c) => c.url.endsWith('/contents')));
    assert.ok(calls.some((c) => c.url.endsWith('/findSimilar')));

    const searchCall = calls.find((c) => c.url.endsWith('/search'))!;
    assert.equal(searchCall.body.query, 'mcp');
    assert.deepEqual(searchCall.body.contents, { text: true });

    const contentCall = calls.find((c) => c.url.endsWith('/contents'))!;
    assert.deepEqual(contentCall.body.ids, ['https://example.com']);
}

function testExaAnswerRemoved(): void {
    assert.equal(Object.prototype.hasOwnProperty.call(exaTools, 'exa_answer'), false);
}

async function testAdvancedAndSpecializedEndpoints(): Promise<void> {
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
        await exaSearchAdvanced('k', {
            query: 'agent framework',
            include_domains: ['github.com'],
            livecrawl: 'fallback',
            text_max_characters: 5000,
        });
        await exaCrawl('k', {
            url: 'https://example.com/post',
            max_characters: 1234,
        });
        await exaPeopleSearch('k', {
            query: 'openai ceo',
            num_results: 7,
            text_max_characters: 2222,
        });
    } finally {
        globalThis.fetch = originalFetch;
    }

    const advancedCall = calls.find((c) => c.url.endsWith('/search') && c.body?.query === 'agent framework');
    const crawlCall = calls.find((c) => c.url.endsWith('/contents') && c.body?.ids?.[0] === 'https://example.com/post');
    const peopleCall = calls.find((c) => c.url.endsWith('/search') && c.body?.category === 'people');

    assert.ok(advancedCall);
    assert.ok(crawlCall);
    assert.ok(peopleCall);

    assert.deepEqual(advancedCall!.body.includeDomains, ['github.com']);
    assert.equal(advancedCall!.body.contents.livecrawl, 'fallback');
    assert.equal(advancedCall!.body.contents.text.maxCharacters, 5000);

    assert.deepEqual(crawlCall!.body.ids, ['https://example.com/post']);
    assert.equal(crawlCall!.body.contents.text.maxCharacters, 1234);
    assert.equal(crawlCall!.body.contents.livecrawl, 'preferred');

    assert.equal(peopleCall!.body.query, 'openai ceo profile');
    assert.equal(peopleCall!.body.numResults, 7);
    assert.equal(peopleCall!.body.contents.text.maxCharacters, 2222);
}
