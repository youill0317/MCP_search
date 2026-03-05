import { runArxivApiTests } from './arxiv-api.test.js';
import { runBraveApiTests } from './brave-api.test.js';
import { runExaApiTests } from './exa-api.test.js';
import { runRateLimiterTests } from './rate-limiter.test.js';
import { runScholarApiTests } from './scholar-api.test.js';
import { runScholarSearchTests } from './scholar-search.test.js';
import { runTavilyApiTests } from './tavily-api.test.js';
import { runUsageCheckerTests } from './usage-checker.test.js';

type TestCase = {
    name: string;
    run: () => Promise<void>;
};

const tests: TestCase[] = [
    { name: 'arxiv-api', run: runArxivApiTests },
    { name: 'brave-api', run: runBraveApiTests },
    { name: 'tavily-api', run: runTavilyApiTests },
    { name: 'exa-api', run: runExaApiTests },
    { name: 'rate-limiter', run: runRateLimiterTests },
    { name: 'scholar-api', run: runScholarApiTests },
    { name: 'scholar-search', run: runScholarSearchTests },
    { name: 'usage-checker', run: runUsageCheckerTests },
];

let failed = 0;

for (const testCase of tests) {
    try {
        await testCase.run();
        console.log(`PASS ${testCase.name}`);
    } catch (error) {
        failed += 1;
        console.error(`FAIL ${testCase.name}`);
        console.error(error);
    }
}

if (failed > 0) {
    process.exitCode = 1;
    console.error(`\n${failed} test group(s) failed.`);
} else {
    console.log('\nAll test groups passed.');
}
