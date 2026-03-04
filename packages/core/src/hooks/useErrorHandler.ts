import { useCallback } from "react";
import { useErrorHandlerContext } from "../context/ErrorHandlerContext";

/**
 * Returns a function that throws the given error in the render phase,
 * so the nearest error boundary will catch it. Use for async errors
 * (e.g. in useEffect, event handlers, fetch callbacks).
 *
 * @example
 * const throwError = useErrorHandler();
 * fetch('/api').catch(throwError);
 *
 * @returns (error: Error) => void — call with an Error to trigger the boundary
 * @public
 */
export function useErrorHandler(): (error: Error) => void {
  const setError = useErrorHandlerContext();
  return useCallback(
    (error: Error) => {
      setError(error);
    },
    [setError]
  );
}
