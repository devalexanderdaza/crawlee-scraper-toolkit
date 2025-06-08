import { z } from 'zod';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import YAML from 'yaml';
import { merge } from 'lodash';
import { ScraperEngineConfig, BrowserPoolConfig, ScraperExecutionOptions } from './types';
import { schemas } from '@/utils/validators';

/**
 * @file Manages scraper engine configurations from various sources like files,
 * environment variables, and programmatic updates. It supports configuration profiles
 * and a fluent builder API for creating configurations.
 */

/**
 * Represents the source from which a configuration part was loaded.
 * - `file`: Configuration loaded from a YAML or JSON file.
 * - `env`: Configuration loaded from environment variables.
 * - `programmatic`: Configuration applied directly via code (e.g., `updateConfig`, `applyProfile`).
 * - `default`: The base default configuration of the toolkit.
 */
export type ConfigSource = 'file' | 'env' | 'programmatic' | 'default';

/**
 * Defines the structure for a configuration profile, allowing predefined sets of configurations.
 */
export interface ConfigProfile {
  /** The unique name of the profile (e.g., "development", "production_large_pool"). */
  name: string;
  /** An optional description for what this profile is intended for. */
  description?: string;
  /** The partial scraper engine configuration that this profile applies. */
  config: Partial<ScraperEngineConfig>;
}

/**
 * Defines the expected structure of a configuration file (e.g., `scraper.config.yaml`).
 */
export interface ConfigFile {
  /**
   * A map of configuration profiles, where each key is the profile name.
   * @example
   * profiles:
   *   development:
   *     config: { browserPool: { maxSize: 2 } }
   *   production:
   *     config: { browserPool: { maxSize: 10 } }
   */
  profiles?: Record<string, ConfigProfile>;
  /** Default configuration settings to be applied if no specific profile is chosen or to serve as a base. */
  default?: Partial<ScraperEngineConfig>;
  /**
   * An array of paths to other configuration files to extend from.
   * Paths are relative to the current configuration file.
   * Configurations are merged shallowly, with later files overriding earlier ones.
   * @example
   * extends:
   *   - ./base.config.yaml
   *   - ./production.config.yaml
   */
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
 * Manages the loading, merging, and validation of scraper engine configurations.
 * Configurations can be sourced from files (YAML/JSON), environment variables,
 * programmatic updates, and predefined profiles.
 * It follows a layered approach for merging configurations:
 * Defaults < File < Environment Variables < Programmatic Updates/Profiles.
 */
export class ConfigManager {
  private config: ScraperEngineConfig;
  private profiles = new Map<string, ConfigProfile>();
  private sources = new Map<ConfigSource, Partial<ScraperEngineConfig>>();

  /**
   * Creates an instance of ConfigManager.
   * @param autoLoad If `true` (default), automatically loads configuration from
   * default file paths (e.g., `./scraper.config.yaml`) and environment variables upon instantiation.
   */
  constructor(autoLoad: boolean = true) {
    this.config = this.getDefaultConfig();
    if (autoLoad) {
      this.loadConfiguration();
    }
  }

  /**
   * Retrieves a deep copy of the current, fully merged scraper engine configuration.
   * @returns The current `ScraperEngineConfig` object.
   */
  getConfig(): ScraperEngineConfig {
    // Return a deep copy to prevent external modification of the internal state.
    // Lodash merge with an empty object as the first argument achieves this.
    return merge({}, this.config);
  }

  /**
   * Programmatically updates the current configuration with the provided partial configuration.
   * These updates are applied with the highest precedence, overriding any other sources.
   * @param updates A `Partial<ScraperEngineConfig>` object containing the configuration updates.
   */
  updateConfig(updates: Partial<ScraperEngineConfig>): void {
    this.sources.set('programmatic', updates);
    this.rebuildConfig();
  }

  /**
   * Loads configuration from a specified file path. Supports JSON and YAML formats.
   * The loaded configuration is merged into the existing configuration.
   * Can handle `extends` within configuration files to inherit from other files.
   * @param filePath The absolute or relative path to the configuration file.
   * @throws Error if the file is not found, unsupported format, or parsing fails.
   */
  loadFromFile(filePath: string): void {
    const resolvedPath = resolve(filePath); // Resolve to absolute path
    if (!existsSync(resolvedPath)) {
      throw new Error(`Configuration file not found: ${resolvedPath}`);
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
   * Loads configuration settings from predefined environment variables.
   * Environment variables typically override file configurations but are overridden
   * by programmatic updates.
   * Recognized environment variables include:
   * - `BROWSER_POOL_SIZE`, `BROWSER_MAX_AGE_MS`, `BROWSER_HEADLESS`, `BROWSER_ARGS`
   * - `SCRAPING_MAX_RETRIES`, `SCRAPING_TIMEOUT`, `SCRAPING_USER_AGENT`
   * - `LOG_LEVEL`, `LOG_FORMAT`
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
   * Applies a named configuration profile to the current configuration.
   * The profile's configuration is treated as a programmatic update,
   * overriding other sources.
   * @param profileName The name of the profile to apply (must be loaded from a config file).
   * @throws Error if the specified profile name is not found.
   */
  applyProfile(profileName: string): void {
    const profile = this.profiles.get(profileName);
    if (!profile) {
      throw new Error(`Profile not found: ${profileName}`);
    }
    // Applying a profile is like a programmatic update with high precedence.
    this.sources.set('programmatic', profile.config);
    this.rebuildConfig();
  }

  /**
   * Retrieves a list of all currently loaded configuration profiles.
   * @returns An array of `ConfigProfile` objects.
   */
  getProfiles(): ConfigProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Validates a given configuration object (or the current configuration if none is provided)
   * against the defined Zod schema.
   * @param config Optional. A `Partial<ScraperEngineConfig>` to validate. If not provided,
   * the ConfigManager's current internal configuration is validated.
   * @returns An object with `valid: boolean` and `errors: string[]`.
   *          `errors` is an array of human-readable error messages if validation fails.
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
      // Should not happen if Zod is the only validation mechanism
      return { valid: false, errors: [String(error)] };
    }
  }

