import { Routes, Route, Link } from "react-router-dom";
import {
  GlobalErrorBoundary,
  RouteErrorBoundary,
  ErrorHandlerProvider,
} from "@mozia/react-error-boundaries";
import { HomePage } from "./HomePage";
import { BrokenPage } from "./BrokenPage";

function AppLayout() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/broken">Broken Route</Link>
      </nav>
      <Routes>
        <Route
          path="/"
          element={
            <RouteErrorBoundary
              routeName="Home"
              fallback={(error, reset) => (
                <div style={{ padding: "1rem", border: "1px solid #c00" }}>
                  <p>Route &quot;Home&quot; failed: {error.message}</p>
                  <button type="button" onClick={reset}>Retry</button>
                </div>
              )}
            >
              <HomePage />
            </RouteErrorBoundary>
          }
        />
        <Route
          path="/broken"
          element={
            <RouteErrorBoundary
              routeName="Broken"
              isolate
              fallback={(error, reset) => (
                <div style={{ padding: "1rem", border: "1px solid #c00" }}>
                  <p>Route &quot;Broken&quot; failed: {error.message}</p>
                  <button type="button" onClick={reset}>Retry</button>
                </div>
              )}
            >
              <BrokenPage />
            </RouteErrorBoundary>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <GlobalErrorBoundary
      fallback={(error, reset) => (
        <div style={{ padding: "2rem", border: "2px solid #c00" }}>
          <h2>Global error</h2>
          <p>{error.message}</p>
          <button type="button" onClick={reset}>Retry</button>
        </div>
      )}
    >
      <ErrorHandlerProvider>
        <AppLayout />
      </ErrorHandlerProvider>
    </GlobalErrorBoundary>
  );
}

export { App };
