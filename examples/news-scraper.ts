import { CrawleeScraperEngine, ScraperDefinition, createConfig } from 'crawlee-scraper-toolkit';

// Example: Basic news article scraper
const newsScraperDefinition: ScraperDefinition<string, any> = {
  id: 'news-scraper',
  name: 'News Article Scraper',
  description: 'Scrapes news articles from a news website',
  url: 'https://example-news.com/search',
  navigation: {
    type: 'form',
    config: {
      inputSelector: 'input[name="q"]',
      submitSelector: 'button[type="submit"]',
    },
  },
  waitStrategy: {
    type: 'selector',
    config: {
      selector: '.article-list',
    },
  },
  requiresCaptcha: false,
  parse: async (context) => {
    const { page } = context;
    
    // Extract articles
    const articles = await page.$$eval('.article-item', elements => {
      return elements.map(el => ({
        title: el.querySelector('h2')?.textContent?.trim() || '',
        summary: el.querySelector('.summary')?.textContent?.trim() || '',
        url: el.querySelector('a')?.href || '',
        publishDate: el.querySelector('.date')?.textContent?.trim() || '',
        author: el.querySelector('.author')?.textContent?.trim() || '',
      }));
    });
    
    return {
      query: context.input,
      articles,
      totalFound: articles.length,
      scrapedAt: new Date().toISOString(),
    };
  },
  options: {
    retries: 3,
    timeout: 30000,
    loadImages: false,
  },
};

async function main() {
  // Create configuration
  const config = createConfig()
    .browserPool({
      maxSize: 3,
      maxAge: 20 * 60 * 1000, // 20 minutes
    })
    .defaultOptions({
      retries: 3,
      timeout: 30000,
      loadImages: false,
    })
    .logging({
      level: 'info',
      format: 'text',
    })
    .build();

  // Initialize engine
  const engine = new CrawleeScraperEngine(config, console);
  
  // Register scraper
  engine.register(newsScraperDefinition);
  
  try {
    // Execute scraper
    const searchTerm = process.argv[2] || 'technology';
    console.log(`Searching for news about: ${searchTerm}`);
    
    const result = await engine.execute(newsScraperDefinition, searchTerm);
    
    if (result.success) {
      console.log(`Found ${result.data.totalFound} articles:`);
      result.data.articles.forEach((article: any, index: number) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`   Author: ${article.author}`);
        console.log(`   Date: ${article.publishDate}`);
        console.log(`   URL: ${article.url}`);
        console.log(`   Summary: ${article.summary.substring(0, 100)}...`);
      });
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

