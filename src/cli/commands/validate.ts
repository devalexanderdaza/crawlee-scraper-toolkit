import chalk from 'chalk';
import { existsSync } from 'fs';
import { ConfigManager } from '@/core/config-manager';

/**
 * Validation options
 */
export interface ValidateOptions {
  config?: string;
}

/**
 * Validate scraper configuration
 */
export async function validateConfig(options: ValidateOptions): Promise<void> {
  console.log(chalk.blue('🔍 Validating Configuration'));
  console.log();

  const configPath = options.config || './scraper.config.yaml';

  if (!existsSync(configPath)) {
    console.error(chalk.red(`Configuration file not found: ${configPath}`));
    process.exit(1);
  }

  try {
    const configManager = new ConfigManager();
    configManager.loadFromFile(configPath);
    
    const validation = configManager.validateConfig();
    
    if (validation.valid) {
      console.log(chalk.green('✅ Configuration is valid'));
      
      // Show configuration summary
      const config = configManager.getConfig();
      console.log();
      console.log(chalk.yellow('Configuration Summary:'));
      console.log(`  Browser Pool Size: ${config.browserPool.maxSize}`);
      console.log(`  Default Retries: ${config.defaultOptions.retries}`);
      console.log(`  Default Timeout: ${config.defaultOptions.timeout}ms`);
      console.log(`  Logging Level: ${config.logging.level}`);
      console.log(`  Plugins: ${config.plugins.length}`);
      
      // Show profiles if any
      const profiles = configManager.getProfiles();
      if (profiles.length > 0) {
        console.log();
        console.log(chalk.yellow('Available Profiles:'));
        profiles.forEach(profile => {
          console.log(`  - ${profile.name}: ${profile.description || 'No description'}`);
        });
      }
      
    } else {
      console.log(chalk.red('❌ Configuration validation failed'));
      console.log();
      validation.errors.forEach(error => {
        console.log(chalk.red(`  • ${error}`));
      });
      process.exit(1);
    }
    
  } catch (error) {
    console.error(chalk.red('Failed to validate configuration:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

