import * as react from 'react';
import { ReactNode, Component, ErrorInfo } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

/**
 * Context passed to reporters when an error is caught.
 * @public
 */
interface ErrorContext$1 {
    componentStack?: string;
    boundaryName?: string;
    routeName?: string;
    featureName?: string;
    userId?: string;
    extra?: Record<string, unknown>;
}
/**
 * Pluggable interface for reporting errors (Sentry, custom backend, etc.).
 * @public
 */
interface ErrorReporter {
    /**
     * Report an error with optional context.
     * May be sync or async; boundaries do not await.
     */
    report(error: Error, context: ErrorContext$1): void | Promise<void>;
}

/**
 * Context passed to error reporters for debugging and analytics.
 * @public
 */
interface ErrorContext {
    /** React component stack at time of error */
    componentStack?: string;
    /** Name of the boundary that caught the error (e.g. "GlobalErrorBoundary") */
    boundaryName?: string;
    /** Route path or name when error occurred (for RouteErrorBoundary) */
    routeName?: string;
    /** Optional user identifier for session context */
    userId?: string;
    /** Additional metadata */
    extra?: Record<string, unknown>;
}
/**
 * Fallback can be a static React node or a function that receives error and reset.
 * @public
 */
type ErrorFallback = ReactNode | ((error: Error, reset: () => void) => ReactNode);
/**
 * Props for GlobalErrorBoundary — wraps the entire application.
 * @public
 */
interface GlobalErrorBoundaryProps {
    children: ReactNode;
    /** Custom fallback UI or (error, reset) => ReactNode */
    fallback?: ErrorFallback;
    /** Pluggable reporting (e.g. Sentry, custom) */
    reporter?: ErrorReporter;
    /** Called when an error is caught (in addition to reporter) */
    onError?: (error: Error, info: React.ErrorInfo) => void;
    /** When true, show a user-facing dialog/message on error */
    showDialog?: boolean;
}
/**
 * Props for RouteErrorBoundary — wraps individual React Router v6 routes.
 * @public
 */
interface RouteErrorBoundaryProps {
    children: ReactNode;
    /** Used in error context/reporting for route identification */
    routeName: string;
    fallback?: ErrorFallback;
    reporter?: ErrorReporter;
    /** When true, error does not bubble to GlobalErrorBoundary */
    isolate?: boolean;
}
/**
 * Props for FeatureErrorBoundary — isolates individual features/widgets.
 * @public
 */
interface FeatureErrorBoundaryProps {
    children: ReactNode;
    /** Identifier for the feature (for reporting/context) */
    featureName: string;
    fallback?: ReactNode;
    /** When true, suppress UI fallback and only report */
    silent?: boolean;
    reporter?: ErrorReporter;
}
/**
 * Result of error classification for smarter fallback UX.
 * @public
 */
interface ClassifiedError {
    type: "render" | "network" | "chunk-load" | "permission" | "unknown";
    recoverable: boolean;
    userMessage: string;
    retryable: boolean;
}
/**
 * Ref handle for error boundaries that support imperative reset.
 * @public
 */
interface ErrorBoundaryRef {
    reset: () => void;
}

declare const GlobalErrorBoundary: react.ForwardRefExoticComponent<GlobalErrorBoundaryProps & react.RefAttributes<ErrorBoundaryRef>>;

interface RouteState {
    error: Error | null;
    errorInfo: ErrorInfo | null;
    retryCount: number;
}
/**
 * Designed to wrap individual React Router v6 routes. Provides route name
 * in context for reporting. When isolate is true, errors do not bubble up.
 *
 * @public
 */
declare class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteState> {
    state: RouteState;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    reset: () => void;
    render(): ReactNode;
}

interface FeatureState {
    error: Error | null;
}
/**
 * Lightweight boundary for isolating individual features/widgets.
 * When silent is true, only reports and renders nothing (or null).
 *
 * @public
 */
declare class FeatureErrorBoundary extends Component<FeatureErrorBoundaryProps, FeatureState> {
    state: FeatureState;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    render(): ReactNode;
}

/**
 * Thin wrapper around FeatureErrorBoundary for async/loading boundaries.
 * Use with useErrorHandler to catch async errors in a specific section.
 *
 * @public
 */
interface AsyncErrorBoundaryProps {
    children: ReactNode;
    /** Identifier for the async section (e.g. "DashboardData") */
    name: string;
    fallback?: ReactNode;
    reporter?: ErrorReporter;
}
declare function AsyncErrorBoundary({ children, name, fallback, reporter, }: AsyncErrorBoundaryProps): ReactNode;

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
declare function useErrorHandler(): (error: Error) => void;

interface UseErrorRecoveryOptions {
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
declare function useErrorRecovery(options?: UseErrorRecoveryOptions): {
    retry: () => void;
    retryCount: number;
    isRecovering: boolean;
};

/**
 * Holds error state so that useErrorHandler can trigger a re-render that throws.
 * Must be used inside an error boundary. Renders a ThrowIfError sibling that
 * throws when error is set, so the boundary catches it.
 *
 * @internal
 */
declare function ErrorHandlerProvider(props: {
    children: ReactNode;
}): react_jsx_runtime.JSX.Element;

/**
 * Reporter that logs errors to the console with context.
 * Useful for development and demos.
 *
 * @public
 */
declare class ConsoleReporter implements ErrorReporter {
    readonly prefix: string;
    /** Optional prefix for log messages */
    constructor(prefix?: string);
    report(error: Error, context: ErrorContext$1): void;
}

/** Optional Sentry SDK captureException (avoids hard peer dependency) */
type CaptureException = (error: Error, context?: Record<string, unknown>) => void;
interface SentryReporterOptions {
    /** Sentry DSN (optional — graceful no-op if Sentry not loaded) */
    dsn?: string;
    /** Environment (e.g. production, staging) */
    environment?: string;
    /** Lazy getter for Sentry — allows apps to pass @sentry/react's captureException */
    getCaptureException?: () => CaptureException | undefined;
}
/**
 * Reporter that sends errors to Sentry when available.
 * If Sentry is not loaded or getCaptureException returns undefined, report is a no-op.
 *
 * @public
 */
declare class SentryReporter implements ErrorReporter {
    private readonly options;
    constructor(options?: SentryReporterOptions);
    report(error: Error, context: ErrorContext$1): void;
    private getCapture;
}

/**
 * Classifies an error for smarter fallback UX (user message, retryable, etc.).
 * Handles non-Error throws by wrapping in Error and classifying as unknown.
 *
 * @param error - The thrown value (may be Error or other)
 * @returns Classification with type, recoverable, userMessage, retryable
 * @public
 */
declare function classifyError(error: unknown): ClassifiedError;

/**
 * Serializes an Error for logging or sending to a backend.
 * Preserves name, message, stack; safe for JSON.
 *
 * @param error - Error to serialize
 * @returns Plain object suitable for JSON.stringify
 * @public
 */
declare function serializeError(error: unknown): Record<string, unknown>;

export { AsyncErrorBoundary, type ClassifiedError, ConsoleReporter, type ErrorBoundaryRef, type ErrorContext, type ErrorFallback, ErrorHandlerProvider, type ErrorReporter, FeatureErrorBoundary, type FeatureErrorBoundaryProps, GlobalErrorBoundary, type GlobalErrorBoundaryProps, RouteErrorBoundary, type RouteErrorBoundaryProps, SentryReporter, type SentryReporterOptions, type UseErrorRecoveryOptions, classifyError, serializeError, useErrorHandler, useErrorRecovery };
