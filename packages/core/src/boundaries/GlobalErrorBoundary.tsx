import { forwardRef, useImperativeHandle, useRef } from "react";
import type { GlobalErrorBoundaryProps, ErrorBoundaryRef } from "../types";
import { ErrorBoundaryInner } from "./ErrorBoundaryInner";

const MAX_RETRIES = 3;

/**
 * Wraps the entire application. Catches all render errors and optionally
 * reports them. Tracks retry count to prevent infinite re-render loops.
 *
 * @public
 */
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
    <ErrorBoundaryInner
      boundaryName="GlobalErrorBoundary"
      maxRetries={MAX_RETRIES}
      useRecoveryProvider
      defaultFallbackMessage="Something went wrong. Refresh the page or try again."
      tooManyErrorsMessage="Too many errors. Please refresh the page."
      {...props}
      registerReset={(reset) => {
        resetRef.current = reset;
      }}
      showDialog={props.showDialog}
    />
  );
});
