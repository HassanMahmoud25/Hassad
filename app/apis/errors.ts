import axios from 'axios';

export type ApiErrorKind = 'network' | 'unauthorized' | 'validation' | 'notFound' | 'server';

/** One error shape for the UI, whatever the backend sent. */
export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;
  /** express-validator messages keyed by field (`path`). */
  fields: Record<string, string>;
  /** The backend's stable reason, e.g. `UPLOAD_UNAVAILABLE`, `INVALID_IMAGE`. */
  code?: string;

  constructor(kind: ApiErrorKind, message: string, status?: number, fields: Record<string, string> = {}, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.fields = fields;
    this.code = code;
  }
}

interface ValidatorError {
  msg?: string;
  path?: string;
  param?: string;
}

/**
 * Normalises the backend's error forms (verified against hasad-BE `main`):
 * - 400 `{errors: [{msg, path}]}` from express-validator
 * - 404 `{message}`
 * - plain-text bodies from `res.send(msg).status(500)`, which arrive with
 *   HTTP 200 and are turned into errors by the client interceptor
 * - no response at all (offline, timeout)
 */
export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  if (axios.isAxiosError(error)) {
    const res = error.response;
    if (!res) {
      return new ApiError('network', error.message);
    }
    const data = res.data as unknown;
    if (res.status === 401) {
      return new ApiError('unauthorized', textOf(data) ?? 'Unauthorized', 401);
    }
    if (data && typeof data === 'object' && Array.isArray((data as {errors?: unknown}).errors)) {
      const list = (data as {errors: ValidatorError[]}).errors;
      const fields: Record<string, string> = {};
      list.forEach(e => {
        const key = e.path ?? e.param;
        if (key && e.msg && !fields[key]) {
          fields[key] = e.msg;
        }
      });
      const first = list[0]?.msg ?? 'Invalid request';
      // isBookExists reports a missing book as a validation error.
      const kind = /not found/i.test(first) ? 'notFound' : 'validation';
      return new ApiError(kind, first, res.status, fields);
    }
    if (res.status === 404) {
      return new ApiError('notFound', textOf(data) ?? 'Not found', 404);
    }
    return new ApiError('server', textOf(data) ?? error.message, res.status, {}, codeOf(data));
  }
  return new ApiError('server', error instanceof Error ? error.message : String(error));
};

const codeOf = (data: unknown): string | undefined =>
  data && typeof data === 'object' && typeof (data as {code?: unknown}).code === 'string' ? (data as {code: string}).code : undefined;

const textOf = (data: unknown): string | undefined => {
  if (typeof data === 'string' && data.trim()) {
    return data;
  }
  if (data && typeof data === 'object' && typeof (data as {message?: unknown}).message === 'string') {
    return (data as {message: string}).message;
  }
  return undefined;
};
