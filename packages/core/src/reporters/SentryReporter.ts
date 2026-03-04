import type { ErrorReporter } from "./types";
import type { ErrorContext } from "./types";

/** Optional Sentry SDK captureException (avoids hard peer dependency) */
type CaptureException = (error: Error, context?: Record<string, unknown>) => void;

export interface SentryReporterOptions {
  /** Sentry DSN (optional — graceful no-op if Sentry not loaded) */
  dsn?: string;
  /** Environment (e.g. production, staging) */
  environment?: string;
  /** Lazy getter for Sentry — allows apps to pass @sentry/react's captureException */
  getCaptureException?: () => CaptureException | undefined;
}

/**
 * Reporter that sends errors to Sentry when available.
 * If Sentry is not loaded or getCaptureException returns undefined, report is a no-op.
 *
 * @public
 */
export class SentryReporter implements ErrorReporter {
  private readonly options: SentryReporterOptions;

  constructor(options: SentryReporterOptions = {}) {
    this.options = options;
  }

  report(error: Error, context: ErrorContext): void {
    const capture = this.getCapture();
    if (!capture) return;

    const extra: Record<string, unknown> = {
      boundaryName: context.boundaryName,
      routeName: context.routeName,
      featureName: context.featureName,
      ...context.extra,
    };
    if (context.componentStack) {
      extra.componentStack = context.componentStack;
    }
    if (context.userId) {
      extra.userId = context.userId;
    }

    try {
      capture(error, { extra });
    } catch {
      // Avoid breaking the app if Sentry fails
    }
  }

  private getCapture(): CaptureException | undefined {
    if (this.options.getCaptureException) {
      return this.options.getCaptureException();
    }
    // When Sentry is used, pass getCaptureException in options so the app provides captureException.
    return undefined;
  }
}
