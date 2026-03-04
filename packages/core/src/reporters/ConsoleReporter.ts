import type { ErrorReporter } from "./types";
import type { ErrorContext } from "./types";
import { serializeError } from "../utils/errorSerializer";

/**
 * Reporter that logs errors to the console with context.
 * Useful for development and demos.
 *
 * @public
 */
export class ConsoleReporter implements ErrorReporter {
  /** Optional prefix for log messages */
  constructor(public readonly prefix = "[ErrorBoundary]") {}

  report(error: Error, context: ErrorContext): void {
    const payload = {
      error: serializeError(error),
      context: {
        boundaryName: context.boundaryName,
        routeName: context.routeName,
        featureName: context.featureName,
        componentStack: context.componentStack,
        ...context.extra,
      },
    };
    if (typeof console !== "undefined" && console.error) {
      console.error(this.prefix, payload);
    }
  }
}
