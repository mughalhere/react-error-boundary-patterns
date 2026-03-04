import { type ReactNode } from "react";
import { FeatureErrorBoundary } from "./FeatureErrorBoundary";

/**
 * Thin wrapper around FeatureErrorBoundary for async/loading boundaries.
 * Use with useErrorHandler to catch async errors in a specific section.
 *
 * @public
 */
export interface AsyncErrorBoundaryProps {
  children: ReactNode;
  /** Identifier for the async section (e.g. "DashboardData") */
  name: string;
  fallback?: ReactNode;
  reporter?: import("../reporters/types").ErrorReporter;
}

export function AsyncErrorBoundary({
  children,
  name,
  fallback,
  reporter,
}: AsyncErrorBoundaryProps): ReactNode {
  return (
    <FeatureErrorBoundary
      featureName={name}
      fallback={fallback}
      reporter={reporter}
    >
      {children}
    </FeatureErrorBoundary>
  );
}
