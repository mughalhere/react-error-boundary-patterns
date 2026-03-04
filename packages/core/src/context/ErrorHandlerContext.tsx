import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type SetError = (error: Error) => void;

const ErrorHandlerContext = createContext<SetError | null>(null);

export function useErrorHandlerContext(): SetError {
  const setError = useContext(ErrorHandlerContext);
  if (setError === null) {
    throw new Error(
      "useErrorHandler must be used within an ErrorHandlerProvider. Wrap your app (inside an error boundary) with ErrorHandlerProvider."
    );
  }
  return setError;
}

/**
 * Holds error state so that useErrorHandler can trigger a re-render that throws.
 * Must be used inside an error boundary. Renders a ThrowIfError sibling that
 * throws when error is set, so the boundary catches it.
 *
 * @internal
 */
export function ErrorHandlerProvider(props: { children: ReactNode }) {
  const [error, setErrorState] = useState<Error | null>(null);
  const setError = useCallback((e: Error) => {
    setErrorState(e);
  }, []);

  return (
    <ErrorHandlerContext.Provider value={setError}>
      <ThrowIfError error={error} />
      {props.children}
    </ErrorHandlerContext.Provider>
  );
}

function ThrowIfError({ error }: { error: Error | null }) {
  if (error) throw error;
  return null;
}
