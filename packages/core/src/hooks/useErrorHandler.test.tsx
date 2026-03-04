import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GlobalErrorBoundary } from "../boundaries/GlobalErrorBoundary";
import { ErrorHandlerProvider } from "../context/ErrorHandlerContext";
import { useErrorHandler } from "./useErrorHandler";

function AsyncTrigger() {
  const throwError = useErrorHandler();
  return (
    <button onClick={() => throwError(new Error("async error"))}>
      Trigger
    </button>
  );
}

describe("useErrorHandler", () => {
  it("bridges async errors to the nearest boundary", async () => {
    render(
      <GlobalErrorBoundary fallback={(err) => <div>Caught: {err.message}</div>}>
        <ErrorHandlerProvider>
          <AsyncTrigger />
        </ErrorHandlerProvider>
      </GlobalErrorBoundary>
    );

    expect(screen.getByRole("button", { name: /Trigger/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("Caught: async error")).toBeInTheDocument();
  });
});
