import { sanitizePayload, sanitizeString } from './sanitizer';
import type { LogContext, LogEntry, LogLevel } from './types';

const LEVEL_SEVERITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export class Logger {
  private minLevelSeverity: number;
  private defaultContext: LogContext;
  private entries: LogEntry[] = [];
  private emitToConsole: boolean;

  constructor(minLevel: LogLevel = 'info', defaultContext: LogContext = {}, emitToConsole = true) {
    this.minLevelSeverity = LEVEL_SEVERITY[minLevel] || 20;
    this.defaultContext = defaultContext;
    this.emitToConsole = emitToConsole;
  }

  child(context: LogContext): Logger {
    return new Logger(
      this.getLevelFromSeverity(this.minLevelSeverity),
      { ...this.defaultContext, ...context },
      this.emitToConsole
    );
  }

  private getLevelFromSeverity(sev: number): LogLevel {
    if (sev <= 10) return 'debug';
    if (sev <= 20) return 'info';
    if (sev <= 30) return 'warn';
    return 'error';
  }

  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    error?: Error
  ): LogEntry | null {
    if (LEVEL_SEVERITY[level] < this.minLevelSeverity) {
      return null;
    }

    const cleanMessage = sanitizeString(message);
    const cleanContext = sanitizePayload(this.defaultContext);
    const cleanData = data ? sanitizePayload(data) : undefined;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: cleanMessage,
      context: Object.keys(cleanContext).length > 0 ? cleanContext : undefined,
      data: cleanData,
      error: error
        ? {
            name: error.name,
            message: sanitizeString(error.message),
            stack: error.stack ? sanitizeString(error.stack) : undefined,
          }
        : undefined,
    };

    this.entries.push(entry);

    if (this.emitToConsole) {
      const serialized = JSON.stringify(entry);
      if (level === 'error') {
        console.error(serialized);
      } else if (level === 'warn') {
        console.warn(serialized);
      } else {
        console.log(serialized);
      }
    }

    return entry;
  }

  debug(message: string, data?: Record<string, unknown>): LogEntry | null {
    return this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>): LogEntry | null {
    return this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): LogEntry | null {
    return this.log('warn', message, data);
  }

  error(message: string, error?: Error, data?: Record<string, unknown>): LogEntry | null {
    return this.log('error', message, data, error);
  }

  getEntries(): readonly LogEntry[] {
    return [...this.entries];
  }

  clearEntries(): void {
    this.entries = [];
  }
}
