import { createContext, useContext, type ReactNode } from "react";

export interface ErrorRecoveryContextValue {
  reset: () => void;
  retryCount: number;
}

const ErrorRecoveryContext = createContext<ErrorRecoveryContextValue | null>(
  null
);

export function useErrorRecoveryContext(): ErrorRecoveryContextValue {
  const value = useContext(ErrorRecoveryContext);
  if (value === null) {
    throw new Error(
      "useErrorRecovery must be used within an error boundary fallback (e.g. inside GlobalErrorBoundary or RouteErrorBoundary fallback)."
    );
  }
  return value;
}

export function ErrorRecoveryProvider(props: {
  children: ReactNode;
  value: ErrorRecoveryContextValue;
}) {
  return (
    <ErrorRecoveryContext.Provider value={props.value}>
      {props.children}
    </ErrorRecoveryContext.Provider>
  );
}
