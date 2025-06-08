import { CrawleeScraperEngine, ScraperDefinition, configManager, createConfig, createLogger } from '../src';
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
  // Create configuration
  const partialConfig = createConfig()
    .browserPool({
      maxSize: 3,
      maxAge: 20 * 60 * 1000, // 20 minutes
      launchOptions: {
        headless: process.env.HEADLESS !== 'false',
        timeout: 30000,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      },
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

  // Create a logger instance using settings from the config if available
  const logger = createLogger({
    level: partialConfig.logging?.level || 'info',
    format: partialConfig.logging?.format || 'text',
    console: true, // Ensure logs go to console for the example
  });

  // Update config manager and get complete configuration
  configManager.updateConfig(partialConfig);
  const config = configManager.getConfig();

  // Initialize engine with the specific config and logger
  const engine = new CrawleeScraperEngine(config, logger);

  // Register scraper
  engine.register(newsScraperDefinition);

  try {
    // Execute scraper
    const searchTerm = process.argv[2] || 'technology';
    logger.info(`Searching for news about: ${searchTerm}`);

    const result = await engine.execute(newsScraperDefinition, searchTerm);

    if (result.success && result.data) {
      logger.info('Successfully scraped article:');
      logger.info(`Title: ${result.data.title}`);
      logger.info(`Content: ${result.data.content}`);
      logger.info(`URL: ${result.data.url}`);
      logger.info(`Scraped at: ${result.data.scrapedAt}`);
      logger.info(`Query used: ${result.data.query}`);
    } else {
      logger.error('Scraping failed:', { message: result.error?.message });
    }
  } catch (error: any) {
    logger.error('Error:', { message: error?.message, stack: error?.stack });
  } finally {
    await engine.shutdown();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { newsScraperDefinition };

