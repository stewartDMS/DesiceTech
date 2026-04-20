'use strict';

const pino = require('pino');

/**
 * Structured pino logger – use this in new code.
 * The legacy logger at common/logger/index.js remains for backward compatibility.
 *
 * Usage:
 *   const logger = require('./common/logger/pino');
 *   logger.info({ userId }, 'User logged in');
 *   logger.error({ err }, 'Something went wrong');
 */
const logger = pino({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
});

module.exports = logger;
