import { env } from '../config/env';

/**
 * Tiny logger wrapper. Centralized so we can later route logs to Sentry,
 * Datadog, etc. without touching call sites. In production we silence
 * `debug` and `info` to avoid noisy console output.
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

const shouldLog = (level: Level): boolean => {
  if (__DEV__) return true;
  return level === 'warn' || level === 'error';
};

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) console.debug('[debug]', ...args);
  },
  info: (...args: unknown[]) => {
    if (shouldLog('info')) console.info('[info]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) console.warn('[warn]', ...args);
  },
  error: (...args: unknown[]) => {
    if (shouldLog('error')) console.error('[error]', ...args);
  },
};
