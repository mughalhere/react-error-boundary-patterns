import { createContext, forwardRef, useRef, useImperativeHandle, Component, useState, useCallback, useContext } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';

// src/boundaries/GlobalErrorBoundary.tsx
var ErrorRecoveryContext = createContext(
  null
);
function useErrorRecoveryContext() {
  const value = useContext(ErrorRecoveryContext);
  if (value === null) {
    throw new Error(
      "useErrorRecovery must be used within an error boundary fallback (e.g. inside GlobalErrorBoundary or RouteErrorBoundary fallback)."
    );
  }
  return value;
}
function ErrorRecoveryProvider(props) {
  return /* @__PURE__ */ jsx(ErrorRecoveryContext.Provider, { value: props.value, children: props.children });
}
var MAX_RETRIES = 3;
var GlobalErrorBoundaryClass = class extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      error: null,
      errorInfo: null,
      retryCount: 0
    };
    this.reset = () => {
      this.setState({ error: null, errorInfo: null });
    };
  }
  componentDidMount() {
    this.props.registerReset?.(this.reset);
  }
  componentDidCatch(error, errorInfo) {
    const { reporter, onError } = this.props;
    const context = {
      componentStack: errorInfo.componentStack ?? void 0,
      boundaryName: "GlobalErrorBoundary",
      extra: { retryCount: this.state.retryCount }
    };
    if (reporter) {
      try {
        reporter.report(error, context);
      } catch (e) {
      }
    }
    onError?.(error, errorInfo);
    this.setState((prev) => ({
      error,
      errorInfo,
      retryCount: Math.min(prev.retryCount + 1, MAX_RETRIES)
    }));
  }
  render() {
    const { error, retryCount } = this.state;
    const { children, fallback, showDialog } = this.props;
    if (error && retryCount <= MAX_RETRIES) {
      const reset = this.reset;
      const fallbackContent = typeof fallback === "function" ? fallback(error, reset) : fallback ?? /* @__PURE__ */ jsx("div", { role: "alert", children: "Something went wrong. Refresh the page or try again." });
      const content = showDialog ? /* @__PURE__ */ jsx("div", { "data-error-boundary-dialog": true, children: fallbackContent }) : fallbackContent;
      return /* @__PURE__ */ jsx(
        ErrorRecoveryProvider,
        {
          value: { reset, retryCount },
          children: content
        }
      );
    }
    if (error && retryCount > MAX_RETRIES) {
      return /* @__PURE__ */ jsx("div", { role: "alert", children: "Too many errors. Please refresh the page." });
    }
    return children;
  }
};
var GlobalErrorBoundary = forwardRef(function GlobalErrorBoundary2(props, ref) {
  const resetRef = useRef();
  useImperativeHandle(
    ref,
    () => ({
      reset: () => resetRef.current?.()
    }),
    []
  );
  return /* @__PURE__ */ jsx(
    GlobalErrorBoundaryClass,
    {
      ...props,
      registerReset: (reset) => {
        resetRef.current = reset;
      }
    }
  );
});
var MAX_RETRIES2 = 3;
var RouteErrorBoundary = class extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      error: null,
      errorInfo: null,
      retryCount: 0
    };
    this.reset = () => {
      this.setState({ error: null, errorInfo: null });
    };
  }
  componentDidCatch(error, errorInfo) {
    const { reporter, routeName } = this.props;
    const context = {
      componentStack: errorInfo.componentStack ?? void 0,
      boundaryName: "RouteErrorBoundary",
      routeName,
      extra: { retryCount: this.state.retryCount }
    };
    if (reporter) {
      try {
        reporter.report(error, context);
      } catch {
      }
    }
    this.setState((prev) => ({
      error,
      errorInfo,
      retryCount: Math.min(prev.retryCount + 1, MAX_RETRIES2)
    }));
  }
  render() {
    const { error, retryCount } = this.state;
    const { children, fallback, routeName } = this.props;
    if (error && retryCount <= MAX_RETRIES2) {
      const reset = this.reset;
      const fallbackContent = typeof fallback === "function" ? fallback(error, reset) : fallback ?? /* @__PURE__ */ jsxs("div", { role: "alert", children: [
        "Something went wrong on this page (",
        routeName,
        "). Try again."
      ] });
      return /* @__PURE__ */ jsx(ErrorRecoveryProvider, { value: { reset, retryCount }, children: fallbackContent });
    }
    if (error && retryCount > MAX_RETRIES2) {
      return /* @__PURE__ */ jsx("div", { role: "alert", children: "Too many errors on this route. Please refresh." });
    }
    return children;
  }
};
var FeatureErrorBoundary = class extends Component {
  constructor() {
    super(...arguments);
    this.state = { error: null };
  }
  componentDidCatch(error, errorInfo) {
    const { reporter, featureName } = this.props;
    const context = {
      componentStack: errorInfo.componentStack ?? void 0,
      boundaryName: "FeatureErrorBoundary",
      featureName
    };
    if (reporter) {
      try {
        reporter.report(error, context);
      } catch {
      }
    }
    this.setState({ error });
  }
  render() {
    const { error } = this.state;
    const { children, fallback, silent } = this.props;
    if (error) {
      if (silent) return null;
      return fallback ?? /* @__PURE__ */ jsx("div", { role: "alert", "data-feature-error": this.props.featureName, children: "This feature encountered an error." });
    }
    return children;
  }
};
function AsyncErrorBoundary({
  children,
  name,
  fallback,
  reporter
}) {
  return /* @__PURE__ */ jsx(
    FeatureErrorBoundary,
    {
      featureName: name,
      fallback,
      reporter,
      children
    }
  );
}
var ErrorHandlerContext = createContext(null);
function useErrorHandlerContext() {
  const setError = useContext(ErrorHandlerContext);
  if (setError === null) {
    throw new Error(
      "useErrorHandler must be used within an ErrorHandlerProvider. Wrap your app (inside an error boundary) with ErrorHandlerProvider."
    );
  }
  return setError;
}
function ErrorHandlerProvider(props) {
  const [error, setErrorState] = useState(null);
  const setError = useCallback((e) => {
    setErrorState(e);
  }, []);
  return /* @__PURE__ */ jsxs(ErrorHandlerContext.Provider, { value: setError, children: [
    /* @__PURE__ */ jsx(ThrowIfError, { error }),
    props.children
  ] });
}
function ThrowIfError({ error }) {
  if (error) throw error;
  return null;
}

