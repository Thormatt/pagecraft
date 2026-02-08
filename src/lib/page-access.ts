import { PAGE_ACCESS_COOKIE_MAX_AGE } from "./constants";

const encoder = new TextEncoder();

function getSecret(): ArrayBuffer {
  const secret = process.env.PAGE_ACCESS_SECRET;
  if (!secret) {
    throw new Error("PAGE_ACCESS_SECRET environment variable is required");
  }
  return encoder.encode(secret).buffer as ArrayBuffer;
}

function hexEncode(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Hash a page password using SHA-256 with page ID as salt.
 * Returns "sha256:<hex>" format.
 */
export async function hashPagePassword(
  pageId: string,
  plaintext: string
): Promise<string> {
  const data = encoder.encode(`${pageId}:${plaintext}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return `sha256:${hexEncode(hash)}`;
}

/**
 * Verify a plaintext password against a stored hash.
 * Uses constant-time comparison to prevent timing attacks.
 */
export async function verifyPagePassword(
  pageId: string,
  plaintext: string,
  storedHash: string
): Promise<boolean> {
  const computed = await hashPagePassword(pageId, plaintext);
  if (computed.length !== storedHash.length) return false;

  let mismatch = 0;
  for (let i = 0; i < computed.length; i++) {
    mismatch |= computed.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Create an HMAC-signed access cookie value for a page.
 * Format: "<expiry>.<hmac_hex>"
 */
export async function createAccessCookie(pageId: string): Promise<string> {
  const expiry = Math.floor(Date.now() / 1000) + PAGE_ACCESS_COOKIE_MAX_AGE;
  const payload = `${pageId}:${expiry}`;

  const key = await crypto.subtle.importKey(
    "raw",
    getSecret(),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${expiry}.${hexEncode(sig)}`;
}

/**
 * Verify an access cookie value. Returns true if valid and not expired.
 */
export async function verifyAccessCookie(
  pageId: string,
  cookieValue: string
): Promise<boolean> {
  const dotIndex = cookieValue.indexOf(".");
  if (dotIndex === -1) return false;

  const expiry = parseInt(cookieValue.slice(0, dotIndex), 10);
  if (isNaN(expiry) || expiry < Math.floor(Date.now() / 1000)) return false;

  const payload = `${pageId}:${expiry}`;
  const key = await crypto.subtle.importKey(
    "raw",
    getSecret(),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const expectedSig = hexEncode(
    await crypto.subtle.sign("HMAC", key, encoder.encode(payload))
  );

  const actualSig = cookieValue.slice(dotIndex + 1);
  if (expectedSig.length !== actualSig.length) return false;

  let mismatch = 0;
  for (let i = 0; i < expectedSig.length; i++) {
    mismatch |= expectedSig.charCodeAt(i) ^ actualSig.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Build a cookie name scoped to a specific page.
 */
export function cookieName(pageId: string): string {
  return `page_access_${pageId}`;
}

/**
 * Serialize a Set-Cookie header value.
 */
export function serializeCookie(
  name: string,
  value: string,
  maxAge: number
): string {
  return `${name}=${value}; Path=/p/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax; Secure`;
}
