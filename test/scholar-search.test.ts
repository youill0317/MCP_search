import assert from 'node:assert/strict';
import { scholarTools } from '../src/tools/scholar-search.js';
import { __resetRateLimiterForTests } from '../src/utils/rate-limiter.js';

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

export async function runScholarSearchTests(): Promise<void> {
    await testCitationGraph();
    await testRecommendSingleResponseShape();
    await testRecommendListResponseShape();
}

async function testCitationGraph(): Promise<void> {
    __resetRateLimiterForTests();
    const originalFetch = globalThis.fetch;

    const paperId = 'arXiv:1706.03762';
    const detailPattern = `/paper/${encodeURIComponent(paperId)}?`;
    const citationPattern = `/paper/${encodeURIComponent(paperId)}/citations?`;
    const calls: string[] = [];

    globalThis.fetch = (async (input: RequestInfo | URL) => {
        const url = toUrlString(input);
        calls.push(url);

        if (url.includes(citationPattern)) {
            return jsonResponse({
                total: 1,
                data: [
                    {
                        citingPaper: {
                            paperId: 'followup-paper-id',
                            title: 'A Follow-up Paper',
                            abstract: 'Follow-up abstract',
                            url: 'https://example.com/followup',
                            authors: [{ name: 'Researcher One' }],
                            publicationDate: '2020-01-01',
                            citationCount: 5,
                            externalIds: {},
                            openAccessPdf: { url: 'https://example.com/followup.pdf' },
                            fieldsOfStudy: ['Computer Science'],
                        },
                    },
                ],
            });
        }

        if (url.includes(detailPattern)) {
            return jsonResponse({
                paperId: 'base-paper-id',
                title: 'Attention Is All You Need',
                abstract: 'Transformer abstract',
                url: 'https://example.com/base',
                authors: [{ name: 'Ashish Vaswani' }],
                publicationDate: '2017-06-12',
                citationCount: 123456,
                externalIds: { DOI: '10.48550/arXiv.1706.03762' },
                openAccessPdf: { url: 'https://example.com/base.pdf' },
                fieldsOfStudy: ['Computer Science'],
            });
        }

        return new Response('Not found', { status: 404 });
    }) as typeof fetch;

    let result: any;
    try {
        result = await scholarTools.scholar_citation_graph.handler(
            { paper_id: paperId, direction: 'citations', limit: 1 },
            undefined
        );
    } finally {
        globalThis.fetch = originalFetch;
    }

    assert.ok(calls.some((url) => url.includes(detailPattern)));
    assert.ok(calls.some((url) => url.includes(citationPattern)));

    assert.equal(result.paper.title, 'Attention Is All You Need');
    assert.equal(result.paper.url, 'https://example.com/base');
    assert.equal(result.paper.authors[0], 'Ashish Vaswani');
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].title, 'A Follow-up Paper');
}

async function testRecommendSingleResponseShape(): Promise<void> {
    __resetRateLimiterForTests();
    const originalFetch = globalThis.fetch;

    const paperId = 'seed-paper-id';
    const recommendationPattern = `/forpaper/${encodeURIComponent(paperId)}?`;
    const calls: string[] = [];

    globalThis.fetch = (async (input: RequestInfo | URL) => {
        const url = toUrlString(input);
        calls.push(url);

        if (url.includes(recommendationPattern)) {
            return jsonResponse({
                recommendedPapers: [
                    {
                        paperId: 'recommended-paper-id',
                        title: 'Recommended Paper',
                        abstract: 'Recommendation abstract',
                        url: 'https://example.com/recommended',
                        authors: [{ name: 'Researcher Two' }],
                        publicationDate: '2024-01-01',
                        citationCount: 42,
                        externalIds: { DOI: '10.1000/recommended' },
                        openAccessPdf: { url: 'https://example.com/recommended.pdf' },
                        fieldsOfStudy: ['Computer Science'],
                    },
                ],
            });
        }

        return new Response('Not found', { status: 404 });
    }) as typeof fetch;

    let result: any;
    try {
        result = await scholarTools.scholar_recommend_single.handler(
            { paper_id: paperId, limit: 1 },
            undefined
        );
    } finally {
        globalThis.fetch = originalFetch;
    }

    assert.ok(calls.some((url) => url.includes(recommendationPattern)));
    assert.equal(result.length, 1);
    assert.equal(result[0].title, 'Recommended Paper');
    assert.equal(result[0].authors[0], 'Researcher Two');
}

async function testRecommendListResponseShape(): Promise<void> {
    __resetRateLimiterForTests();
    const originalFetch = globalThis.fetch;

    const recommendationPattern = '/papers/?';
    const calls: string[] = [];

    globalThis.fetch = (async (input: RequestInfo | URL) => {
        const url = toUrlString(input);
        calls.push(url);

        if (url.includes(recommendationPattern)) {
            return jsonResponse({
                recommendedPapers: [
                    {
                        paperId: 'list-recommended-paper-id',
                        title: 'List Recommended Paper',
                        abstract: 'List recommendation abstract',
                        url: 'https://example.com/list-recommended',
                        authors: [{ name: 'Researcher Three' }],
                        publicationDate: '2025-01-01',
                        citationCount: 7,
                        externalIds: { DOI: '10.1000/list-recommended' },
                        openAccessPdf: { url: 'https://example.com/list-recommended.pdf' },
                        fieldsOfStudy: ['Physics'],
                    },
                ],
            });
        }

        return new Response('Not found', { status: 404 });
    }) as typeof fetch;

    let result: any;
    try {
        result = await scholarTools.scholar_recommend_list.handler(
            { positive_paper_ids: ['seed-a'], negative_paper_ids: ['seed-b'], limit: 1 },
            undefined
        );
    } finally {
        globalThis.fetch = originalFetch;
    }

    assert.ok(calls.some((url) => url.includes(recommendationPattern)));
    assert.equal(result.length, 1);
    assert.equal(result[0].title, 'List Recommended Paper');
    assert.equal(result[0].authors[0], 'Researcher Three');
}

