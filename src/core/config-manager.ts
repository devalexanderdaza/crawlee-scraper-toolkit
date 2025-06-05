import { z } from 'zod';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import YAML from 'yaml';
import { merge } from 'lodash';
import { ScraperEngineConfig, BrowserPoolConfig, ScraperExecutionOptions } from './types';
import { schemas } from '@/utils/validators';

/**
 * Configuration source types
 */
export type ConfigSource = 'file' | 'env' | 'programmatic' | 'default';

/**
 * Configuration profile
 */
export interface ConfigProfile {
  name: string;
  description?: string;
  config: Partial<ScraperEngineConfig>;
}

/**
 * Configuration file format
 */
export interface ConfigFile {
  profiles?: Record<string, ConfigProfile>;
  default?: Partial<ScraperEngineConfig>;
  extends?: string[];
}

/**
 * Zod schema for browser pool configuration
 */
const browserPoolConfigSchema = z
  .object({
    maxSize: z.number().int().min(1).max(20).default(5),
    maxAge: z
      .number()
      .int()
      .min(60000)
      .default(30 * 60 * 1000),
    launchOptions: z
      .object({
        headless: z.boolean().default(true),
        args: z
          .array(z.string())
          .default(['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']),
        timeout: schemas.timeout.default(30000),
      })
      .default({}),
    cleanupInterval: z
      .number()
      .int()
      .min(60000)
      .default(5 * 60 * 1000),
  })
  .default({});

/**
 * Zod schema for scraper execution options
 */
const scraperExecutionOptionsSchema = z
  .object({
    retries: schemas.retryCount.default(3),
    retryDelay: z.number().int().min(100).default(1000),
    timeout: schemas.timeout.default(30000),
    useProxyRotation: z.boolean().default(false),
    headers: z.record(z.string()).default({}),
    userAgent: z.string().default('Mozilla/5.0 (compatible; Crawlee-Scraper-Toolkit/1.0)'),
    javascript: z.boolean().default(true),
    loadImages: z.boolean().default(false),
    viewport: z
      .object({
        width: z.number().int().min(320).max(3840).default(1920),
        height: z.number().int().min(240).max(2160).default(1080),
      })
      .default({}),
  })
  .default({});

/**
 * Zod schema for scraper engine configuration
 */
const scraperEngineConfigSchema = z
  .object({
    browserPool: browserPoolConfigSchema,
    defaultOptions: scraperExecutionOptionsSchema,
    plugins: z.array(z.string()).default([]),
    globalHooks: z.record(z.array(z.any())).default({}),
    logging: z
      .object({
        level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
        format: z.enum(['json', 'text']).default('text'),
      })
      .default({}),
  })
  .default({});

/**
 * Configuration manager for the scraper toolkit
 */
export class ConfigManager {
  private config: ScraperEngineConfig;
  private profiles = new Map<string, ConfigProfile>();
  private sources = new Map<ConfigSource, Partial<ScraperEngineConfig>>();

  constructor(autoLoad: boolean = true) {
    this.config = this.getDefaultConfig();
    if (autoLoad) {
      this.loadConfiguration();
    }
  }

  /**
   * Get the current configuration
   */
  getConfig(): ScraperEngineConfig {
    return { ...this.config };
  }

  /**
   * Update configuration programmatically
   */
  updateConfig(updates: Partial<ScraperEngineConfig>): void {
    this.sources.set('programmatic', updates);
    this.rebuildConfig();
  }

  /**
   * Load configuration from file
   */
  loadFromFile(filePath: string): void {
    if (!existsSync(filePath)) {
      throw new Error(`Configuration file not found: ${filePath}`);
    }

    const content = readFileSync(filePath, 'utf-8');
    const configFile = this.parseConfigFile(content, filePath);

    // If configFile has 'default' or 'profiles' keys, treat it as a structured config file
    // Otherwise, treat the entire content as direct configuration
    let configToApply: Partial<ScraperEngineConfig>;

    if (configFile.default ?? configFile.profiles ?? configFile.extends) {
      // Structured config file format
      configToApply = configFile.default ?? {};
    } else {
      // Direct config format - use the entire parsed content as config
      configToApply = configFile as Partial<ScraperEngineConfig>;
    }

    this.sources.set('file', configToApply);

    // Load profiles
    if (configFile.profiles) {
      for (const [name, profile] of Object.entries(configFile.profiles)) {
        this.profiles.set(name, profile);
      }
    }

    // Handle extends
    if (configFile.extends) {
      for (const extendPath of configFile.extends) {
        const resolvedPath = resolve(filePath, '..', extendPath);
        this.loadFromFile(resolvedPath);
      }
    }

    this.rebuildConfig();
  }

