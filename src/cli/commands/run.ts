import chalk from 'chalk';
import ora from 'ora';
import { existsSync } from 'fs';
import { CrawleeScraperEngine } from '@/core/scraper';
import { ConfigManager } from '@/core/config-manager';
import { createLogger } from '@/utils/logger';

/**
 * Run options
 */
export interface RunOptions {
  scraper?: string;
  input?: string;
  config?: string;
  profile?: string;
}

/**
 * Run a scraper
 */
export async function runScraper(options: RunOptions): Promise<void> {
  console.log(chalk.blue('🚀 Running Scraper'));
  console.log();

  if (!options.scraper) {
    console.error(chalk.red('Scraper ID is required. Use --scraper option.'));
    process.exit(1);
  }

  if (!options.input) {
    console.error(chalk.red('Input is required. Use --input option.'));
    process.exit(1);
  }

  const spinner = ora('Initializing scraper engine...').start();

  try {
    // Load configuration
    const configManager = new ConfigManager();
    
    if (options.config && existsSync(options.config)) {
      configManager.loadFromFile(options.config);
    }
    
    if (options.profile) {
      configManager.applyProfile(options.profile);
    }

    const config = configManager.getConfig();
    const logger = createLogger(config.logging);

    // Initialize scraper engine
    const engine = new CrawleeScraperEngine(config, logger);
    
    spinner.text = 'Loading scraper definition...';

    // Try to find scraper definition
    const definition = engine.getDefinition(options.scraper);
    
    if (!definition) {
      spinner.fail(chalk.red(`Scraper not found: ${options.scraper}`));
      
      const available = engine.listDefinitions();
      if (available.length > 0) {
        console.log();
        console.log(chalk.yellow('Available scrapers:'));
        available.forEach(def => {
          console.log(`  - ${def.id}: ${def.name || 'No name'}`);
        });
      } else {
        console.log();
        console.log(chalk.yellow('No scrapers registered. Use "crawlee-scraper generate" to create one.'));
      }
      
      process.exit(1);
    }

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

