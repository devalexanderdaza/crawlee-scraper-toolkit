import { ConfigManager, createConfig } from '@/core/config-manager';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  const testConfigPath = join(__dirname, 'test-config.yaml');

  beforeEach(() => {
    configManager = new ConfigManager();
  });

  afterEach(() => {
    if (existsSync(testConfigPath)) {
      unlinkSync(testConfigPath);
    }
  });

  describe('default configuration', () => {
    it('should have valid default configuration', () => {
      const config = configManager.getConfig();
      
      expect(config.browserPool).toBeDefined();
      expect(config.browserPool.maxSize).toBe(5);
      expect(config.defaultOptions).toBeDefined();
      expect(config.defaultOptions.retries).toBe(3);
      expect(config.logging).toBeDefined();
      expect(config.logging.level).toBe('info');
    });

    it('should validate default configuration', () => {
      const validation = configManager.validateConfig();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('file configuration', () => {
    it('should load configuration from YAML file', () => {
      const yamlConfig = `
browserPool:
  maxSize: 10
  maxAge: 60000
defaultOptions:
  retries: 5
  timeout: 45000
logging:
  level: debug
`;
      
      writeFileSync(testConfigPath, yamlConfig);
      configManager.loadFromFile(testConfigPath);
      
      const config = configManager.getConfig();
      expect(config.browserPool.maxSize).toBe(10);
      expect(config.browserPool.maxAge).toBe(60000);
      expect(config.defaultOptions.retries).toBe(5);
      expect(config.defaultOptions.timeout).toBe(45000);
      expect(config.logging.level).toBe('debug');
    });

    it('should handle invalid configuration file', () => {
      const invalidConfig = `
browserPool:
  maxSize: "invalid"
  maxAge: -1000
`;
      
      writeFileSync(testConfigPath, invalidConfig);
      
      expect(() => {
        configManager.loadFromFile(testConfigPath);
      }).toThrow();
    });
  });

  describe('environment configuration', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should load configuration from environment variables', () => {
      process.env.BROWSER_POOL_SIZE = '8';
      process.env.BROWSER_HEADLESS = 'false';
      process.env.SCRAPING_MAX_RETRIES = '7';
      process.env.LOG_LEVEL = 'warn';

      configManager.loadFromEnv();
      
      const config = configManager.getConfig();
      expect(config.browserPool.maxSize).toBe(8);
      expect(config.browserPool.launchOptions.headless).toBe(false);
      expect(config.defaultOptions.retries).toBe(7);
      expect(config.logging.level).toBe('warn');
    });
  });

  describe('programmatic configuration', () => {
    it('should update configuration programmatically', () => {
      configManager.updateConfig({
        browserPool: {
          maxSize: 15,
        },
        defaultOptions: {
          retries: 10,
        },
      });
      
      const config = configManager.getConfig();
      expect(config.browserPool.maxSize).toBe(15);
      expect(config.defaultOptions.retries).toBe(10);
    });
  });

  describe('profiles', () => {
    it('should load and apply profiles', () => {
      const configWithProfiles = `
profiles:
  development:
    name: development
    description: Development profile
    config:
      browserPool:
        maxSize: 2
      logging:
        level: debug
  production:
    name: production
    description: Production profile
    config:
      browserPool:
        maxSize: 10
      logging:
        level: error
`;
      
      writeFileSync(testConfigPath, configWithProfiles);
      configManager.loadFromFile(testConfigPath);
      
      const profiles = configManager.getProfiles();
      expect(profiles).toHaveLength(2);
      expect(profiles[0].name).toBe('development');
      expect(profiles[1].name).toBe('production');
      
      configManager.applyProfile('development');
      const devConfig = configManager.getConfig();
      expect(devConfig.browserPool.maxSize).toBe(2);
      expect(devConfig.logging.level).toBe('debug');
      
      configManager.applyProfile('production');
      const prodConfig = configManager.getConfig();
      expect(prodConfig.browserPool.maxSize).toBe(10);
      expect(prodConfig.logging.level).toBe('error');
    });
  });

  describe('validation', () => {
    it('should validate valid configuration', () => {
      const validConfig = {
        browserPool: {
          maxSize: 5,
          maxAge: 30000,
        },
        defaultOptions: {
          retries: 3,
          timeout: 30000,
        },
      };
      
      const validation = configManager.validateConfig(validConfig);
      expect(validation.valid).toBe(true);
    });

    it('should reject invalid configuration', () => {
      const invalidConfig = {
        browserPool: {
          maxSize: -1, // Invalid
          maxAge: 'invalid', // Invalid
        },
      };
      
      const validation = configManager.validateConfig(invalidConfig as any);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('export', () => {
    it('should export configuration as YAML', () => {
      const yaml = configManager.exportConfig('yaml');
      expect(yaml).toContain('browserPool:');
      expect(yaml).toContain('defaultOptions:');
      expect(yaml).toContain('logging:');
    });

    it('should export configuration as JSON', () => {
      const json = configManager.exportConfig('json');
      const parsed = JSON.parse(json);
      expect(parsed.browserPool).toBeDefined();
      expect(parsed.defaultOptions).toBeDefined();
      expect(parsed.logging).toBeDefined();
    });
  });
});

describe('ConfigBuilder', () => {
  it('should build configuration fluently', () => {
    const config = createConfig()
      .browserPool({ maxSize: 8, maxAge: 60000 })
      .defaultOptions({ retries: 5, timeout: 45000 })
      .plugins(['retry', 'cache'])
      .logging({ level: 'debug', format: 'json' })
      .build();

    expect(config.browserPool?.maxSize).toBe(8);
    expect(config.browserPool?.maxAge).toBe(60000);
    expect(config.defaultOptions?.retries).toBe(5);
    expect(config.defaultOptions?.timeout).toBe(45000);
    expect(config.plugins).toEqual(['retry', 'cache']);
    expect(config.logging?.level).toBe('debug');
    expect(config.logging?.format).toBe('json');
  });
});

