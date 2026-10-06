import {toApiError} from '../../apis/errors';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Maps a backend failure to the message a reader should see; never the raw text. */
export const authErrorKey = (e: unknown): string => {
  const err = toApiError(e);
  // No response: offline or the server is down — the app can't tell which,
  // and "couldn't reach Hassad" is true of both.
  if (err.kind === 'network') {
    return 'auth.errServer';
  }
  if (err.status === 401) {
    return 'auth.errCredentials';
  }
  if (err.status === 422 || /already exists/i.test(err.message)) {
    return 'auth.errExists';
  }
  if (/do not match/i.test(err.message)) {
    return 'auth.errMismatch';
  }
  if (/email is invalid/i.test(err.message)) {
    return 'auth.errEmail';
  }
  if (/at least 8/i.test(err.message)) {
    return 'auth.errPasswordShort';
  }
  return 'auth.errServer';
};
