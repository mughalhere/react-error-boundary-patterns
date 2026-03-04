/**
 * Context passed to reporters when an error is caught.
 * @public
 */
export interface ErrorContext {
  componentStack?: string;
  boundaryName?: string;
  routeName?: string;
  featureName?: string;
  userId?: string;
  extra?: Record<string, unknown>;
}

/**
 * Pluggable interface for reporting errors (Sentry, custom backend, etc.).
 * @public
 */
export interface ErrorReporter {
  /**
   * Report an error with optional context.
   * May be sync or async; boundaries do not await.
   */
  report(error: Error, context: ErrorContext): void | Promise<void>;
}
