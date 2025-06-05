import { CrawleeScraperEngine, ScraperDefinition, createConfig, configManager } from '../src';
import { ScraperContext } from '../src/core/types';

// Define the output type for news articles
interface NewsArticle {
  query: string;
  title: string;
  content: string;
  scrapedAt: string;
  url: string;
}

// Example: Basic news article scraper
const newsScraperDefinition: ScraperDefinition<string, NewsArticle> = {
  id: 'news-scraper',
  name: 'News Article Scraper',
  description: 'Scrapes news articles from a demo website',
  url: 'https://httpbin.org/html', // Using httpbin as a simple example
  navigation: {
    type: 'direct',
    config: {},
  },
  waitStrategy: {
    type: 'selector',
    config: {
      selector: 'body',
    },
  },
  requiresCaptcha: false,
  parse: async (context: ScraperContext<string, NewsArticle>): Promise<NewsArticle> => {
    const { page } = context;
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Extract content from httpbin HTML page with better error handling
    const title = await page.textContent('h1').catch(() => 'No title found') || 'No title found';
    const content = await page.textContent('p').catch(() => 'No content found') || 'No content found';
    
    return {
      query: context.input,
      title,
      content: content.substring(0, 200) + '...', // Truncate long content
      scrapedAt: new Date().toISOString(),
      url: page.url(),
    };
  },
  options: {
    retries: 2, // Reduce retries for demo
    timeout: 15000, // Reduce timeout to 15 seconds
    loadImages: false,
  },
};

async function main() {
  // Create configuration using configManager
  const config = createConfig()
    .browserPool({
      maxSize: 3,
      maxAge: 20 * 60 * 1000, // 20 minutes
    })
    .defaultOptions({
      retries: 2,
      timeout: 15000,
      loadImages: false,
    })
    .logging({
      level: 'info',
      format: 'text',
    })
    .build();

  // Update the global config manager
  configManager.updateConfig(config);

  // Initialize engine with the configured manager
  const engine = new CrawleeScraperEngine(configManager.getConfig(), console);
  
  // Register scraper
  engine.register(newsScraperDefinition);
  
  try {
    // Execute scraper
    const searchTerm = process.argv[2] || 'technology';
    console.log(`Searching for news about: ${searchTerm}`);
    
    const result = await engine.execute(newsScraperDefinition, searchTerm);
    
    if (result.success && result.data) {
      console.log('Successfully scraped article:');
      console.log(`Title: ${result.data.title}`);
      console.log(`Content: ${result.data.content}`);
      console.log(`URL: ${result.data.url}`);
      console.log(`Scraped at: ${result.data.scrapedAt}`);
      console.log(`Query used: ${result.data.query}`);
    } else {
      console.error('Scraping failed:', result.error?.message);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await engine.shutdown();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { newsScraperDefinition };

