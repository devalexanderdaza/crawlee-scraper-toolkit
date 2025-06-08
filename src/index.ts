/**
 * @fileoverview Crawlee Scraper Toolkit - Main Entry Point
 *
 * A comprehensive TypeScript toolkit for building robust web scrapers with Crawlee,
 * featuring maximum configurability, plugin system, and CLI generator.
 *
 * @author Alexander Daza <dev.alexander.daza@gmail.com>
 * @version 1.0.0
 * @license MIT
 *
 * @example
 * ```typescript
 * import { CrawleeScraperEngine, createConfig, ScraperDefinition } from 'crawlee-scraper-toolkit';
 *
 * // Create a simple scraper
 * const scraper: ScraperDefinition = {
 *   id: 'my-scraper',
 *   name: 'My Web Scraper',
 *   url: 'https://example.com',
 *   navigation: { type: 'direct', config: {} },
 *   waitStrategy: { type: 'selector', config: { selector: 'body' } },
 *   requiresCaptcha: false,
 *   parse: async (context) => {
 *     return {
 *       title: await context.page.textContent('h1'),
 *       content: await context.page.textContent('p')
 *     };
 *   }
 * };
 *
 * // Configure and run
 * const config = createConfig().build();
 * const engine = new CrawleeScraperEngine(config);
 * const result = await engine.execute(scraper, 'input');
 * ```
 */

// Core exports
export { CrawleeScraperEngine } from './core/scraper';
export { BrowserPool, defaultBrowserPoolConfig } from './core/browser-pool';
export { ConfigManager, configManager, createConfig } from './core/config-manager';

// Type exports
export type {
  ScraperDefinition,
  ScraperExecutionOptions,
  ScraperResult,
  ScraperContext,
  ScraperEngine,
  ScraperEngineConfig,
  ScraperPlugin,
  ScraperHook,
  HookHandler,
  BrowserInstance,
  BrowserPoolConfig,
  NavigationStrategy,
  WaitStrategy,
} from './core/types';

// Plugin exports
export { RetryPlugin, CachePlugin, ProxyPlugin, RateLimitPlugin, MetricsPlugin } from './plugins';

// Utility exports
export { createLogger, defaultLogger } from './utils/logger';
export type { Logger, LoggerConfig } from './utils/logger';

export { validators, schemas, validateWithSchema } from './utils/validators';
export type { ValidationResult } from './utils/validators';

// CLI exports (for programmatic usage)
export { generateScraper } from './cli/commands/generate';
export { initProject } from './cli/commands/init';
export { validateConfig } from './cli/commands/validate';
export { runScraper } from './cli/commands/run';
export { getTemplate, getAvailableTemplates } from './cli/templates';

// Re-export commonly used types from dependencies
export type { Page, Browser, BrowserContext } from 'playwright';
