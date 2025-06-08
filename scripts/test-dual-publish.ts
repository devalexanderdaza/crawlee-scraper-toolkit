#!/usr/bin/env ts-node
/**
 * End-to-end test for dual registry publication
 * Tests the complete publication flow in dry-run mode
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  details?: string;
}

class DualPublishE2ETest {
  private projectRoot: string;
  private testResults: TestResult[] = [];

  constructor() {
    this.projectRoot = process.cwd();
  }

  private executeCommand(command: string, description: string): TestResult {
    try {
      console.log(`🔄 ${description}...`);
      const output = execSync(command, { 
        encoding: 'utf8', 
        cwd: this.projectRoot,
        stdio: 'pipe'
      });
      
      return {
        name: description,
        success: true,
        message: 'Command executed successfully',
        details: output.slice(0, 500) // Truncate for readability
      };
    } catch (error: any) {
      return {
        name: description,
        success: false,
        message: 'Command failed',
        details: error.message || error.stdout || error.stderr
      };
    }
  }

  private async testValidationScript(): Promise<TestResult> {
    console.log('🧪 Testing validation script...');
    
    try {
      // Run validation script with environment variables
      const result = this.executeCommand(
        'GITHUB_TOKEN=test-token NPM_TOKEN=test-token pnpm run validate:dual-publish',
        'Dual publish validation'
      );
      
      return {
        name: 'Validation Script',
        success: result.success,
        message: result.success ? 'Validation script runs successfully' : 'Validation script failed',
        details: result.details
      };
    } catch (error: any) {
      return {
        name: 'Validation Script',
        success: false,
        message: 'Failed to run validation script',
        details: error.message
      };
    }
  }

  private async testBuildProcess(): Promise<TestResult> {
    console.log('🏗️ Testing build process...');
    
    return this.executeCommand(
      'pnpm run build',
      'Build process'
    );
  }

  private async testDualRegistryAction(): Promise<TestResult> {
    console.log('🚀 Testing dual registry action...');
    
    const actionPath = join(this.projectRoot, '.github/actions/dual-registry-publisher/action.yml');
    
    if (!existsSync(actionPath)) {
      return {
        name: 'Dual Registry Action',
        success: false,
        message: 'Action file not found',
        details: `Expected action at: ${actionPath}`
      };
    }

    try {
      const actionContent = readFileSync(actionPath, 'utf8');
      
      // Check if action has required inputs
      const hasRequiredInputs = actionContent.includes('npm-token') && 
                               actionContent.includes('github-token');
      
      if (!hasRequiredInputs) {
        return {
          name: 'Dual Registry Action',
          success: false,
          message: 'Action missing required inputs',
          details: 'Action should have npm-token and github-token inputs'
        };
      }

      return {
        name: 'Dual Registry Action',
        success: true,
        message: 'Action configuration is valid',
        details: 'All required inputs are present'
      };
    } catch (error: any) {
      return {
        name: 'Dual Registry Action',
        success: false,
        message: 'Failed to read action file',
        details: error.message
      };
    }
  }

  private async testWorkflowIntegration(): Promise<TestResult> {
    console.log('⚙️ Testing workflow integration...');
    
    const workflowPath = join(this.projectRoot, '.github/workflows/ci-cd.yml');
    
    if (!existsSync(workflowPath)) {
      return {
        name: 'Workflow Integration',
        success: false,
        message: 'CI/CD workflow not found',
        details: `Expected workflow at: ${workflowPath}`
      };
    }

    try {
      const workflowContent = readFileSync(workflowPath, 'utf8');
      
      // Check for dual registry publisher usage
      const usesDualPublisher = workflowContent.includes('dual-registry-publisher');
      const hasPackagesPermission = workflowContent.includes('packages: write');
      
      if (!usesDualPublisher) {
        return {
          name: 'Workflow Integration',
          success: false,
          message: 'Workflow does not use dual registry publisher',
          details: 'Add dual-registry-publisher action to release job'
        };
      }

      if (!hasPackagesPermission) {
        return {
          name: 'Workflow Integration',
          success: false,
          message: 'Workflow missing packages permission',
          details: 'Add "packages: write" to workflow permissions'
        };
      }

      return {
        name: 'Workflow Integration',
        success: true,
        message: 'Workflow properly configured for dual publication',
        details: 'Uses dual registry publisher with correct permissions'
      };
    } catch (error: any) {
      return {
        name: 'Workflow Integration',
        success: false,
        message: 'Failed to read workflow file',
        details: error.message
      };
    }
  }

  private async testPackageConfiguration(): Promise<TestResult> {
    console.log('📦 Testing package configuration...');
    
    const packagePath = join(this.projectRoot, 'package.json');
    
    try {
      const packageContent = JSON.parse(readFileSync(packagePath, 'utf8'));
      
      const issues: string[] = [];
      
      // Check package name
      if (!packageContent.name) {
        issues.push('Missing package name');
      } else if (!packageContent.name.startsWith('@')) {
        // This is just a warning, not a failure since the action handles scoping
        console.log(`   ℹ️  Package name "${packageContent.name}" will be scoped automatically for GitHub Packages`);
      }
      
      // Check version
      if (!packageContent.version) {
        issues.push('Missing package version');
      }
      
      // Check repository
      if (!packageContent.repository?.url) {
        issues.push('Missing repository URL');
      }
      
      // Check main entry point
      if (!packageContent.main && !packageContent.exports) {
        issues.push('Missing main entry point or exports');
      }

      if (issues.length > 0) {
        return {
          name: 'Package Configuration',
          success: false,
          message: 'Package configuration issues found',
          details: issues.join(', ')
        };
      }

      return {
        name: 'Package Configuration',
        success: true,
        message: 'Package configuration is valid',
        details: `Name: ${packageContent.name}, Version: ${packageContent.version}`
      };
    } catch (error: any) {
      return {
        name: 'Package Configuration',
        success: false,
        message: 'Failed to parse package.json',
        details: error.message
      };
    }
  }

  public async runE2ETest(): Promise<void> {
    console.log('🧪 Starting End-to-End Dual Publication Test');
    console.log('='.repeat(50));

    // Run all tests
    const tests = [
      this.testPackageConfiguration(),
      this.testBuildProcess(),
      this.testDualRegistryAction(),
      this.testWorkflowIntegration(),
      this.testValidationScript()
    ];

    for (const test of tests) {
      const result = await test;
      this.testResults.push(result);
    }

    // Report results
    console.log('\n📊 Test Results');
    console.log('='.repeat(15));

    let passed = 0;
    let failed = 0;

    for (const result of this.testResults) {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      console.log(`   ${result.message}`);
      
      if (result.details) {
        console.log(`   📝 ${result.details.substring(0, 100)}${result.details.length > 100 ? '...' : ''}`);
      }
      
      if (result.success) {
        passed++;
      } else {
        failed++;
      }
      
      console.log();
    }

    console.log(`📈 Summary: ${passed} passed, ${failed} failed`);
    console.log(`🎯 Success Rate: ${Math.round((passed / this.testResults.length) * 100)}%`);

    if (failed === 0) {
      console.log('\n🎉 All tests passed! Dual publication setup is ready.');
    } else {
      console.log('\n⚠️ Some tests failed. Please address the issues above.');
      process.exit(1);
    }
  }
}

// Run E2E test if called directly
if (require.main === module) {
  const test = new DualPublishE2ETest();
  test.runE2ETest().catch((error) => {
    console.error('❌ E2E test failed:', error.message);
    process.exit(1);
  });
}

export { DualPublishE2ETest };
