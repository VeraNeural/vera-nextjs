import { env } from '@/lib/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogMeta = Record<string, unknown> | Error | undefined;

const SENSITIVE_KEYWORDS = ['authorization', 'token', 'secret', 'password', 'cookie', 'apikey', 'accesskey', 'auth'];
const REDACT_TEXT_KEYS = ['prompt', 'message', 'content', 'text', 'body', 'history'];

function isError(value: unknown): value is Error {
  return value instanceof Error;
}

function redactString(key: string | undefined, value: string): string {
  const lowerKey = key?.toLowerCase() ?? '';
  if (SENSITIVE_KEYWORDS.some((keyword) => lowerKey.includes(keyword))) {
    return '[redacted]';
  }
  if (REDACT_TEXT_KEYS.some((keyword) => lowerKey.includes(keyword))) {
    return `[redacted:${value.length}chars]`;
  }
  return value;
}

function sanitizeMeta(value: unknown, key?: string): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return redactString(key, value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (isError(value)) {
    return {
      name: value.name,
      message: redactString('message', value.message ?? ''),
      stack: env.app.debugLogs ? value.stack : undefined,
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeMeta(item, key));
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([childKey, childValue]) => [childKey, sanitizeMeta(childValue, childKey)] as const);
    return Object.fromEntries(entries);
  }

  return value;
}

function log(level: LogLevel, message: string, meta?: LogMeta) {
  if (level === 'debug' && !env.app.debugLogs) {
    return;
  }

  const sanitizedMeta = sanitizeMeta(meta);
  const payload: Record<string, unknown> = {
    ts: new Date().toISOString(),
    level,
    message,
  };

  if (sanitizedMeta && typeof sanitizedMeta === 'object') {
    payload.meta = sanitizedMeta;
  }

  const consoleMethod = level === 'debug' ? 'log' : level;
  (console as Record<string, (...args: unknown[]) => void>)[consoleMethod](JSON.stringify(payload));
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => log('debug', message, meta),
  info: (message: string, meta?: LogMeta) => log('info', message, meta),
  warn: (message: string, meta?: LogMeta) => log('warn', message, meta),
  error: (message: string, meta?: LogMeta) => log('error', message, meta),
};
