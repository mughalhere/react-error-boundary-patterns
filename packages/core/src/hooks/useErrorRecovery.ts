import { useCallback, useState } from "react";
import { useErrorRecoveryContext } from "../context/ErrorRecoveryContext";

export interface UseErrorRecoveryOptions {
  /** Max number of retries before giving up (default 3) */
  maxRetries?: number;
  /** Delay in ms before allowing retry (default 0) */
  retryDelay?: number;
}

/**
 * Provides reset/retry state for use inside fallback components.
 * Must be used within a boundary that provides ErrorRecoveryContext
 * (e.g. GlobalErrorBoundary or RouteErrorBoundary with fallback).
 *
 * @param options - Optional maxRetries and retryDelay
 * @returns { retry, retryCount, isRecovering }
 * @public
 */
export function useErrorRecovery(
  options: UseErrorRecoveryOptions = {}
): {
  retry: () => void;
  retryCount: number;
  isRecovering: boolean;
} {
  const { maxRetries = 3, retryDelay = 0 } = options;
  const { reset, retryCount } = useErrorRecoveryContext();
  const [isRecovering, setIsRecovering] = useState(false);

  const retry = useCallback(() => {
    if (retryCount >= maxRetries) return;
    setIsRecovering(true);
    if (retryDelay > 0) {
      setTimeout(() => {
        reset();
        setIsRecovering(false);
      }, retryDelay);
    } else {
      reset();
      setIsRecovering(false);
    }
  }, [maxRetries, retryDelay, reset, retryCount]);

  return { retry, retryCount, isRecovering };
}
