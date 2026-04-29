import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

const getEncryptionKey = () => {
  const source = process.env.ENCRYPTION_KEY ?? process.env.JWT_SECRET;

  if (!source) {
    throw new Error("ENCRYPTION_KEY or JWT_SECRET is required for encrypted organization settings.");
  }

  return createHash("sha256").update(source).digest();
};

export const encryptSecret = (value: string | null | undefined) => {
  if (!value) return null;

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(".");
};

export const decryptSecret = (encryptedValue: string | null | undefined) => {
  if (!encryptedValue) return null;

  const [ivRaw, authTagRaw, encryptedRaw] = encryptedValue.split(".");

  if (!ivRaw || !authTagRaw || !encryptedRaw) {
    return encryptedValue;
  }

  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(ivRaw, "base64"));
  decipher.setAuthTag(Buffer.from(authTagRaw, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64")),
    decipher.final(),
  ]).toString("utf8");
};
