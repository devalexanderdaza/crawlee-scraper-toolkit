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
