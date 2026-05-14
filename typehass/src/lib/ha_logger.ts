export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LOG_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 999,
};

export type Logger = {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
  child: (scope: string) => Logger;
};

export function createLogger(
  scope: string,
  level: LogLevel = "info",
): Logger {
  const shouldLog = (messageLevel: Exclude<LogLevel, "silent">) =>
    LOG_PRIORITY[messageLevel] >= LOG_PRIORITY[level];

  const format = (message: string) =>
    `${new Date().toISOString()} [${scope}] ${message}`;

  return {
    debug(message, data) {
      if (shouldLog("debug")) console.debug(format(message), data ?? "");
    },

    info(message, data) {
      if (shouldLog("info")) console.info(format(message), data ?? "");
    },

    warn(message, data) {
      if (shouldLog("warn")) console.warn(format(message), data ?? "");
    },

    error(message, data) {
      if (shouldLog("error")) console.error(format(message), data ?? "");
    },

    child(childScope) {
      return createLogger(`${scope}:${childScope}`, level);
    },
  };
}