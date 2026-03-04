import { describe, it, expect, vi, beforeEach } from "vitest";
import { SentryReporter } from "./SentryReporter";

describe("SentryReporter", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("no-ops when Sentry is not available", () => {
    const reporter = new SentryReporter({ dsn: "https://x@y.ingest.sentry.io/z" });
    expect(() => {
      reporter.report(new Error("test"), { boundaryName: "Global" });
    }).not.toThrow();
  });

  it("calls getCaptureException when provided", () => {
    const capture = vi.fn();
    const getCapture = vi.fn(() => capture);
    const reporter = new SentryReporter({ getCaptureException: getCapture });
    reporter.report(new Error("test"), { boundaryName: "Global", routeName: "Home" });

    expect(getCapture).toHaveBeenCalled();
    expect(capture).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ extra: expect.objectContaining({ boundaryName: "Global", routeName: "Home" }) })
    );
  });

  it("does not throw when capture throws", () => {
    const capture = vi.fn(() => {
      throw new Error("Sentry failed");
    });
    const reporter = new SentryReporter({ getCaptureException: () => capture });
    expect(() => {
      reporter.report(new Error("test"), {});
    }).not.toThrow();
  });
});
