import type { RouteErrorBoundaryProps } from "../types";
import { ErrorBoundaryInner } from "./ErrorBoundaryInner";

const MAX_RETRIES = 3;

/**
 * Designed to wrap individual React Router v6 routes. Provides route name
 * in context for reporting. When isolate is true, errors do not bubble up.
 *
 * @public
 */
export function RouteErrorBoundary({
  children,
  routeName,
  fallback,
  reporter,
}: RouteErrorBoundaryProps) {
  return (
    <ErrorBoundaryInner
      boundaryName="RouteErrorBoundary"
      routeName={routeName}
      maxRetries={MAX_RETRIES}
      useRecoveryProvider
      defaultFallbackMessage={`Something went wrong on this page (${routeName}). Try again.`}
      tooManyErrorsMessage="Too many errors on this route. Please refresh."
      fallback={fallback}
      reporter={reporter}
    >
      {children}
    </ErrorBoundaryInner>
  );
}
