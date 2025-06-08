#!/usr/bin/env node

/**
 * Advanced CI/CD Performance Analytics and Health Check
 * Analyzes workflow performance, cache efficiency, and provides optimization recommendations
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

interface PerformanceMetrics {
  cacheHitRate: number;
  buildTime: number;
  testTime: number;
  totalDuration: number;
  artifactSizes: Record<string, number>;
  recommendations: string[];
}

class CICDAnalyzer {
  private rootDir: string;

  constructor() {
    this.rootDir = process.cwd();
  }

  /**
   * Analyze build performance and cache efficiency
   */
  async analyzePerformance(): Promise<PerformanceMetrics> {
    console.log('🔍 Analyzing CI/CD Performance...\n');

    const metrics: PerformanceMetrics = {
      cacheHitRate: 0,
      buildTime: 0,
      testTime: 0,
      totalDuration: 0,
      artifactSizes: {},
      recommendations: []
    };

    // Check build artifacts
    this.analyzeBuildArtifacts(metrics);
    
    // Check cache effectiveness
    this.analyzeCacheEfficiency(metrics);
    
    // Generate recommendations
    this.generateRecommendations(metrics);

    return metrics;
  }

  private analyzeBuildArtifacts(metrics: PerformanceMetrics): void {
    console.log('📦 Analyzing build artifacts...');
    
    const distDir = join(this.rootDir, 'dist');
    if (existsSync(distDir)) {
      const files = this.getFilesRecursively(distDir);
      let totalSize = 0;
      
      files.forEach(file => {
        const stat = statSync(file);
        const relativePath = file.replace(this.rootDir, '');
        metrics.artifactSizes[relativePath] = stat.size;
        totalSize += stat.size;
      });

      console.log(`   📊 Total artifacts: ${files.length}`);
      console.log(`   📏 Total size: ${this.formatBytes(totalSize)}`);
      
      // Check for oversized artifacts
      Object.entries(metrics.artifactSizes).forEach(([file, size]) => {
        if (size > 1024 * 1024) { // 1MB+
          metrics.recommendations.push(`🚨 Large artifact detected: ${file} (${this.formatBytes(size)})`);
        }
      });
    }
  }

  private analyzeCacheEfficiency(metrics: PerformanceMetrics): void {
    console.log('💾 Analyzing cache efficiency...');
    
    // Check for cache indicators
    const cacheIndicators = [
      '.tsbuildinfo',
      'node_modules/.cache',
      '.pnpm-store'
    ];

    let cacheableItems = 0;
    let cachedItems = 0;

    cacheIndicators.forEach(indicator => {
      cacheableItems++;
      if (existsSync(join(this.rootDir, indicator))) {
        cachedItems++;
        console.log(`   ✅ ${indicator} cached`);
      } else {
        console.log(`   ❌ ${indicator} not cached`);
      }
    });

    metrics.cacheHitRate = (cachedItems / cacheableItems) * 100;
    console.log(`   📊 Cache hit rate: ${metrics.cacheHitRate.toFixed(1)}%`);

    if (metrics.cacheHitRate < 80) {
      metrics.recommendations.push('🔧 Consider improving cache strategy for better performance');
    }
  }

  private generateRecommendations(metrics: PerformanceMetrics): void {
    console.log('\n💡 Performance Recommendations:');
    
    if (metrics.recommendations.length === 0) {
      console.log('   ✅ No specific recommendations - performance looks good!');
      return;
    }

    metrics.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }

  private getFilesRecursively(dir: string): string[] {
    const files: string[] = [];
    const items = require('fs').readdirSync(dir);
    
    items.forEach((item: string) => {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getFilesRecursively(fullPath));
      } else {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Health check for CI/CD configuration
   */
  async healthCheck(): Promise<void> {
    console.log('🏥 CI/CD Health Check\n');

    const checks = [
      { name: 'Package.json exists', check: () => existsSync('package.json') },
      { name: 'TypeScript config exists', check: () => existsSync('tsconfig.json') },
      { name: 'Build script exists', check: () => existsSync('scripts/build.sh') },
      { name: 'GitHub workflows exist', check: () => existsSync('.github/workflows') },
      { name: 'Release config exists', check: () => existsSync('.releaserc.json') },
      { name: 'Tests directory exists', check: () => existsSync('tests') || existsSync('test') },
    ];

    let passed = 0;
    let total = checks.length;

    checks.forEach(({ name, check }) => {
      const result = check();
      console.log(`${result ? '✅' : '❌'} ${name}`);
      if (result) passed++;
    });

    console.log(`\n📊 Health Score: ${passed}/${total} (${((passed/total) * 100).toFixed(1)}%)`);

    if (passed === total) {
      console.log('🎉 All health checks passed!');
    } else {
      console.log('⚠️  Some health checks failed. Please review the configuration.');
    }
  }
}

// Main execution
async function main() {
  const analyzer = new CICDAnalyzer();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'performance':
    case 'perf':
      await analyzer.analyzePerformance();
      break;
    case 'health':
      await analyzer.healthCheck();
      break;
    case 'all':
    default:
      await analyzer.healthCheck();
      console.log('\n' + '='.repeat(50) + '\n');
      await analyzer.analyzePerformance();
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { CICDAnalyzer, PerformanceMetrics };
