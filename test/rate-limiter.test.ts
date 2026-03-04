import assert from 'node:assert/strict';
import {
    __getBucketSnapshotForTests,
    __resetRateLimiterForTests,
    checkRateLimit,
} from '../src/utils/rate-limiter.js';

export async function runRateLimiterTests(): Promise<void> {
    __resetRateLimiterForTests();

    const start = Date.now();
    await Promise.all([
        checkRateLimit('semantic_scholar'),
        checkRateLimit('semantic_scholar'),
        checkRateLimit('semantic_scholar'),
    ]);
    const elapsed = Date.now() - start;

    assert.ok(elapsed >= 1800, `expected at least ~1800ms due to 1 req/sec, got ${elapsed}ms`);

    const snapshot = __getBucketSnapshotForTests('semantic_scholar');
    assert.ok(snapshot);
    assert.ok(snapshot!.tokens >= 0, `tokens should not be negative, got ${snapshot!.tokens}`);
}


