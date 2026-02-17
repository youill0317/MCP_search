// ============================================================
// MCP 서버 설정 및 도구 등록
// ============================================================

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadConfig, getEnabledServices, type ServiceConfig } from './utils/config.js';
import { braveTools } from './tools/brave-search.js';
import { tavilyTools } from './tools/tavily-search.js';
import { exaTools } from './tools/exa-search.js';
import { scholarTools } from './tools/scholar-search.js';
import { arxivTools } from './tools/arxiv-search.js';
import { usageTools } from './tools/usage-checker.js';
import { sanitizeStringParam } from './utils/sanitizer.js';

export function createServer(): McpServer {
    const config = loadConfig();
    const enabledServices = getEnabledServices(config);

    const server = new McpServer({
        name: 'mcp-search',
        version: '1.0.0',
    });

    console.error(`[mcp-search] Enabled services: ${enabledServices.join(', ')}`);

    // ----- Brave Search (API 키 필요) -----
    if (config.braveApiKey) {
        const apiKey = config.braveApiKey;

        server.tool(
            'brave_web_search',
            braveTools.brave_web_search.description,
            braveTools.brave_web_search.schema.shape,
            async (args) => ({
                content: [{ type: 'text', text: JSON.stringify(await braveTools.brave_web_search.handler(args, apiKey), null, 2) }],
            })
        );

        server.tool(
            'brave_news_search',
            braveTools.brave_news_search.description,
            braveTools.brave_news_search.schema.shape,
            async (args) => ({
                content: [{ type: 'text', text: JSON.stringify(await braveTools.brave_news_search.handler(args, apiKey), null, 2) }],
            })
        );

        server.tool(
            'brave_image_search',
            braveTools.brave_image_search.description,
            braveTools.brave_image_search.schema.shape,
            async (args) => ({
                content: [{ type: 'text', text: JSON.stringify(await braveTools.brave_image_search.handler(args, apiKey), null, 2) }],
            })
        );
    } else {
        console.error('[mcp-search] Brave Search disabled (no BRAVE_API_KEY)');
    }

    // ----- Tavily (API 키 필요) -----
    if (config.tavilyApiKey) {
        const apiKey = config.tavilyApiKey;

        server.tool(
            'tavily_search',
            tavilyTools.tavily_search.description,
            tavilyTools.tavily_search.schema.shape,
            async (args) => ({
                content: [{ type: 'text', text: JSON.stringify(await tavilyTools.tavily_search.handler(args, apiKey), null, 2) }],
            })
        );

        server.tool(
            'tavily_extract',
            tavilyTools.tavily_extract.description,
            tavilyTools.tavily_extract.schema.shape,
            async (args) => ({
                content: [{ type: 'text', text: JSON.stringify(await tavilyTools.tavily_extract.handler(args, apiKey), null, 2) }],
            })
        );
    } else {
        console.error('[mcp-search] Tavily disabled (no TAVILY_API_KEY)');
    }

    // ----- Exa (API 키 필요) -----
    if (config.exaApiKey) {
        const apiKey = config.exaApiKey;

        server.tool(
            'exa_search',
            exaTools.exa_search.description,
            exaTools.exa_search.schema.shape,
            async (args) => ({
                content: [{ type: 'text', text: JSON.stringify(await exaTools.exa_search.handler(args, apiKey), null, 2) }],
            })
        );

        server.tool(
            'exa_answer',
            exaTools.exa_answer.description,
            exaTools.exa_answer.schema.shape,
            async (args) => ({
                content: [{ type: 'text', text: JSON.stringify(await exaTools.exa_answer.handler(args, apiKey), null, 2) }],
            })
        );
    } else {
        console.error('[mcp-search] Exa disabled (no EXA_API_KEY)');
    }

    // ----- Semantic Scholar (API 키 불필요) -----
    const scholarApiKey = config.semanticScholarApiKey;

    server.tool(
        'scholar_paper_search',
        scholarTools.scholar_paper_search.description,
        scholarTools.scholar_paper_search.schema.shape,
        async (args) => ({
            content: [{ type: 'text', text: JSON.stringify(await scholarTools.scholar_paper_search.handler(args, scholarApiKey), null, 2) }],
        })
    );

    server.tool(
        'scholar_paper_details',
        scholarTools.scholar_paper_details.description,
        scholarTools.scholar_paper_details.schema.shape,
        async (args) => {
            const cleanId = sanitizeStringParam(args.paper_id);
            console.error(`[mcp-search] scholar_paper_details: raw="${args.paper_id}" clean="${cleanId}"`);
            return {
                content: [{ type: 'text', text: JSON.stringify(await scholarTools.scholar_paper_details.handler({ ...args, paper_id: cleanId }, scholarApiKey), null, 2) }],
            };
        }
    );

    server.tool(
        'scholar_citation_graph',
        scholarTools.scholar_citation_graph.description,
        scholarTools.scholar_citation_graph.schema.shape,
        async (args) => {
            const cleanId = sanitizeStringParam(args.paper_id);
            console.error(`[mcp-search] scholar_citation_graph: raw="${args.paper_id}" clean="${cleanId}"`);
            return {
                content: [{ type: 'text', text: JSON.stringify(await scholarTools.scholar_citation_graph.handler({ ...args, paper_id: cleanId }, scholarApiKey), null, 2) }],
            };
        }
    );

    // ----- arXiv (API 키 불필요) -----
    server.tool(
        'arxiv_search',
        arxivTools.arxiv_search.description,
        arxivTools.arxiv_search.schema.shape,
        async (args) => ({
            content: [{ type: 'text', text: JSON.stringify(await arxivTools.arxiv_search.handler(args), null, 2) }],
        })
    );

    // ----- 사용량 조회 -----
    server.tool(
        'check_usage',
        usageTools.check_usage.description,
        usageTools.check_usage.schema.shape,
        async (args) => ({
            content: [{ type: 'text', text: JSON.stringify(await usageTools.check_usage.handler(args, config), null, 2) }],
        })
    );

    return server;
}
