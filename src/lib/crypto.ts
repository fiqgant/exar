import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// AES-256-GCM. Key comes from APP_ENCRYPTION_KEY: 32 raw bytes, base64-encoded.
function getKey() {
  const key = process.env.APP_ENCRYPTION_KEY;
  if (!key) throw new Error("APP_ENCRYPTION_KEY is not set");
  const buf = Buffer.from(key, "base64");
  if (buf.length !== 32) {
    throw new Error("APP_ENCRYPTION_KEY must decode to exactly 32 bytes");
  }
  return buf;
}

/** Encrypts plaintext, returning "iv:authTag:ciphertext" (all base64). */
export function encrypt(plaintext: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, ciphertext].map((b) => b.toString("base64")).join(":");
}

export function decrypt(payload: string) {
  const [ivB64, authTagB64, ciphertextB64] = payload.split(":");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(ivB64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextB64, "base64")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}