  /**
   * Load configuration from environment variables
   */
  loadFromEnv(): void {
    const envConfig: Partial<ScraperEngineConfig> = {};

    // Get current configuration as defaults
    const currentConfig = this.getDefaultConfig();

    // Browser pool configuration
    if (
      process.env.BROWSER_POOL_SIZE ??
      process.env.BROWSER_MAX_AGE_MS ??
      process.env.BROWSER_HEADLESS ??
      process.env.BROWSER_ARGS
    ) {
      envConfig.browserPool = {
        maxSize: process.env.BROWSER_POOL_SIZE
          ? parseInt(process.env.BROWSER_POOL_SIZE, 10)
          : currentConfig.browserPool.maxSize,
        maxAge: process.env.BROWSER_MAX_AGE_MS
          ? parseInt(process.env.BROWSER_MAX_AGE_MS, 10)
          : currentConfig.browserPool.maxAge,
        launchOptions: {
          headless:
            process.env.BROWSER_HEADLESS !== undefined
              ? process.env.BROWSER_HEADLESS !== 'false'
              : currentConfig.browserPool.launchOptions.headless,
          args: process.env.BROWSER_ARGS
            ? process.env.BROWSER_ARGS.split(' ')
            : currentConfig.browserPool.launchOptions.args,
          timeout: currentConfig.browserPool.launchOptions.timeout,
        },
        cleanupInterval: currentConfig.browserPool.cleanupInterval,
      };
    }

    // Default execution options
    if (
      process.env.SCRAPING_MAX_RETRIES ??
      process.env.SCRAPING_TIMEOUT ??
      process.env.SCRAPING_USER_AGENT
    ) {
      envConfig.defaultOptions = {
        retries: process.env.SCRAPING_MAX_RETRIES
          ? parseInt(process.env.SCRAPING_MAX_RETRIES, 10)
          : currentConfig.defaultOptions.retries,
        retryDelay: currentConfig.defaultOptions.retryDelay,
        timeout: process.env.SCRAPING_TIMEOUT
          ? parseInt(process.env.SCRAPING_TIMEOUT, 10)
          : currentConfig.defaultOptions.timeout,
        useProxyRotation: currentConfig.defaultOptions.useProxyRotation,
        headers: currentConfig.defaultOptions.headers,
        userAgent: process.env.SCRAPING_USER_AGENT ?? currentConfig.defaultOptions.userAgent,
        javascript: currentConfig.defaultOptions.javascript,
        loadImages: currentConfig.defaultOptions.loadImages,
        viewport: currentConfig.defaultOptions.viewport,
      };
    }

    // Logging configuration
    if (process.env.LOG_LEVEL ?? process.env.LOG_FORMAT) {
      const validLevels = ['debug', 'info', 'warn', 'error'] as const;
      const validFormats = ['json', 'text'] as const;

      envConfig.logging = {
        level:
          process.env.LOG_LEVEL &&
          validLevels.includes(process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error')
            ? (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error')
            : currentConfig.logging.level,
        format:
          process.env.LOG_FORMAT && validFormats.includes(process.env.LOG_FORMAT as 'json' | 'text')
            ? (process.env.LOG_FORMAT as 'json' | 'text')
            : currentConfig.logging.format,
      };
    }

    this.sources.set('env', envConfig);
    this.rebuildConfig();
  }

  /**
   * Apply a configuration profile
   */
  applyProfile(profileName: string): void {
    const profile = this.profiles.get(profileName);
    if (!profile) {
      throw new Error(`Profile not found: ${profileName}`);
    }

    this.sources.set('programmatic', profile.config);
    this.rebuildConfig();
  }

  /**
   * Get available profiles
   */
  getProfiles(): ConfigProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Validate configuration
   */
  validateConfig(config?: Partial<ScraperEngineConfig>): { valid: boolean; errors: string[] } {
    const configToValidate = config ?? this.config;

    try {
      scraperEngineConfigSchema.parse(configToValidate);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        };
      }
      return { valid: false, errors: [String(error)] };
    }
  }

