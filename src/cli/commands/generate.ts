import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, resolve as pathResolve } from 'path';
import { getTemplate } from '../templates';
import { ToolkitVersionDetails } from '@/core/types';

// Helper to get main package.json details
function getToolkitVersionDetails(): ToolkitVersionDetails {
  try {
    const packageJsonPath = pathResolve(__dirname, '../../../package.json');
    const packageJsonContent = readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);
    return {
      version: packageJson.version,
      dependencies: packageJson.dependencies,
      devDependencies: packageJson.devDependencies,
    };
  } catch (error) {
    console.warn(
      chalk.yellow(
        'Could not read main package.json for dynamic versions. Using fallback versions.'
      )
    );
    // Fallback versions if reading fails (should ideally not happen in deployed package)
    return {
      version: '1.0.1', // Needs to be updated if this file is copied without context
      dependencies: {
        crawlee: '^3.7.0',
        playwright: '^1.40.0',
      },
      devDependencies: {
        '@types/node': '^20.10.0',
        typescript: '^5.3.0',
        'ts-node': '^10.9.0',
        jest: '^29.7.0',
        '@types/jest': '^29.5.0',
      },
    };
  }
}

const toolkitDetails = getToolkitVersionDetails();

/**
 * Template types available
 */
export type TemplateType = 'basic' | 'api' | 'form' | 'advanced';

/**
 * Generation options
 */
export interface GenerateOptions {
  template?: TemplateType;
  name?: string;
  output?: string;
  interactive?: boolean;
}

/**
 * Scraper configuration for generation
 */
export interface ScraperConfig {
  name: string;
  description: string;
  url: string;
  template: TemplateType;
  navigation: {
    type: 'direct' | 'form' | 'api';
    inputSelector?: string;
    submitSelector?: string;
    paramName?: string;
  };
  waitStrategy: {
    type: 'selector' | 'response' | 'timeout';
    selector?: string;
    urlPattern?: string;
    duration?: number;
  };
  outputFields: Array<{
    name: string;
    selector: string;
    type: 'text' | 'attribute' | 'html';
    attribute?: string;
  }>;
  options: {
    retries: number;
    timeout: number;
    loadImages: boolean;
  };
}

/**
 * Generate a new scraper
 */
