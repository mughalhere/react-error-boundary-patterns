import type { FeatureErrorBoundaryProps } from "../types";
import { ErrorBoundaryInner } from "./ErrorBoundaryInner";

/**
 * Lightweight boundary for isolating individual features/widgets.
 * When silent is true, only reports and renders nothing (or null).
 *
 * @public
 */
export function FeatureErrorBoundary({
  children,
  featureName,
  fallback,
  silent,
  reporter,
}: FeatureErrorBoundaryProps) {
  return (
    <ErrorBoundaryInner
      boundaryName="FeatureErrorBoundary"
      featureName={featureName}
      silent={silent}
      defaultFallbackMessage="This feature encountered an error."
      fallback={fallback}
      reporter={reporter}
    >
      {children}
    </ErrorBoundaryInner>
  );
}
