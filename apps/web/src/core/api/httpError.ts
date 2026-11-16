/**
 * An HTTP error that keeps the status code, so upper layers can react to
 * *why* a request failed (401 → go to login, 429 → wait) instead of
 * parsing error messages.
 */
export class HttpError extends Error {
  readonly status: number;
  /** Seconds to wait, from the Retry-After header (sent with 429). */
  readonly retryAfter?: number;
  /** Extra detail from the body, e.g. per-line import errors. */
  readonly errors?: unknown;

  constructor(status: number, message: string, retryAfter?: number, errors?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.retryAfter = retryAfter;
    this.errors = errors;
  }
}

export async function toHttpError(response: Response): Promise<HttpError> {
  // The API sends { message } in its JSON errors; fall back to the status text
  const body = (await response.json().catch(() => null)) as {
    message?: unknown;
    errors?: unknown;
  } | null;
  const message =
    typeof body?.message === "string" ? body.message : response.statusText;
  const retryAfter = Number(response.headers.get("Retry-After")) || undefined;
  return new HttpError(response.status, message, retryAfter, body?.errors);
}
