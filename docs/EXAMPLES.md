# Examples Documentation

This document provides detailed explanations of the included examples.

**Note:** The code snippets provided below are simplified excerpts. For the complete and runnable source code, please refer to the files in the `/examples` directory of this repository.

## 🗞️ News Scraper Example

The news scraper demonstrates basic scraping functionality:

```typescript
// Basic configuration
const newsScraperDefinition: ScraperDefinition<string, NewsArticle> = {
  id: 'news-scraper',
  name: 'News Article Scraper',
  url: 'https://httpbin.org/html',
  navigation: { type: 'direct' },
  waitStrategy: { type: 'selector', config: { selector: 'body' } },
  parse: async (context) => {
    // Extract content
    return {
      title: await page.textContent('h1'),
      content: await page.textContent('p'),
      // ... more fields
    };
  }
};
```

**Key Features:**
- Simple URL navigation
- Content extraction
- Error handling
- TypeScript types

## 🛍️ Advanced Product Scraper Example

The product scraper shows advanced features:

```typescript
const productScraperDefinition: ScraperDefinition<string, ProductSearchResult> = {
  id: 'product-scraper',
  hooks: {
    beforeRequest: [/* custom hooks */],
    afterRequest: [/* cleanup hooks */],
    onError: [/* error handling */],
    onRetry: [/* retry logic */]
  },
  parse: async (context) => {
    // Complex data extraction
  }
};
```

**Advanced Features:**
- Plugin system (Retry, Cache, Metrics)
- Custom hooks
- Screenshot capture
- Performance metrics
- Complex data structures

## 🚀 Running Examples

```bash
# Run news scraper
pnpm run example:news

# Run product scraper
pnpm run example:products "search term"

# With custom parameters
pnpm run example:news "custom search"
```

## 🔧 Customization

Both examples can be customized by:
- Modifying the scraper definitions
- Adding custom hooks
- Changing URLs and selectors
- Adding validation logic
- Implementing custom plugins

