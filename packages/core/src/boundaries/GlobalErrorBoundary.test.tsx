import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GlobalErrorBoundary, ErrorHandlerProvider } from "../index";

function Thrower({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("render error");
  return <span>ok</span>;
}


describe("GlobalErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <GlobalErrorBoundary>
        <span>child</span>
      </GlobalErrorBoundary>
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("catches render errors and renders fallback", () => {
    const fallback = <div>Something went wrong</div>;
    render(
      <GlobalErrorBoundary fallback={fallback}>
        <Thrower shouldThrow={true} />
      </GlobalErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("calls reporter when error is caught", () => {
    const reporter = { report: vi.fn() };
    render(
      <GlobalErrorBoundary reporter={reporter} fallback={<div>Fallback</div>}>
        <Thrower shouldThrow={true} />
      </GlobalErrorBoundary>
    );
    expect(reporter.report).toHaveBeenCalledTimes(1);
    expect(reporter.report).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ boundaryName: "GlobalErrorBoundary" })
    );
  });

  it("calls onError when error is caught", () => {
    const onError = vi.fn();
    render(
      <GlobalErrorBoundary onError={onError} fallback={<div>Fallback</div>}>
        <Thrower shouldThrow={true} />
      </GlobalErrorBoundary>
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object));
  });

  it("function fallback receives error and reset and renders", async () => {
    const fn = vi.fn((error: Error, reset: () => void) => (
      <button onClick={reset}>Retry: {error.message}</button>
    ));
    render(
      <GlobalErrorBoundary fallback={fn}>
        <Thrower shouldThrow={true} />
      </GlobalErrorBoundary>
    );
    await screen.findByText(/Retry: render error/);
    expect(fn).toHaveBeenCalledWith(expect.any(Error), expect.any(Function));
    const reset = fn.mock.calls[0][1];
    expect(() => reset()).not.toThrow();
  });
});
