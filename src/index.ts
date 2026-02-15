#!/usr/bin/env node
// ============================================================
// MCP Search Server — 엔트리포인트
// ============================================================

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

async function main() {
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[mcp-search] Server started on stdio transport');
}

main().catch((error) => {
    console.error('[mcp-search] Fatal error:', error);
    process.exit(1);
});
