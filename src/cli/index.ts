#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { resolve as pathResolve } from 'path';
import { generateScraper } from './commands/generate';
import { initProject } from './commands/init';
import { validateConfig } from './commands/validate';
import { runScraper } from './commands/run';

const program = new Command();

program
  .name('crawlee-scraper')
  .description('CLI tool for Crawlee Scraper Toolkit');

// Get version from package.json
try {
  const packageJsonPath = pathResolve(__dirname, '../../package.json');
  const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(packageJsonContent);
  program.version(packageJson.version);
} catch (error) {
  console.warn(chalk.yellow('Could not read version from package.json. Using fallback version.'));
  // Fallback version if reading fails (should ideally not happen)
  program.version('1.0.1'); // Ensure this fallback is sensible or updated
}

// Generate command
program
  .command('generate')
  .alias('g')
  .description('Generate a new scraper from template')
  .option('-t, --template <type>', 'Template type (basic, api, form)', 'basic')
  .option('-n, --name <name>', 'Scraper name')
  .option('-o, --output <path>', 'Output directory', './scrapers')
  .option('--interactive', 'Interactive mode', true)
  .action(generateScraper);

// Init command
program
  .command('init')
  .description('Initialize a new scraper project')
  .option('-n, --name <name>', 'Project name')
  .option('-t, --template <type>', 'Project template (basic, advanced)', 'basic')
  .option('--typescript', 'Use TypeScript', true)
  .action(initProject);

// Validate command
program
  .command('validate')
  .description('Validate scraper configuration')
  .option('-c, --config <path>', 'Configuration file path', './scraper.config.yaml')
  .action(validateConfig);

// Run command
program
  .command('run')
  .description('Run a scraper')
  .option('-s, --scraper <id>', 'Scraper ID to run')
  .option('-i, --input <value>', 'Input value for the scraper')
  .option('-c, --config <path>', 'Configuration file path')
  .option('--profile <name>', 'Configuration profile to use')
  .action(runScraper);

// Error handling
program.on('command:*', () => {
  console.error(chalk.red(`Invalid command: ${program.args.join(' ')}`));
  console.log(chalk.yellow('See --help for a list of available commands.'));
  process.exit(1);
});

// Parse arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
