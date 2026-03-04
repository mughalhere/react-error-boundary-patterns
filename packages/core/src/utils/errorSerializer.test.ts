import { describe, it, expect } from "vitest";
import { serializeError } from "./errorSerializer";

describe("serializeError", () => {
  it("serializes Error with name, message, stack", () => {
    const err = new Error("test");
    const out = serializeError(err);
    expect(out.name).toBe("Error");
    expect(out.message).toBe("test");
    expect(typeof out.stack).toBe("string");
  });

  it("serializes string as Error-like object", () => {
    const out = serializeError("oops");
    expect(out.name).toBe("Error");
    expect(out.message).toBe("oops");
  });

  it("serializes unknown value", () => {
    const out = serializeError({ foo: 1 });
    expect(out.message).toBeDefined();
  });
});
