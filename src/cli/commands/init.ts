import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, resolve as pathResolve } from 'path';

// Helper to get main package.json details
function getToolkitVersionDetails() {
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
    console.warn(chalk.yellow('Could not read main package.json for dynamic versions. Using fallback versions.'));
    // Fallback versions if reading fails
    return {
      version: '1.0.1', // Needs to be updated if this file is copied without context
      dependencies: {
        'crawlee': '^3.7.0',
        'playwright': '^1.40.0',
      },
      devDependencies: {
        '@types/node': '^20.10.0',
        'typescript': '^5.3.0',
        'ts-node': '^10.9.0',
        'jest': '^29.7.0',
        '@types/jest': '^29.5.0',
      }
    };
  }
}

const toolkitDetails = getToolkitVersionDetails();

/**
 * Project initialization options
 */
export interface InitOptions {
  name?: string;
  template?: 'basic' | 'advanced';
  typescript?: boolean;
}

/**
 * Initialize a new scraper project
 */
export async function initProject(options: InitOptions): Promise<void> {
  console.log(chalk.blue('🎯 Initialize Scraper Project'));
  console.log();

  const config = await promptForProjectConfig(options);
  const spinner = ora('Creating project...').start();

  try {
    await createProject(config);
    spinner.succeed(chalk.green('Project created successfully!'));
    
    console.log();
    console.log(chalk.yellow('Next steps:'));
    console.log(`  1. cd ${config.name}`);
    console.log('  2. npm install');
    console.log('  3. crawlee-scraper generate');
    console.log();
    
  } catch (error) {
    spinner.fail(chalk.red('Failed to create project'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

/**
 * Prompt for project configuration
 */
async function promptForProjectConfig(options: InitOptions): Promise<Required<InitOptions>> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      default: options.name || 'my-scraper-project',
      validate: (input: string) => {
        if (!input.trim()) return 'Project name is required';
        if (!/^[a-z0-9-_]+$/.test(input)) return 'Name must contain only lowercase letters, numbers, hyphens, and underscores';
        return true;
      },
    },
    {
      type: 'list',
      name: 'template',
      message: 'Project template:',
      choices: [
        { name: 'Basic - Simple project structure', value: 'basic' },
        { name: 'Advanced - Full-featured with examples', value: 'advanced' },
      ],
      default: options.template || 'basic',
    },
    {
      type: 'confirm',
      name: 'typescript',
      message: 'Use TypeScript?',
      default: options.typescript !== false,
    },
  ]);

  return answers;
}

/**
 * Create project structure
 */
