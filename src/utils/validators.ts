import { z } from 'zod';

/**
 * Validation result type
 */
export type ValidationResult = true | string;

/**
 * Validate input using a Zod schema
 */
export function validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult {
  try {
    schema.parse(data);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    }
    return String(error);
  }
}

/**
 * Common validation functions
 */
export const validators = {
  /**
   * Validate email format
   */
  email: (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Invalid email format';
  },

  /**
   * Validate URL format
   */
  url: (value: string): ValidationResult => {
    try {
      new URL(value);
      return true;
    } catch {
      return 'Invalid URL format';
    }
  },

  /**
   * Validate non-empty string
   */
  nonEmptyString: (value: string): ValidationResult => {
    return (typeof value === 'string' && value.trim().length > 0) || 'Value must be a non-empty string';
  },

  /**
   * Validate positive number
   */
  positiveNumber: (value: number): ValidationResult => {
    return (typeof value === 'number' && value > 0) || 'Value must be a positive number';
  },

  /**
   * Validate array with minimum length
   */
  minArrayLength: (minLength: number) => (value: unknown[]): ValidationResult => {
    return (Array.isArray(value) && value.length >= minLength) || 
           `Array must have at least ${minLength} items`;
  },

  /**
   * Validate object has required properties
   */
  hasProperties: (properties: string[]) => (value: Record<string, any>): ValidationResult => {
    const missing = properties.filter(prop => !(prop in value));
    return missing.length === 0 || `Missing required properties: ${missing.join(', ')}`;
  },
};

/**
 * Common Zod schemas
 */
export const schemas = {
  /**
   * URL schema
   */
  url: z.string().url(),

  /**
   * Email schema
   */
  email: z.string().email(),

  /**
   * Non-empty string schema
   */
  nonEmptyString: z.string().min(1),

  /**
   * Positive number schema
   */
  positiveNumber: z.number().positive(),

  /**
   * Port number schema
   */
  port: z.number().int().min(1).max(65535),

  /**
   * Timeout schema (in milliseconds)
   */
  timeout: z.number().int().min(1000).max(300000),

  /**
   * Retry count schema
   */
  retryCount: z.number().int().min(0).max(10),
};

/**
 * Validate input function (for backward compatibility)
 */
export function validateInput(input: unknown, validator?: (input: any) => ValidationResult): ValidationResult {
  if (!validator) return true;
  return validator(input);
}

/**
 * Validate output function (for backward compatibility)
 */
export function validateOutput(output: unknown, validator?: (output: any) => ValidationResult): ValidationResult {
  if (!validator) return true;
  return validator(output);
}

