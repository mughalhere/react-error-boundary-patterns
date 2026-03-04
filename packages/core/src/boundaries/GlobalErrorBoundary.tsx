import {
  Component,
  type ErrorInfo,
  type ReactNode,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import type { GlobalErrorBoundaryProps, ErrorBoundaryRef } from "../types";
import type { ErrorContext } from "../reporters/types";
import { ErrorRecoveryProvider } from "../context/ErrorRecoveryContext";

const MAX_RETRIES = 3;

interface GlobalState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

/**
 * Wraps the entire application. Catches all render errors and optionally
 * reports them. Tracks retry count to prevent infinite re-render loops.
 *
 * @public
 */
class GlobalErrorBoundaryClass extends Component<
  GlobalErrorBoundaryProps & { registerReset?: (reset: () => void) => void }
> {
  state: GlobalState = {
    error: null,
    errorInfo: null,
    retryCount: 0,
  };

  override componentDidMount(): void {
    this.props.registerReset?.(this.reset);
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { reporter, onError } = this.props;
    const context: ErrorContext = {
      componentStack: errorInfo.componentStack ?? undefined,
      boundaryName: "GlobalErrorBoundary",
      extra: { retryCount: this.state.retryCount },
    };

    if (reporter) {
      try {
        reporter.report(error, context);
      } catch (e) {
        // Avoid breaking the app if reporter throws
      }
    }
    onError?.(error, errorInfo);

    this.setState((prev: GlobalState) => ({
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
    const { children, fallback, showDialog } = this.props;

    if (error && retryCount <= MAX_RETRIES) {
      const reset = this.reset;
      const fallbackContent =
        typeof fallback === "function"
          ? fallback(error, reset)
          : fallback ?? (
              <div role="alert">
                Something went wrong. Refresh the page or try again.
              </div>
            );

      const content = showDialog ? (
        <div data-error-boundary-dialog>{fallbackContent}</div>
      ) : (
        fallbackContent
      );

      return (
        <ErrorRecoveryProvider
          value={{ reset, retryCount }}
        >
          {content}
        </ErrorRecoveryProvider>
      );
    }

    if (error && retryCount > MAX_RETRIES) {
      return (
        <div role="alert">
          Too many errors. Please refresh the page.
        </div>
      );
    }

    return children;
  }
}

export const GlobalErrorBoundary = forwardRef<
  ErrorBoundaryRef,
  GlobalErrorBoundaryProps
>(function GlobalErrorBoundary(props, ref) {
  const resetRef = useRef<() => void>();

  useImperativeHandle(
    ref,
    () => ({
      reset: () => resetRef.current?.(),
    }),
    []
  );

  return (
    <GlobalErrorBoundaryClass
      {...props}
      registerReset={(reset) => {
        resetRef.current = reset;
      }}
    />
  );
});
