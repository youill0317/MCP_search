# MCP Search Server

MCP (Model Context Protocol) server that unifies multiple search providers.

## Supported Services and Tools (30)

| Service | Tools | Cost |
| --- | --- | --- |
| Brave Search | `brave_web_search`, `brave_news_search`, `brave_image_search`, `brave_video_search` | Paid |
| Tavily | `tavily_search`, `tavily_extract`, `tavily_crawl`, `tavily_map`, `tavily_image_search` | Paid |
| Exa | `exa_search`, `exa_contents`, `exa_find_similar`, `exa_search_advanced`, `exa_crawl`, `exa_people_search` | Paid |
| Semantic Scholar | `scholar_paper_search`, `scholar_paper_search_bulk`, `scholar_paper_search_match`, `scholar_paper_details`, `scholar_paper_batch`, `scholar_paper_authors`, `scholar_paper_citations`, `scholar_paper_references`, `scholar_author_search`, `scholar_author_details`, `scholar_author_papers`, `scholar_author_batch`, `scholar_citation_graph` | Free |
| arXiv | `arxiv_search` | Free |
| Utility | `check_usage` | Free |

## Exclusion Policy

This server excludes provider-side generation/assistant tools such as:
- answer/summary/research style tools
- autocomplete/suggest/snippet style tools

## Install

```bash
npm install
npm run build
```

## Configuration

Set API keys in the process environment before startup (or pass them via client JSON `env`).

```bash
BRAVE_API_KEY=your-key
TAVILY_API_KEY=your-key
EXA_API_KEY=your-key
# Optional: SEMANTIC_SCHOLAR_API_KEY=your-key
```

Notes:
- Services without keys are disabled automatically.
- Semantic Scholar and arXiv work without API keys.

## Client Setup

### Claude Code (client JSON)

```json
{
  "mcpServers": {
    "mcp_search": {
      "command": "node",
      "args": [
        "C:/path/to/MCP/MCP_search/dist/index.js"
      ],
      "env": {
        "BRAVE_API_KEY": "your-key",
        "TAVILY_API_KEY": "your-key",
        "EXA_API_KEY": "your-key",
        "SEMANTIC_SCHOLAR_API_KEY": ""
      }
    }
  }
}
```

## check_usage Tool

`check_usage` accepts:
- `brave`
- `tavily`
- `exa`
- `semantic_scholar`
- `arxiv`
- `all` (default)

## Development

```bash
npm run dev
npm run typecheck
npm test
npm run build
npm start
```
