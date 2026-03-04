import assert from 'node:assert/strict';
import { usageTools } from '../src/tools/usage-checker.js';

export async function runUsageCheckerTests(): Promise<void> {
    testSchemaAcceptsNewServices();
    await testSemanticScholarOnly();
    await testArxivOnly();
}

function testSchemaAcceptsNewServices(): void {
    const parsedScholar = usageTools.check_usage.schema.parse({ service: 'semantic_scholar' });
    const parsedArxiv = usageTools.check_usage.schema.parse({ service: 'arxiv' });

    assert.equal(parsedScholar.service, 'semantic_scholar');
    assert.equal(parsedArxiv.service, 'arxiv');
}

async function testSemanticScholarOnly(): Promise<void> {
    const result = await usageTools.check_usage.handler(
        { service: 'semantic_scholar' },
        {}
    );

    assert.equal(result.length, 1);
    assert.equal(result[0].service, 'semantic_scholar');
    assert.equal(result[0].available, true);
}

async function testArxivOnly(): Promise<void> {
    const result = await usageTools.check_usage.handler(
        { service: 'arxiv' },
        {}
    );

    assert.equal(result.length, 1);
    assert.equal(result[0].service, 'arxiv');
    assert.equal(result[0].available, true);
}