export async function generateScraper(options: GenerateOptions): Promise<void> {
  console.log(chalk.blue('🚀 Crawlee Scraper Generator'));
  console.log();

  let config: ScraperConfig;

  if (options.interactive !== false) {
    config = await promptForConfig(options);
  } else {
    config = await createConfigFromOptions(options);
  }

  const spinner = ora('Generating scraper...').start();

  try {
    await generateScraperFiles(config, options.output || './scrapers');
    spinner.succeed(chalk.green('Scraper generated successfully!'));

    console.log();
    console.log(chalk.yellow('Next steps:'));
    console.log(`  1. cd ${options.output || './scrapers'}/${config.name}`);
    console.log('  2. npm install');
    console.log('  3. npm run dev');
    console.log();
  } catch (error) {
    spinner.fail(chalk.red('Failed to generate scraper'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

/**
 * Prompt user for scraper configuration
 */
async function promptForConfig(options: GenerateOptions): Promise<ScraperConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Scraper name:',
      default: options.name || 'my-scraper',
      validate: (input: string) => {
        if (!input.trim()) return 'Name is required';
        if (!/^[a-z0-9-_]+$/.test(input))
          return 'Name must contain only lowercase letters, numbers, hyphens, and underscores';
        return true;
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'Scraper description:',
      default: 'A web scraper built with Crawlee Scraper Toolkit',
    },
    {
      type: 'list',
      name: 'template',
      message: 'Choose a template:',
      choices: [
        { name: 'Basic - Simple page scraping', value: 'basic' },
        { name: 'API - Extract data from API responses', value: 'api' },
        { name: 'Form - Fill and submit forms', value: 'form' },
        { name: 'Advanced - Custom navigation and parsing', value: 'advanced' },
      ],
      default: options.template || 'basic',
    },
    {
      type: 'input',
      name: 'url',
      message: 'Target URL:',
      validate: (input: string) => {
        try {
          new URL(input);
          return true;
        } catch {
          return 'Please enter a valid URL';
        }
      },
    },
  ]);

  // Template-specific questions
  const templateConfig = await promptForTemplateConfig(answers.template, answers.url);

  return {
    ...answers,
    ...templateConfig,
  };
}

/**
 * Prompt for template-specific configuration
 */
async function promptForTemplateConfig(
  template: TemplateType,
  _url: string
): Promise<Partial<ScraperConfig>> {
  const config: Partial<ScraperConfig> = {
    navigation: { type: 'direct' },
    waitStrategy: { type: 'timeout', duration: 2000 },
    outputFields: [],
    options: {
      retries: 3,
      timeout: 30000,
      loadImages: false,
    },
  };

  switch (template) {
    case 'form':
      const formAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'inputSelector',
          message: 'Input field selector (CSS selector):',
          default: 'input[type="text"]',
        },
        {
          type: 'input',
          name: 'submitSelector',
          message: 'Submit button selector (CSS selector):',
          default: 'button[type="submit"]',
        },
      ]);

      config.navigation = {
        type: 'form',
        inputSelector: formAnswers.inputSelector,
        submitSelector: formAnswers.submitSelector,
      };

      config.waitStrategy = { type: 'selector', selector: '.results' };
      break;

    case 'api':
      const apiAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'paramName',
          message: 'URL parameter name for input:',
          default: 'q',
        },
        {
          type: 'input',
          name: 'urlPattern',
          message: 'API response URL pattern to wait for:',
          default: '/api/',
        },
      ]);

      config.navigation = {
        type: 'api',
        paramName: apiAnswers.paramName,
      };

      config.waitStrategy = {
        type: 'response',
        urlPattern: apiAnswers.urlPattern,
      };
      break;

    case 'basic':
    case 'advanced':
      const waitAnswers = await inquirer.prompt([
        {
          type: 'list',
          name: 'waitType',
          message: 'How to wait for page to load:',
          choices: [
            { name: 'Wait for specific element', value: 'selector' },
            { name: 'Wait for network response', value: 'response' },
            { name: 'Wait for fixed time', value: 'timeout' },
          ],
          default: 'timeout',
        },
      ]);

      if (waitAnswers.waitType === 'selector') {
        const selectorAnswer = await inquirer.prompt([
          {
            type: 'input',
            name: 'selector',
            message: 'CSS selector to wait for:',
            default: '.content',
          },
        ]);
        config.waitStrategy = { type: 'selector', selector: selectorAnswer.selector };
      } else if (waitAnswers.waitType === 'response') {
        const responseAnswer = await inquirer.prompt([
          {
            type: 'input',
            name: 'urlPattern',
            message: 'URL pattern to wait for:',
            default: '/api/',
          },
        ]);
        config.waitStrategy = { type: 'response', urlPattern: responseAnswer.urlPattern };
      } else {
        const timeoutAnswer = await inquirer.prompt([
          {
            type: 'number',
            name: 'duration',
            message: 'Wait duration (milliseconds):',
            default: 2000,
          },
        ]);
        config.waitStrategy = { type: 'timeout', duration: timeoutAnswer.duration };
      }
      break;
  }

  // Ask for output fields
  const addFields = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'addOutputFields',
      message: 'Do you want to configure output fields now?',
      default: true,
    },
  ]);

  if (addFields.addOutputFields) {
    config.outputFields = await promptForOutputFields();
  }

  return config;
}

/**
 * Prompt for output fields configuration
 */
