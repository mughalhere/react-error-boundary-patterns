import type { ClassifiedError } from "../types";

const CHUNK_LOAD_PATTERNS = [
  /loading chunk \d+ failed/i,
  /loading CSS chunk \d+ failed/i,
  /chunkloaderror/i,
  /failed to fetch dynamically imported module/i,
];

const NETWORK_PATTERNS = [
  /network error/i,
  /failed to fetch/i,
  /network request failed/i,
  /load failed/i,
  /err_connection_refused/i,
  /err_connection_reset/i,
];

const PERMISSION_PATTERNS = [
  /permission denied/i,
  /access denied/i,
  /forbidden/i,
  /401/i,
  /403/i,
];

/**
 * Classifies an error for smarter fallback UX (user message, retryable, etc.).
 * Handles non-Error throws by wrapping in Error and classifying as unknown.
 *
 * @param error - The thrown value (may be Error or other)
 * @returns Classification with type, recoverable, userMessage, retryable
 * @public
 */
export function classifyError(error: unknown): ClassifiedError {
  const err = normalizeToError(error);
  const message = err.message.toLowerCase();

  if (matchesPatterns(message, CHUNK_LOAD_PATTERNS)) {
    return {
      type: "chunk-load",
      recoverable: true,
      userMessage: "A code update failed to load. Please refresh the page.",
      retryable: true,
    };
  }

  if (matchesPatterns(message, NETWORK_PATTERNS)) {
    return {
      type: "network",
      recoverable: true,
      userMessage: "A network error occurred. Check your connection and try again.",
      retryable: true,
    };
  }

  if (matchesPatterns(message, PERMISSION_PATTERNS)) {
    return {
      type: "permission",
      recoverable: false,
      userMessage: "You don't have permission to perform this action.",
      retryable: false,
    };
  }

  // Render errors are typically from component render/lifecycle
  // We don't have a reliable message pattern; treat as unknown if not matched above
  return {
    type: "unknown",
    recoverable: true,
    userMessage: "Something went wrong. You can try again.",
    retryable: true,
  };
}

function matchesPatterns(message: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(message));
}

function normalizeToError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  try {
    return new Error(String(error));
  } catch {
    return new Error("An unknown error occurred");
  }
}