  /**
   * Exports the current, fully merged configuration to a string in the specified format.
   * @param format The desired output format, either 'json' or 'yaml'. Defaults to 'yaml'.
   * @returns A string representation of the current configuration.
   */
  exportConfig(format: 'json' | 'yaml' = 'yaml'): string {
    if (format === 'json') {
      return JSON.stringify(this.config, null, 2);
    } else {
      // 'yaml'
      return YAML.stringify(this.config);
    }
  }

  /**
   * Gets the default configuration by parsing an empty object with the Zod schema,
   * which populates all default values.
   * @returns The default `ScraperEngineConfig`.
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
 * A global, pre-initialized instance of `ConfigManager`.
 * This instance automatically loads configurations from default files and environment variables
 * upon module initialization, making it ready for immediate use.
 * @example
 * import { configManager } from 'crawlee-scraper-toolkit';
 * const currentConfig = configManager.getConfig();
 */
export const configManager = new ConfigManager();

/**
 * Provides a fluent (builder) API for programmatically constructing a `ScraperEngineConfig` object.
 * Useful for creating configurations in code rather than relying on files or environment variables.
 * An instance of this builder is typically obtained via the `createConfig()` factory function.
 * @example
 * import { createConfig } from 'crawlee-scraper-toolkit';
 * const myConfig = createConfig()
 *   .browserPool({ maxSize: 3 })
 *   .defaultOptions({ retries: 1 })
 *   .logging({ level: 'debug' })
 *   .build();
 */
export class ConfigBuilder {
  private config: Partial<ScraperEngineConfig> = {};

  /**
   * Sets or updates the browser pool configuration.
   * Merges provided partial configuration with existing browser pool settings in the builder.
   * @param config A `Partial<BrowserPoolConfig>` object.
   * @returns The `ConfigBuilder` instance for chaining.
   */
  browserPool(config: Partial<BrowserPoolConfig>): ConfigBuilder {
    const merged = { ...this.config.browserPool }; // Start with existing or empty
    // Selectively merge properties to avoid overwriting defaults with undefined
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
   * Sets or updates the default scraper execution options.
   * Merges provided partial options with existing default options in the builder.
   * @param options A `Partial<ScraperExecutionOptions>` object.
   * @returns The `ConfigBuilder` instance for chaining.
   */
  defaultOptions(options: Partial<ScraperExecutionOptions>): ConfigBuilder {
    const merged = { ...this.config.defaultOptions }; // Start with existing or empty
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
   * Adds a list of plugin names or paths to the configuration.
   * These plugins will be loaded by the `ScraperEngine`.
   * @param plugins An array of strings, where each string is a plugin name or a path to a plugin module.
   * @returns The `ConfigBuilder` instance for chaining.
   */
  plugins(plugins: string[]): ConfigBuilder {
    this.config.plugins = [...(this.config.plugins ?? []), ...plugins];
    return this;
  }

  /**
   * Sets or updates the logging configuration.
   * Merges provided partial logging configuration with existing settings in the builder.
   * @param config An object with optional `level` and `format` properties.
   * @returns The `ConfigBuilder` instance for chaining.
   */
  logging(config: {
    level?: 'debug' | 'info' | 'warn' | 'error';
    format?: 'json' | 'text';
  }): ConfigBuilder {
    const merged = { ...this.config.logging }; // Start with existing or empty
    if (config.level !== undefined) merged.level = config.level;
    if (config.format !== undefined) merged.format = config.format;
    this.config.logging = merged as {
      level: 'debug' | 'info' | 'warn' | 'error';
      format: 'json' | 'text';
    };
    return this;
  }

  /**
   * Finalizes the configuration building process and returns the constructed
   * partial `ScraperEngineConfig` object. This object can then be used to
   * initialize a `ScraperEngine` or update a `ConfigManager`.
   * @returns A `Partial<ScraperEngineConfig>` object.
   */
  build(): Partial<ScraperEngineConfig> {
    // Returns a copy to prevent further modification of the internal state via the returned object.
    return merge({}, this.config);
  }
}

/**
 * Factory function that creates and returns a new `ConfigBuilder` instance.
 * This is the recommended way to start programmatically building a configuration.
 * @returns A new `ConfigBuilder` instance.
 * @example
 * import { createConfig } from 'crawlee-scraper-toolkit';
 * const config = createConfig().defaultOptions({ timeout: 60000 }).build();
 */
export function createConfig(): ConfigBuilder {
  return new ConfigBuilder();
}
