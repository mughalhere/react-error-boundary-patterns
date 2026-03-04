import { Component, type ErrorInfo, type ReactNode } from "react";
import type { RouteErrorBoundaryProps } from "../types";
import type { ErrorContext } from "../reporters/types";
import { ErrorRecoveryProvider } from "../context/ErrorRecoveryContext";

interface RouteState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

const MAX_RETRIES = 3;

/**
 * Designed to wrap individual React Router v6 routes. Provides route name
 * in context for reporting. When isolate is true, errors do not bubble up.
 *
 * @public
 */
export class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteState
> {
  state: RouteState = {
    error: null,
    errorInfo: null,
    retryCount: 0,
  };

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { reporter, routeName } = this.props;
    const context: ErrorContext = {
      componentStack: errorInfo.componentStack ?? undefined,
      boundaryName: "RouteErrorBoundary",
      routeName,
      extra: { retryCount: this.state.retryCount },
    };

    if (reporter) {
      try {
        reporter.report(error, context);
      } catch {
        // Avoid breaking the app if reporter throws
      }
    }

    this.setState((prev) => ({
      error,
      errorInfo,
      retryCount: Math.min(prev.retryCount + 1, MAX_RETRIES),
    }));
  }

  reset = (): void => {
    this.setState({ error: null, errorInfo: null });
  };

  override render(): ReactNode {
    const { error, retryCount } = this.state;
    const { children, fallback, routeName } = this.props;

    if (error && retryCount <= MAX_RETRIES) {
      const reset = this.reset;
      const fallbackContent =
        typeof fallback === "function"
          ? fallback(error, reset)
          : fallback ?? (
              <div role="alert">
                Something went wrong on this page ({routeName}). Try again.
              </div>
            );

      return (
        <ErrorRecoveryProvider value={{ reset, retryCount }}>
          {fallbackContent}
        </ErrorRecoveryProvider>
      );
    }

    if (error && retryCount > MAX_RETRIES) {
      return (
        <div role="alert">
          Too many errors on this route. Please refresh.
        </div>
      );
    }

    return children;
  }
}