  /**
   * Export current configuration
   */
  exportConfig(format: 'json' | 'yaml' = 'yaml'): string {
    if (format === 'json') {
      return JSON.stringify(this.config, null, 2);
    } else {
      return YAML.stringify(this.config);
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): ScraperEngineConfig {
    return scraperEngineConfigSchema.parse({});
  }

  /**
   * Parse configuration file content
   */
  private parseConfigFile(content: string, filePath: string): ConfigFile {
    const ext = filePath.split('.').pop()?.toLowerCase();

    try {
      if (ext === 'json') {
        return JSON.parse(content);
      } else if (ext === 'yaml' || ext === 'yml') {
        return YAML.parse(content);
      } else {
        throw new Error(`Unsupported configuration file format: ${ext}`);
      }
    } catch (error) {
      throw new Error(`Failed to parse configuration file ${filePath}: ${error}`);
    }
  }

  /**
   * Rebuild configuration from all sources
   */
  private rebuildConfig(): void {
    const sources = [
      this.sources.get('default') ?? {},
      this.sources.get('file') ?? {},
      this.sources.get('env') ?? {},
      this.sources.get('programmatic') ?? {},
    ];

    const mergedConfig = merge({}, ...sources);

    try {
      this.config = scraperEngineConfigSchema.parse(mergedConfig);
    } catch (error) {
      throw new Error(`Invalid configuration: ${error}`);
    }
  }

  /**
   * Load configuration from various sources
   */
  private loadConfiguration(): void {
    // Set default config
    this.sources.set('default', this.getDefaultConfig());

    // Try to load from common config file locations
    const configPaths = [
      './scraper.config.json',
      './scraper.config.yaml',
      './scraper.config.yml',
      './config/scraper.json',
      './config/scraper.yaml',
      './config/scraper.yml',
    ];

    for (const configPath of configPaths) {
      if (existsSync(configPath)) {
        try {
          this.loadFromFile(configPath);
          break;
        } catch (error) {
          // Continue to next config file
        }
      }
    }

    // Load from environment variables
    this.loadFromEnv();
  }
}

/**
 * Global configuration manager instance
 */
export const configManager = new ConfigManager();

/**
 * Configuration builder for fluent API
 */
export class ConfigBuilder {
  private config: Partial<ScraperEngineConfig> = {};

  /**
   * Set browser pool configuration
   */
  browserPool(config: Partial<BrowserPoolConfig>): ConfigBuilder {
    const merged = { ...this.config.browserPool };
    if (config.maxSize !== undefined) merged.maxSize = config.maxSize;
    if (config.maxAge !== undefined) merged.maxAge = config.maxAge;
    if (config.cleanupInterval !== undefined) merged.cleanupInterval = config.cleanupInterval;
    if (config.launchOptions) {
      merged.launchOptions = { ...merged.launchOptions, ...config.launchOptions };
    }
    this.config.browserPool = merged as BrowserPoolConfig;
    return this;
  }

  /**
   * Set default execution options
   */
  defaultOptions(options: Partial<ScraperExecutionOptions>): ConfigBuilder {
    const merged = { ...this.config.defaultOptions };
    if (options.retries !== undefined) merged.retries = options.retries;
    if (options.retryDelay !== undefined) merged.retryDelay = options.retryDelay;
    if (options.timeout !== undefined) merged.timeout = options.timeout;
    if (options.useProxyRotation !== undefined) merged.useProxyRotation = options.useProxyRotation;
    if (options.headers !== undefined) merged.headers = options.headers;
    if (options.userAgent !== undefined) merged.userAgent = options.userAgent;
    if (options.javascript !== undefined) merged.javascript = options.javascript;
    if (options.loadImages !== undefined) merged.loadImages = options.loadImages;
    if (options.viewport !== undefined) merged.viewport = options.viewport;
    this.config.defaultOptions = merged as ScraperExecutionOptions;
    return this;
  }

  /**
   * Add plugins
   */
  plugins(plugins: string[]): ConfigBuilder {
    this.config.plugins = [...(this.config.plugins ?? []), ...plugins];
    return this;
  }

  /**
   * Set logging configuration
   */
  logging(config: {
    level?: 'debug' | 'info' | 'warn' | 'error';
    format?: 'json' | 'text';
  }): ConfigBuilder {
    const merged = { ...this.config.logging };
    if (config.level !== undefined) merged.level = config.level;
    if (config.format !== undefined) merged.format = config.format;
    this.config.logging = merged as {
      level: 'debug' | 'info' | 'warn' | 'error';
      format: 'json' | 'text';
    };
    return this;
  }

  /**
   * Build the configuration
   */
  build(): Partial<ScraperEngineConfig> {
    return { ...this.config };
  }
}

/**
 * Create a configuration builder
 */
export function createConfig(): ConfigBuilder {
  return new ConfigBuilder();
}
