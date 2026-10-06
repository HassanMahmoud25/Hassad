const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Minimal, dependency-free base64 decoder (Hermes doesn't reliably ship atob/btoa). */
const base64Decode = (input: string): string => {
  const clean = input.replace(/[^A-Za-z0-9+/]/g, '');
  let output = '';
  let buffer = 0;
  let bits = 0;

  for (const char of clean) {
    const value = BASE64_CHARS.indexOf(char);
    if (value === -1) {continue;}
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
};

/**
 * Decodes a JWT's payload without verifying its signature — verification
 * happens server-side; this is only used to read claims (user_id, email)
 * the backend already gave us over HTTPS, since /api/auth/login returns
 * no user object of its own.
 */
export const decodeJwtPayload = <T = Record<string, unknown>>(
  token: string,
): T | null => {
  try {
    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) {return null;}
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = base64Decode(base64);
    const jsonString = decodeURIComponent(
      decoded
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonString);
  } catch (err) {
    console.log('decodeJwtPayload ERROR ==> ', err);
    return null;
  }
};
