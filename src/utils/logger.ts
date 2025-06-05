import winston from 'winston';

/**
 * Logger interface for the scraper toolkit
 */
export interface Logger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  filename?: string;
  console: boolean;
}

/**
 * Create a winston logger instance
 */
export function createLogger(config: LoggerConfig): Logger {
  const formats = [];

  // Add timestamp
  formats.push(winston.format.timestamp());

  // Add format based on config
  if (config.format === 'json') {
    formats.push(winston.format.json());
  } else {
    formats.push(
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`;
      })
    );
  }

  const transports: winston.transport[] = [];

  // Add console transport
  if (config.console) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          ...formats
        ),
      })
    );
  }

  // Add file transport
  if (config.filename) {
    transports.push(
      new winston.transports.File({
        filename: config.filename,
        format: winston.format.combine(...formats),
      })
    );
  }

  return winston.createLogger({
    level: config.level,
    transports,
    exitOnError: false,
  });
}

/**
 * Default logger configuration
 */
export const defaultLoggerConfig: LoggerConfig = {
  level: (process.env.LOG_LEVEL as any) || 'info',
  format: (process.env.LOG_FORMAT as any) || 'text',
  console: true,
};

/**
 * Create default logger
 */
export const defaultLogger = createLogger(defaultLoggerConfig);

