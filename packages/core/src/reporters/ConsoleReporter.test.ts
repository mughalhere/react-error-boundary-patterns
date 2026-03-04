import { describe, it, expect, vi, afterEach } from "vitest";
import { ConsoleReporter } from "./ConsoleReporter";

describe("ConsoleReporter", () => {
  const originalError = console.error;

  afterEach(() => {
    console.error = originalError;
  });

  it("calls console.error with serialized error and context", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const reporter = new ConsoleReporter("[Test]");
    reporter.report(new Error("test"), { boundaryName: "Global" });

    expect(spy).toHaveBeenCalledTimes(1);
    const [prefix, payload] = spy.mock.calls[0];
    expect(prefix).toBe("[Test]");
    expect(payload).toMatchObject({
      error: { name: "Error", message: "test" },
      context: { boundaryName: "Global" },
    });
    spy.mockRestore();
  });
});
