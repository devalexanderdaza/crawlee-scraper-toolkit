import chalk from 'chalk';
import ora from 'ora';
import { existsSync } from 'fs';
import { CrawleeScraperEngine, ScraperDefinition } from '@/core/scraper'; // Added ScraperDefinition
import { ConfigManager } from '@/core/config-manager';
import { createLogger } from '@/utils/logger';
import { resolve as pathResolve, isAbsolute } from 'path'; // For resolving path

/**
 * Run options
 */
export interface RunOptions {
  /** Path to the compiled scraper JS file (e.g., ./dist/my-scraper/index.js or ./scrapers/my-scraper.js) */
  scraper?: string;
  input?: string;
  config?: string;
  profile?: string;
}

/**
 * Run a scraper from its definition file.
 */
export async function runScraper(options: RunOptions): Promise<void> {
  console.log(chalk.blue('🚀 Running Scraper'));
  console.log();

  if (!options.scraper) {
    console.error(chalk.red('Scraper file path is required. Use --scraper <path/to/scraper.js> option.'));
    process.exit(1);
  }

  if (!options.input) {
    console.error(chalk.red('Input is required. Use --input option.'));
    process.exit(1);
  }

  const scraperPath = isAbsolute(options.scraper) ? options.scraper : pathResolve(process.cwd(), options.scraper);

  if (!existsSync(scraperPath)) {
    console.error(chalk.red(`Scraper file not found: ${scraperPath}`));
    process.exit(1);
  }

  const spinner = ora('Initializing scraper engine...').start();

  try {
    // Load configuration
    const configManager = new ConfigManager(); // Autoloads default configs and env vars
    
    if (options.config) {
      if (existsSync(options.config)) {
        configManager.loadFromFile(options.config);
      } else {
        spinner.warn(chalk.yellow(`Specified config file ${options.config} not found. Using default/env configuration.`));
      }
    }
    
    if (options.profile) {
      try {
        configManager.applyProfile(options.profile);
      } catch (e: any) {
        spinner.fail(chalk.red(`Failed to apply profile "${options.profile}": ${e.message}`));
        process.exit(1);
      }
    }

    const config = configManager.getConfig();
    const logger = createLogger({
      ...config.logging,
      console: true, // Ensure CLI output goes to console
    });

    // Initialize scraper engine
    const engine = new CrawleeScraperEngine(config, logger);
    
    spinner.text = `Loading scraper definition from ${scraperPath}...`;

    // Dynamically import the scraper module
    const scraperModule = await import(scraperPath);
    
    // Look for the exported 'definition'
    const definition = scraperModule.definition as ScraperDefinition<unknown, unknown>;
    // Add more robust checking if definition is ScraperDefinition type if needed

    if (!definition || typeof definition.parse !== 'function' || !definition.id || !definition.url) {
      spinner.fail(chalk.red(`No valid 'definition' export found in ${scraperPath}.`));
      console.log(chalk.yellow('Ensure your scraper file exports a "ScraperDefinition" object as `export const definition = { ... };`'));
      process.exit(1);
    }

    // Register the dynamically loaded definition
    // (Engine currently doesn't strictly need registration if definition is passed directly to execute,
    // but registration is good practice if engine might be used for more than one exec, or if plugins rely on it)
    engine.register(definition);

    spinner.text = `Executing scraper: ${definition.name || definition.id}`;

    // Execute scraper
    const startTime = Date.now();
    const result = await engine.execute(definition, options.input);
    const duration = Date.now() - startTime;

    if (result.success) {
      spinner.succeed(chalk.green('Scraper executed successfully'));
      
      console.log();
      console.log(chalk.yellow('Results:'));
      console.log(JSON.stringify(result.data, null, 2));
      
      console.log();
      console.log(chalk.gray(`Execution time: ${duration}ms`));
      console.log(chalk.gray(`Attempts: ${result.attempts}`));
      
    } else {
      spinner.fail(chalk.red('Scraper execution failed'));
      
      console.log();
      console.log(chalk.red('Error:'));
      console.log(result.error?.message || 'Unknown error');
      
      console.log();
      console.log(chalk.gray(`Execution time: ${duration}ms`));
      console.log(chalk.gray(`Attempts: ${result.attempts}`));
      
      process.exit(1);
    }

    // Shutdown engine
    await engine.shutdown();
    
  } catch (error) {
    spinner.fail(chalk.red('Failed to run scraper'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