async function promptForOutputFields(): Promise<ScraperConfig['outputFields']> {
  const fields: ScraperConfig['outputFields'] = [];
  let addMore = true;

  while (addMore) {
    const fieldConfig = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Field name:',
        validate: (input: string) => (input.trim() ? true : 'Field name is required'),
      },
      {
        type: 'input',
        name: 'selector',
        message: 'CSS selector:',
        validate: (input: string) => (input.trim() ? true : 'Selector is required'),
      },
      {
        type: 'list',
        name: 'type',
        message: 'Data type:',
        choices: [
          { name: 'Text content', value: 'text' },
          { name: 'HTML content', value: 'html' },
          { name: 'Attribute value', value: 'attribute' },
        ],
        default: 'text',
      },
    ]);

    if (fieldConfig.type === 'attribute') {
      const attrAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'attribute',
          message: 'Attribute name:',
          default: 'href',
        },
      ]);
      fieldConfig.attribute = attrAnswer.attribute;
    }

    fields.push(fieldConfig);

    const continueAnswer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addMore',
        message: 'Add another field?',
        default: false,
      },
    ]);

    addMore = continueAnswer.addMore;
  }

  return fields;
}

/**
 * Create configuration from command line options
 */
async function createConfigFromOptions(options: GenerateOptions): Promise<ScraperConfig> {
  if (!options.name) {
    throw new Error('Scraper name is required in non-interactive mode');
  }

  return {
    name: options.name,
    description: 'Generated scraper',
    url: 'https://example.com',
    template: options.template || 'basic',
    navigation: { type: 'direct' },
    waitStrategy: { type: 'timeout', duration: 2000 },
    outputFields: [],
    options: {
      retries: 3,
      timeout: 30000,
      loadImages: false,
    },
  };
}

/**
 * Generate scraper files
 */
async function generateScraperFiles(config: ScraperConfig, outputDir: string): Promise<void> {
  const scraperDir = join(outputDir, config.name);

  // Create directory
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  if (!existsSync(scraperDir)) {
    mkdirSync(scraperDir, { recursive: true });
  }

  // Get template files
  const template = getTemplate(config.template);

  // Generate files
  for (const [filename, content] of Object.entries(template.files)) {
    const filePath = join(scraperDir, filename);
    const processedContent = processTemplate(content, config);

    // Create subdirectories if needed
    const dir = join(filePath, '..');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(filePath, processedContent);
  }

  // Generate package.json
  const packageJson = {
    name: config.name,
    version: '1.0.0', // Individual scraper version
    description: config.description,
    main: 'dist/index.js', // Assuming TS output
    scripts: {
      build: 'tsc',
      dev: 'ts-node src/index.ts', // For direct execution
      start: 'node dist/index.js', // For direct execution after build
      test: 'jest', // Basic test setup
    },
    dependencies: {
      'crawlee-scraper-toolkit': `^${toolkitDetails.version}`, // Use current toolkit version
      playwright: toolkitDetails.dependencies?.playwright || '^1.40.0', // From toolkit's deps
      // Crawlee is a peer/direct dep of the toolkit, but generated scrapers might need it directly too
      crawlee: toolkitDetails.dependencies?.crawlee || '^3.7.0',
    },
    devDependencies: {
      '@types/node': toolkitDetails.devDependencies?.['@types/node'] || '^20.10.0',
      typescript: toolkitDetails.devDependencies?.typescript || '^5.3.0',
      'ts-node': toolkitDetails.devDependencies?.['ts-node'] || '^10.9.0',
      jest: toolkitDetails.devDependencies?.jest || '^29.7.0',
      '@types/jest': toolkitDetails.devDependencies?.['@types/jest'] || '^29.5.0',
    },
  };

  writeFileSync(join(scraperDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  // Generate TypeScript config
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };

  writeFileSync(join(scraperDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));
}

/**
 * Process template with configuration
 */
function processTemplate(template: string, config: ScraperConfig): string {
  return template
    .replace(/\{\{name\}\}/g, config.name)
    .replace(/\{\{description\}\}/g, config.description)
    .replace(/\{\{url\}\}/g, config.url)
    .replace(/\{\{navigation\}\}/g, JSON.stringify(config.navigation, null, 2))
    .replace(/\{\{waitStrategy\}\}/g, JSON.stringify(config.waitStrategy, null, 2))
    .replace(/\{\{outputFields\}\}/g, JSON.stringify(config.outputFields, null, 2))
    .replace(/\{\{options\}\}/g, JSON.stringify(config.options, null, 2));
}
