import { Component, type ErrorInfo, type ReactNode } from "react";
import type { FeatureErrorBoundaryProps } from "../types";
import type { ErrorContext } from "../reporters/types";

interface FeatureState {
  error: Error | null;
}

/**
 * Lightweight boundary for isolating individual features/widgets.
 * When silent is true, only reports and renders nothing (or null).
 *
 * @public
 */
export class FeatureErrorBoundary extends Component<
  FeatureErrorBoundaryProps,
  FeatureState
> {
  state: FeatureState = { error: null };

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { reporter, featureName } = this.props;
    const context: ErrorContext = {
      componentStack: errorInfo.componentStack ?? undefined,
      boundaryName: "FeatureErrorBoundary",
      featureName,
    };

    if (reporter) {
      try {
        reporter.report(error, context);
      } catch {
        // Avoid breaking the app if reporter throws
      }
    }

    this.setState({ error });
  }

  override render(): ReactNode {
    const { error } = this.state;
    const { children, fallback, silent } = this.props;

    if (error) {
      if (silent) return null;
      return fallback ?? (
        <div role="alert" data-feature-error={this.props.featureName}>
          This feature encountered an error.
        </div>
      );
    }

    return children;
  }
}
