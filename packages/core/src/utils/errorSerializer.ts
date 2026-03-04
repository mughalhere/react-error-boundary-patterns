/**
 * Serializes an Error for logging or sending to a backend.
 * Preserves name, message, stack; safe for JSON.
 *
 * @param error - Error to serialize
 * @returns Plain object suitable for JSON.stringify
 * @public
 */
export function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? undefined,
    };
  }
  if (typeof error === "string") {
    return { name: "Error", message: error, stack: undefined };
  }
  try {
    return { name: "Unknown", message: String(error), stack: undefined };
  } catch {
    return { name: "Unknown", message: "[Unserializable error]", stack: undefined };
  }
}
