import { Component, type ErrorInfo, type ReactNode } from "react";
import type { ErrorContext } from "../reporters/types";
import { ErrorRecoveryProvider } from "../context/ErrorRecoveryContext";

export type ErrorBoundaryInnerFallback =
  | ReactNode
  | ((error: Error, reset: () => void) => ReactNode);

/**
 * Internal props for the single class-based error boundary.
 * Not exported; used by GlobalErrorBoundary, RouteErrorBoundary, FeatureErrorBoundary.
 */
export interface ErrorBoundaryInnerProps {
  children: ReactNode;
  fallback?: ErrorBoundaryInnerFallback;
  onError?: (error: Error, info: ErrorInfo) => void;
  reporter?: import("../reporters/types").ErrorReporter;
  boundaryName: string;
  routeName?: string;
  featureName?: string;
  /** When set (e.g. 3), tracks retries and shows "too many errors" when exceeded. When undefined/0, no retry limit (single catch). */
  maxRetries?: number;
  /** When true, render null instead of fallback (feature silent mode). */
  silent?: boolean;
  /** When true, wrap fallback in a dialog container (global only). */
  showDialog?: boolean;
  /** Called on mount with reset callback for ref forwarding. */
  registerReset?: (reset: () => void) => void;
  /** When true, wrap fallback content in ErrorRecoveryProvider. */
  useRecoveryProvider?: boolean;
  /** Default message when fallback is not provided. */
  defaultFallbackMessage?: string;
  /** Message when retry count exceeds maxRetries. */
  tooManyErrorsMessage?: string;
}

interface ErrorBoundaryInnerState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

/**
 * Single internal class component that implements React error boundary lifecycle.
 * React only supports getDerivedStateFromError/componentDidCatch on class components.
 * All public boundaries delegate to this; it is not exported.
 */
export class ErrorBoundaryInner extends Component<
  ErrorBoundaryInnerProps,
  ErrorBoundaryInnerState
> {
  override state: ErrorBoundaryInnerState = {
    error: null,
    errorInfo: null,
    retryCount: 0,
  };

  override componentDidMount(): void {
    this.props.registerReset?.(this.reset);
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { reporter, onError, boundaryName, routeName, featureName } =
      this.props;
    const context: ErrorContext = {
      componentStack: errorInfo.componentStack ?? undefined,
      boundaryName,
      routeName,
      featureName,
      extra:
        this.props.maxRetries != null && this.props.maxRetries > 0
          ? { retryCount: this.state.retryCount }
          : undefined,
    };

    if (reporter) {
      try {
        reporter.report(error, context);
      } catch {
        // Avoid breaking the app if reporter throws
      }
    }
    onError?.(error, errorInfo);

    const maxRetries = this.props.maxRetries ?? 0;
    this.setState((prev) => ({
      error,
      errorInfo,
      retryCount:
        maxRetries > 0
          ? Math.min(prev.retryCount + 1, maxRetries)
          : prev.retryCount,
    }));
  }

  reset = (): void => {
    this.setState({ error: null, errorInfo: null });
  };

  override render(): ReactNode {
    const { error, retryCount } = this.state;
    const {
      children,
      fallback,
      maxRetries = 0,
      silent,
      showDialog,
      useRecoveryProvider,
      defaultFallbackMessage = "Something went wrong. Refresh the page or try again.",
      tooManyErrorsMessage = "Too many errors. Please refresh the page.",
      featureName,
    } = this.props;

    if (!error) {
      return children;
    }

    // Feature silent mode: report only, render nothing
    if (silent) {
      return null;
    }

    // Retry limit exceeded (Global/Route only)
    if (maxRetries > 0 && retryCount > maxRetries) {
      return <div role="alert">{tooManyErrorsMessage}</div>;
    }

    const reset = this.reset;
    const fallbackContent =
      typeof fallback === "function"
        ? fallback(error, reset)
        : fallback ?? (
            <div
              role="alert"
              {...(featureName ? { "data-feature-error": featureName } : {})}
            >
              {defaultFallbackMessage}
            </div>
          );

    const content = showDialog ? (
      <div data-error-boundary-dialog>{fallbackContent}</div>
    ) : (
      fallbackContent
    );

    if (useRecoveryProvider) {
      return (
        <ErrorRecoveryProvider value={{ reset, retryCount }}>
          {content}
        </ErrorRecoveryProvider>
      );
    }

    return content;
  }
}
