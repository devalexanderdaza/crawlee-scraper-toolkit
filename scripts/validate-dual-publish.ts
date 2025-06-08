#!/usr/bin/env ts-node
/**
 * Validation script for dual registry publication
 * Validates NPM and GitHub Packages publication setup
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface PackageJson {
  name: string;
  version: string;
  main?: string;
  publishConfig?: {
    registry?: string;
    access?: string;
  };
  repository?: {
    type: string;
    url: string;
  };
}

interface ValidationCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

interface ValidationResult {
  category: string;
  checks: ValidationCheck[];
}

class DualPublishValidator {
  private projectRoot: string;
  private packageJson: PackageJson;

  constructor() {
    this.projectRoot = process.cwd();
    this.packageJson = this.loadPackageJson();
  }

  private loadPackageJson(): PackageJson {
    const packagePath = join(this.projectRoot, 'package.json');
    if (!existsSync(packagePath)) {
      throw new Error('package.json not found');
    }
    return JSON.parse(readFileSync(packagePath, 'utf8'));
  }

  private executeCommand(command: string): string {
    try {
      return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    } catch (error) {
      return '';
    }
  }

  private checkEnvironmentVariables(): ValidationResult {
    const checks: ValidationCheck[] = [];
    
    // Check NPM token
    const npmToken = process.env.NPM_TOKEN;
    checks.push({
      name: 'NPM_TOKEN',
      status: npmToken ? 'pass' : 'fail',
      message: npmToken ? 'NPM token is available' : 'NPM token is missing',
      details: npmToken ? undefined : 'Set NPM_TOKEN environment variable for NPM publication'
    });

    // Check GitHub token
    const githubToken = process.env.GITHUB_TOKEN;
    checks.push({
      name: 'GITHUB_TOKEN',
      status: githubToken ? 'pass' : 'fail',
      message: githubToken ? 'GitHub token is available' : 'GitHub token is missing',
      details: githubToken ? undefined : 'Set GITHUB_TOKEN environment variable for GitHub Packages publication'
    });

    return {
      category: 'Environment Variables',
      checks
    };
  }

  private checkPackageConfiguration(): ValidationResult {
    const checks: ValidationCheck[] = [];

    // Check package name format
    const nameCheck = this.packageJson.name.startsWith('@');
    checks.push({
      name: 'Package Name Scoping',
      status: nameCheck ? 'pass' : 'warning',
      message: nameCheck ? 'Package name is properly scoped' : 'Package name is not scoped',
      details: nameCheck ? undefined : 'Scoped packages (@scope/name) work better with GitHub Packages'
    });

    // Check repository configuration
    const hasRepo = this.packageJson.repository?.url;
    checks.push({
      name: 'Repository Configuration',
      status: hasRepo ? 'pass' : 'warning',
      message: hasRepo ? 'Repository URL is configured' : 'Repository URL is missing',
      details: hasRepo ? undefined : 'Repository URL helps with GitHub Packages publication'
    });

    // Check publish configuration
    const hasPublishConfig = this.packageJson.publishConfig;
    checks.push({
      name: 'Publish Configuration',
      status: hasPublishConfig ? 'pass' : 'warning',
      message: hasPublishConfig ? 'Publish configuration found' : 'No publish configuration',
      details: hasPublishConfig ? undefined : 'publishConfig can help with registry settings'
    });

    return {
      category: 'Package Configuration',
      checks
    };
  }

  private checkGitHubActions(): ValidationResult {
    const checks: ValidationCheck[] = [];

    // Check if dual-registry-publisher action exists
    const actionPath = join(this.projectRoot, '.github/actions/dual-registry-publisher/action.yml');
    const actionExists = existsSync(actionPath);
    checks.push({
      name: 'Dual Registry Publisher Action',
      status: actionExists ? 'pass' : 'fail',
      message: actionExists ? 'Dual registry publisher action is available' : 'Dual registry publisher action is missing',
      details: actionExists ? undefined : 'The dual-registry-publisher action is required for automated publication'
    });

    // Check workflow configuration
    const workflowPath = join(this.projectRoot, '.github/workflows/ci-cd.yml');
    if (existsSync(workflowPath)) {
      const workflowContent = readFileSync(workflowPath, 'utf8');
      const usesDualPublisher = workflowContent.includes('dual-registry-publisher');
      checks.push({
        name: 'Workflow Integration',
        status: usesDualPublisher ? 'pass' : 'warning',
        message: usesDualPublisher ? 'CI/CD workflow uses dual registry publisher' : 'CI/CD workflow does not use dual registry publisher',
        details: usesDualPublisher ? undefined : 'Add dual-registry-publisher to your release job'
      });

      // Check permissions
      const hasPackagesPermission = workflowContent.includes('packages: write');
      checks.push({
        name: 'GitHub Packages Permissions',
        status: hasPackagesPermission ? 'pass' : 'fail',
        message: hasPackagesPermission ? 'Workflow has packages write permission' : 'Workflow missing packages write permission',
        details: hasPackagesPermission ? undefined : 'Add "packages: write" to workflow permissions for GitHub Packages publication'
      });
    }

    return {
      category: 'GitHub Actions',
      checks
    };
  }

  private checkNpmConfiguration(): ValidationResult {
    const checks: ValidationCheck[] = [];

    // Check if logged into NPM
    const npmWhoami = this.executeCommand('npm whoami 2>/dev/null').trim();
    checks.push({
      name: 'NPM Authentication',
      status: npmWhoami ? 'pass' : 'warning',
      message: npmWhoami ? `Logged in as: ${npmWhoami}` : 'Not logged into NPM',
      details: npmWhoami ? undefined : 'Run "npm login" or set NPM_TOKEN for publication'
    });

    // Check NPM registry
    const npmRegistry = this.executeCommand('npm config get registry').trim();
    checks.push({
      name: 'NPM Registry',
      status: npmRegistry.includes('registry.npmjs.org') ? 'pass' : 'warning',
      message: `Registry: ${npmRegistry}`,
      details: npmRegistry.includes('registry.npmjs.org') ? undefined : 'Consider using official NPM registry'
    });

    return {
      category: 'NPM Configuration',
      checks
    };
  }

  private checkGitHubPackagesConfiguration(): ValidationResult {
    const checks: ValidationCheck[] = [];

    // Check .npmrc for GitHub Packages
    const npmrcPath = join(this.projectRoot, '.npmrc');
    if (existsSync(npmrcPath)) {
      const npmrcContent = readFileSync(npmrcPath, 'utf8');
      const hasGHPackagesConfig = npmrcContent.includes('npm.pkg.github.com');
      checks.push({
        name: '.npmrc Configuration',
        status: hasGHPackagesConfig ? 'pass' : 'warning',
        message: hasGHPackagesConfig ? '.npmrc configured for GitHub Packages' : '.npmrc not configured for GitHub Packages',
        details: hasGHPackagesConfig ? undefined : 'Add GitHub Packages registry configuration to .npmrc'
      });
    } else {
      checks.push({
        name: '.npmrc File',
        status: 'warning',
        message: '.npmrc file not found',
        details: 'Create .npmrc with GitHub Packages configuration'
      });
    }

    return {
      category: 'GitHub Packages Configuration',
      checks
    };
  }

  private checkBuildArtifacts(): ValidationResult {
    const checks: ValidationCheck[] = [];

    // Check if dist directory exists
    const distPath = join(this.projectRoot, 'dist');
    const distExists = existsSync(distPath);
    checks.push({
      name: 'Build Artifacts',
      status: distExists ? 'pass' : 'warning',
      message: distExists ? 'Build artifacts directory exists' : 'Build artifacts directory not found',
      details: distExists ? undefined : 'Run "npm run build" to generate build artifacts'
    });

    // Check package.json main field
    const mainField = this.packageJson.main;
    checks.push({
      name: 'Main Entry Point',
      status: mainField ? 'pass' : 'warning',
      message: mainField ? `Main entry: ${mainField}` : 'No main entry point specified',
      details: mainField ? undefined : 'Set "main" field in package.json'
    });

    return {
      category: 'Build Artifacts',
      checks
    };
  }

  public async validate(): Promise<void> {
    console.log('🔍 Starting dual registry publication validation...');
    
    const results: ValidationResult[] = [
      this.checkEnvironmentVariables(),
      this.checkPackageConfiguration(),
      this.checkGitHubActions(),
      this.checkNpmConfiguration(),
      this.checkGitHubPackagesConfiguration(),
      this.checkBuildArtifacts()
    ];

    let totalChecks = 0;
    let passedChecks = 0;
    let warnings = 0;
    let failures = 0;

    console.log('\n📋 Dual Registry Publication Validation Report');
    console.log('='.repeat(50));

    for (const result of results) {
      console.log(`\n🔹 ${result.category}`);
      console.log('-'.repeat(result.category.length + 2));

      for (const check of result.checks) {
        totalChecks++;
        const icon = check.status === 'pass' ? '✅' : 
                    check.status === 'warning' ? '⚠️' : '❌';
        
        console.log(`${icon} ${check.name}: ${check.message}`);
        
        if (check.details) {
          console.log(`   📝 ${check.details}`);
        }

        if (check.status === 'pass') passedChecks++;
        else if (check.status === 'warning') warnings++;
        else failures++;
      }
    }

    console.log('\n📊 Summary');
    console.log('='.repeat(10));
    console.log(`Total checks: ${totalChecks}`);
    console.log(`✅ Passed: ${passedChecks}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log(`❌ Failed: ${failures}`);

    const score = Math.round((passedChecks / totalChecks) * 100);
    console.log(`\n🎯 Validation Score: ${score}%`);

    if (failures > 0) {
      console.log('\n🚨 Critical issues found that must be resolved before publication');
      process.exit(1);
    } else if (warnings > 0) {
      console.log('\n⚠️ Some warnings found - publication may work but consider addressing them');
    } else {
      console.log('\n🎉 All validations passed - ready for dual registry publication!');
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new DualPublishValidator();
  validator.validate().catch((error) => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

export { DualPublishValidator };