// src/hooks/useErrorHandler.ts
function useErrorHandler() {
  const setError = useErrorHandlerContext();
  return useCallback(
    (error) => {
      setError(error);
    },
    [setError]
  );
}
function useErrorRecovery(options = {}) {
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

// src/utils/errorSerializer.ts
function serializeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? void 0
    };
  }
  if (typeof error === "string") {
    return { name: "Error", message: error, stack: void 0 };
  }
  try {
    return { name: "Unknown", message: String(error), stack: void 0 };
  } catch {
    return { name: "Unknown", message: "[Unserializable error]", stack: void 0 };
  }
}

// src/reporters/ConsoleReporter.ts
var ConsoleReporter = class {
  /** Optional prefix for log messages */
  constructor(prefix = "[ErrorBoundary]") {
    this.prefix = prefix;
  }
  report(error, context) {
    const payload = {
      error: serializeError(error),
      context: {
        boundaryName: context.boundaryName,
        routeName: context.routeName,
        featureName: context.featureName,
        componentStack: context.componentStack,
        ...context.extra
      }
    };
    if (typeof console !== "undefined" && console.error) {
      console.error(this.prefix, payload);
    }
  }
};

// src/reporters/SentryReporter.ts
var SentryReporter = class {
  constructor(options = {}) {
    this.options = options;
  }
  report(error, context) {
    const capture = this.getCapture();
    if (!capture) return;
    const extra = {
      boundaryName: context.boundaryName,
      routeName: context.routeName,
      featureName: context.featureName,
      ...context.extra
    };
    if (context.componentStack) {
      extra.componentStack = context.componentStack;
    }
    if (context.userId) {
      extra.userId = context.userId;
    }
    try {
      capture(error, { extra });
    } catch {
    }
  }
  getCapture() {
    if (this.options.getCaptureException) {
      return this.options.getCaptureException();
    }
    return void 0;
  }
};

// src/utils/errorClassifier.ts
var CHUNK_LOAD_PATTERNS = [
  /loading chunk \d+ failed/i,
  /loading CSS chunk \d+ failed/i,
  /chunkloaderror/i,
  /failed to fetch dynamically imported module/i
];
var NETWORK_PATTERNS = [
  /network error/i,
  /failed to fetch/i,
  /network request failed/i,
  /load failed/i,
  /err_connection_refused/i,
  /err_connection_reset/i
];
var PERMISSION_PATTERNS = [
  /permission denied/i,
  /access denied/i,
  /forbidden/i,
  /401/i,
  /403/i
];
function classifyError(error) {
  const err = normalizeToError(error);
  const message = err.message.toLowerCase();
  if (matchesPatterns(message, CHUNK_LOAD_PATTERNS)) {
    return {
      type: "chunk-load",
      recoverable: true,
      userMessage: "A code update failed to load. Please refresh the page.",
      retryable: true
    };
  }
  if (matchesPatterns(message, NETWORK_PATTERNS)) {
    return {
      type: "network",
      recoverable: true,
      userMessage: "A network error occurred. Check your connection and try again.",
      retryable: true
    };
  }
  if (matchesPatterns(message, PERMISSION_PATTERNS)) {
    return {
      type: "permission",
      recoverable: false,
      userMessage: "You don't have permission to perform this action.",
      retryable: false
    };
  }
  return {
    type: "unknown",
    recoverable: true,
    userMessage: "Something went wrong. You can try again.",
    retryable: true
  };
}
function matchesPatterns(message, patterns) {
  return patterns.some((p) => p.test(message));
}
function normalizeToError(error) {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  try {
    return new Error(String(error));
  } catch {
    return new Error("An unknown error occurred");
  }
}

export { AsyncErrorBoundary, ConsoleReporter, ErrorHandlerProvider, FeatureErrorBoundary, GlobalErrorBoundary, RouteErrorBoundary, SentryReporter, classifyError, serializeError, useErrorHandler, useErrorRecovery };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map