import { validators, schemas, validateWithSchema } from '@/utils/validators';

describe('validators', () => {
  describe('email', () => {
    it('should validate correct email addresses', () => {
      expect(validators.email('test@example.com')).toBe(true);
      expect(validators.email('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validators.email('invalid-email')).toBe('Invalid email format');
      expect(validators.email('test@')).toBe('Invalid email format');
      expect(validators.email('@example.com')).toBe('Invalid email format');
    });
  });

  describe('url', () => {
    it('should validate correct URLs', () => {
      expect(validators.url('https://example.com')).toBe(true);
      expect(validators.url('http://localhost:3000')).toBe(true);
      expect(validators.url('ftp://files.example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validators.url('not-a-url')).toBe('Invalid URL format');
      expect(validators.url('http://')).toBe('Invalid URL format');
      expect(validators.url('')).toBe('Invalid URL format');
    });
  });

  describe('nonEmptyString', () => {
    it('should validate non-empty strings', () => {
      expect(validators.nonEmptyString('hello')).toBe(true);
      expect(validators.nonEmptyString('  test  ')).toBe(true);
    });

    it('should reject empty strings', () => {
      expect(validators.nonEmptyString('')).toBe('Value must be a non-empty string');
      expect(validators.nonEmptyString('   ')).toBe('Value must be a non-empty string');
      expect(validators.nonEmptyString(123 as any)).toBe('Value must be a non-empty string');
    });
  });

  describe('positiveNumber', () => {
    it('should validate positive numbers', () => {
      expect(validators.positiveNumber(1)).toBe(true);
      expect(validators.positiveNumber(0.1)).toBe(true);
      expect(validators.positiveNumber(1000)).toBe(true);
    });

    it('should reject non-positive numbers', () => {
      expect(validators.positiveNumber(0)).toBe('Value must be a positive number');
      expect(validators.positiveNumber(-1)).toBe('Value must be a positive number');
      expect(validators.positiveNumber('5' as any)).toBe('Value must be a positive number');
    });
  });

  describe('minArrayLength', () => {
    it('should validate arrays with minimum length', () => {
      const validator = validators.minArrayLength(2);
      expect(validator([1, 2])).toBe(true);
      expect(validator([1, 2, 3])).toBe(true);
    });

    it('should reject arrays below minimum length', () => {
      const validator = validators.minArrayLength(2);
      expect(validator([])).toBe('Array must have at least 2 items');
      expect(validator([1])).toBe('Array must have at least 2 items');
      expect(validator('not-array' as any)).toBe('Array must have at least 2 items');
    });
  });

  describe('hasProperties', () => {
    it('should validate objects with required properties', () => {
      const validator = validators.hasProperties(['name', 'age']);
      expect(validator({ name: 'John', age: 30 })).toBe(true);
      expect(validator({ name: 'John', age: 30, extra: 'value' })).toBe(true);
    });

    it('should reject objects missing required properties', () => {
      const validator = validators.hasProperties(['name', 'age']);
      expect(validator({ name: 'John' })).toBe('Missing required properties: age');
      expect(validator({})).toBe('Missing required properties: name, age');
    });
  });
});

describe('schemas', () => {
  describe('url', () => {
    it('should validate URLs', () => {
      expect(() => schemas.url.parse('https://example.com')).not.toThrow();
      expect(() => schemas.url.parse('invalid-url')).toThrow();
    });
  });

  describe('email', () => {
    it('should validate emails', () => {
      expect(() => schemas.email.parse('test@example.com')).not.toThrow();
      expect(() => schemas.email.parse('invalid-email')).toThrow();
    });
  });

  describe('nonEmptyString', () => {
    it('should validate non-empty strings', () => {
      expect(() => schemas.nonEmptyString.parse('hello')).not.toThrow();
      expect(() => schemas.nonEmptyString.parse('')).toThrow();
    });
  });

  describe('positiveNumber', () => {
    it('should validate positive numbers', () => {
      expect(() => schemas.positiveNumber.parse(5)).not.toThrow();
      expect(() => schemas.positiveNumber.parse(0)).toThrow();
      expect(() => schemas.positiveNumber.parse(-1)).toThrow();
    });
  });

  describe('port', () => {
    it('should validate port numbers', () => {
      expect(() => schemas.port.parse(80)).not.toThrow();
      expect(() => schemas.port.parse(3000)).not.toThrow();
      expect(() => schemas.port.parse(65535)).not.toThrow();
      expect(() => schemas.port.parse(0)).toThrow();
      expect(() => schemas.port.parse(65536)).toThrow();
      expect(() => schemas.port.parse(3.14)).toThrow();
    });
  });

  describe('timeout', () => {
    it('should validate timeout values', () => {
      expect(() => schemas.timeout.parse(1000)).not.toThrow();
      expect(() => schemas.timeout.parse(30000)).not.toThrow();
      expect(() => schemas.timeout.parse(300000)).not.toThrow();
      expect(() => schemas.timeout.parse(500)).toThrow();
      expect(() => schemas.timeout.parse(400000)).toThrow();
    });
  });

  describe('retryCount', () => {
    it('should validate retry counts', () => {
      expect(() => schemas.retryCount.parse(0)).not.toThrow();
      expect(() => schemas.retryCount.parse(5)).not.toThrow();
      expect(() => schemas.retryCount.parse(10)).not.toThrow();
      expect(() => schemas.retryCount.parse(-1)).toThrow();
      expect(() => schemas.retryCount.parse(11)).toThrow();
    });
  });
});

describe('validateWithSchema', () => {
  it('should return true for valid data', () => {
    const result = validateWithSchema(schemas.email, 'test@example.com');
    expect(result).toBe(true);
  });

  it('should return error message for invalid data', () => {
    const result = validateWithSchema(schemas.email, 'invalid-email');
    expect(typeof result).toBe('string');
    expect(result).toContain('Invalid email');
  });

  it('should handle complex schemas', () => {
    const complexSchema = schemas.nonEmptyString.min(5).max(20);
    
    expect(validateWithSchema(complexSchema, 'hello')).toBe(true);
    expect(validateWithSchema(complexSchema, 'hi')).toContain('at least 5');
    expect(validateWithSchema(complexSchema, 'this is a very long string')).toContain('at most 20');
  });
});

