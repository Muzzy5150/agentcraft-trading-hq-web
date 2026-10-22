import { createHmac, timingSafeEqual } from "node:crypto";
export function sign(
  body: string,
  timestamp: string,
  nonce: string,
  secret: string,
) {
  return createHmac("sha256", secret)
    .update(`${timestamp}.${nonce}.${body}`)
    .digest("hex");
}
export function authenticate(
  body: string,
  headers: Headers,
  secret: string,
  now = Date.now(),
) {
  const timestamp = headers.get("x-publisher-timestamp") || "",
    nonce = headers.get("x-publisher-nonce") || "",
    signature = headers.get("x-publisher-signature") || "";
  if (
    secret.length < 32 ||
    !/^\d{13}$/.test(timestamp) ||
    Math.abs(now - Number(timestamp)) > 60000 ||
    !/^[-a-zA-Z0-9]{16,80}$/.test(nonce) ||
    !/^[a-f0-9]{64}$/.test(signature)
  )
    return null;
  const expected = sign(body, timestamp, nonce, secret);
  return timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex"),
  )
    ? { nonce, timestamp }
    : null;
}