async function createProject(config: Required<InitOptions>): Promise<void> {
  const projectDir = config.name;
  
  if (existsSync(projectDir)) {
    throw new Error(`Directory ${projectDir} already exists`);
  }

  // Create project directory
  mkdirSync(projectDir, { recursive: true });

  // Create basic structure
  const dirs = [
    'src',
    'scrapers',
    'config',
    'tests',
    'docs',
  ];

  if (config.template === 'advanced') {
    dirs.push('examples', 'scripts', 'data');
  }

  for (const dir of dirs) {
    mkdirSync(join(projectDir, dir), { recursive: true });
  }

  // Create package.json
  const packageJson = {
    name: config.name,
    version: '1.0.0',
    description: 'A scraper project built with Crawlee Scraper Toolkit',
    main: config.typescript ? 'dist/index.js' : 'src/index.js',
    scripts: {
      ...(config.typescript ? {
        build: 'tsc',
        dev: 'ts-node src/index.ts',
        start: 'node dist/index.js',
      } : {
        dev: 'node src/index.js',
        start: 'node src/index.js',
      }),
      test: 'jest',
      'scraper:generate': 'crawlee-scraper generate',
      'scraper:run': 'crawlee-scraper run',
    },
    dependencies: {
      'crawlee-scraper-toolkit': `^${toolkitDetails.version}`,
      'playwright': toolkitDetails.dependencies?.playwright || '^1.40.0',
      'crawlee': toolkitDetails.dependencies?.crawlee || '^3.7.0',
    },
    devDependencies: {
      '@types/node': toolkitDetails.devDependencies?.['@types/node'] || '^20.10.0',
      'jest': toolkitDetails.devDependencies?.jest || '^29.7.0',
      ...(config.typescript ? {
        'typescript': toolkitDetails.devDependencies?.typescript || '^5.3.0',
        'ts-node': toolkitDetails.devDependencies?.['ts-node'] || '^10.9.0',
        '@types/jest': toolkitDetails.devDependencies?.['@types/jest'] || '^29.5.0',
      } : {}),
    },
  };

  writeFileSync(
    join(projectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create TypeScript config if needed
  if (config.typescript) {
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
        resolveJsonModule: true,
        declaration: true,
        sourceMap: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', 'tests'],
    };

    writeFileSync(
      join(projectDir, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );
  }

  // Create main index file
  const indexContent = config.typescript ? `
import { CrawleeScraperEngine, configManager } from 'crawlee-scraper-toolkit';

async function main() {
  const engine = new CrawleeScraperEngine(
    configManager.getConfig(),
    configManager.getLogger()
  );

  console.log('Scraper engine initialized');
  console.log('Use "npm run scraper:generate" to create your first scraper');
}

main().catch(console.error);
` : `
const { CrawleeScraperEngine, configManager } = require('crawlee-scraper-toolkit');

async function main() {
  const engine = new CrawleeScraperEngine(
    configManager.getConfig(),
    configManager.getLogger()
  );

  console.log('Scraper engine initialized');
  console.log('Use "npm run scraper:generate" to create your first scraper');
}

main().catch(console.error);
`;

  writeFileSync(
    join(projectDir, 'src', `index.${config.typescript ? 'ts' : 'js'}`),
    indexContent.trim()
  );

  writeFileSync(
    join(projectDir, 'config', 'scraper.config.yaml'),
    `# Crawlee Scraper Toolkit Configuration
# See documentation for all available options

browserPool:
  maxSize: 3
  maxAge: 1800000  # 30 minutes
  launchOptions:
    headless: true
    args:
      - "--no-sandbox"
      - "--disable-setuid-sandbox"

defaultOptions:
  retries: 3
  timeout: 30000
  loadImages: false

logging:
  level: info
  format: text
`
  );

  // Create README
  const readmeContent = `# ${config.name}

A web scraper project built with [Crawlee Scraper Toolkit](https://github.com/devalexanderdaza/crawlee-scraper-toolkit).

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Generate your first scraper:
   \`\`\`bash
   npm run scraper:generate
   \`\`\`

3. Run the scraper:
   \`\`\`bash
   npm run scraper:run --scraper=your-scraper-id --input="your-input"
   \`\`\`

## Project Structure

- \`src/\` - Main application code
- \`scrapers/\` - Generated scrapers
- \`config/\` - Configuration files
- \`tests/\` - Test files
${config.template === 'advanced' ? `- \`examples/\` - Example scrapers
- \`scripts/\` - Utility scripts
- \`data/\` - Data files` : ''}

## Configuration

Edit \`config/scraper.config.yaml\` to customize the scraper engine behavior.

## Documentation

See the [Crawlee Scraper Toolkit documentation](https://github.com/devalexanderdaza/crawlee-scraper-toolkit#readme) for detailed usage instructions.
`;

  writeFileSync(join(projectDir, 'README.md'), readmeContent);

  // Create .gitignore
  const gitignoreContent = `
# Dependencies
node_modules/
npm-debug.log*

# Build outputs
dist/
build/

# Environment variables
.env
.env.local

# Logs
logs/
*.log

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Crawlee storage
storage/
apify_storage/

# Playwright
test-results/
playwright-report/
playwright/.cache/
`.trim();

  writeFileSync(join(projectDir, '.gitignore'), gitignoreContent);

  // Create advanced template files
  if (config.template === 'advanced') {
    // Create example scrapers
    const exampleScraperContent = config.typescript ? `
import { ScraperDefinition } from 'crawlee-scraper-toolkit';

export const exampleScraper: ScraperDefinition<string, any> = {
  id: 'example-scraper',
  name: 'Example Scraper',
  description: 'An example scraper for demonstration',
  url: 'https://example.com',
  navigation: { type: 'direct' },
  waitStrategy: { type: 'timeout', config: { duration: 2000 } },
  requiresCaptcha: false,
  parse: async (context) => {
    const { page } = context;
    
    const title = await page.textContent('h1');
    const description = await page.textContent('p');
    
    return {
      title,
      description,
      url: page.url(),
      timestamp: new Date().toISOString(),
    };
  },
};
` : `
const exampleScraper = {
  id: 'example-scraper',
  name: 'Example Scraper',
  description: 'An example scraper for demonstration',
  url: 'https://example.com',
  navigation: { type: 'direct' },
  waitStrategy: { type: 'timeout', config: { duration: 2000 } },
  requiresCaptcha: false,
  parse: async (context) => {
    const { page } = context;
    
    const title = await page.textContent('h1');
    const description = await page.textContent('p');
    
    return {
      title,
      description,
      url: page.url(),
      timestamp: new Date().toISOString(),
    };
  },
};

module.exports = { exampleScraper };
`;

    writeFileSync(
      join(projectDir, 'examples', `example-scraper.${config.typescript ? 'ts' : 'js'}`),
      exampleScraperContent.trim()
    );
  }
}

