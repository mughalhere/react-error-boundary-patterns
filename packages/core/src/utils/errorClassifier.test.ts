import { describe, it, expect } from "vitest";
import { classifyError } from "./errorClassifier";

describe("classifyError", () => {
  it("classifies chunk load errors", () => {
    const r = classifyError(new Error("Loading chunk 42 failed."));
    expect(r.type).toBe("chunk-load");
    expect(r.recoverable).toBe(true);
    expect(r.retryable).toBe(true);
    expect(r.userMessage).toContain("refresh");
  });

  it("classifies network errors", () => {
    const r = classifyError(new Error("Network request failed."));
    expect(r.type).toBe("network");
    expect(r.recoverable).toBe(true);
    expect(r.retryable).toBe(true);
  });

  it("classifies permission errors", () => {
    const r = classifyError(new Error("Permission denied"));
    expect(r.type).toBe("permission");
    expect(r.recoverable).toBe(false);
    expect(r.retryable).toBe(false);
  });

  it("classifies unknown errors as unknown type with retryable true", () => {
    const r = classifyError(new Error("Something else"));
    expect(r.type).toBe("unknown");
    expect(r.recoverable).toBe(true);
    expect(r.retryable).toBe(true);
  });

  it("handles non-Error throws (string)", () => {
    const r = classifyError("string error");
    expect(r.type).toBe("unknown");
    expect(r.userMessage).toBeDefined();
  });

  it("handles non-Error throws (unknown)", () => {
    const r = classifyError({ code: 500 });
    expect(r.type).toBe("unknown");
  });
});
