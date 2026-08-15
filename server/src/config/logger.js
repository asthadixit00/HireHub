// PURPOSE: Centralized logging configuration
// WHY: console.log disappears when server restarts
// Winston saves logs to files so you can debug
// production issues even after they happen

import winston from 'winston';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',

  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // log stack traces
    logFormat
  ),

  transports: [
    // Console output (development)
    new winston.transports.Console({
      format: combine(colorize(), logFormat)
    }),

    // Error log file (production debugging)
    new winston.transports.File({
      filename: join(__dirname, '../../logs/error.log'),
      level: 'error'
    }),

    // Combined log file
    new winston.transports.File({
      filename: join(__dirname, '../../logs/combined.log')
    })
  ]
});

export default logger;