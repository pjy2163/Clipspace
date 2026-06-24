import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const TOKEN_VERSION = "v1";

export type TeamSharePayload = {
  id: string;
  accessKey: string;
};

function getShareSecret() {
  const secret = process.env.TEAM_SHARE_SECRET || process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    throw new Error("TEAM_SHARE_SECRET or SUPABASE_SECRET_KEY is required.");
  }
  return createHash("sha256").update(secret).digest();
}

function encode(value: Buffer) {
  return value.toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url");
}

export function createTeamShareToken(payload: TeamSharePayload) {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, getShareSecret(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [TOKEN_VERSION, encode(iv), encode(tag), encode(encrypted)].join(".");
}

export function readTeamShareToken(token: string): TeamSharePayload {
  const [version, encodedIv, encodedTag, encodedEncrypted] = token.split(".");
  if (version !== TOKEN_VERSION || !encodedIv || !encodedTag || !encodedEncrypted) {
    throw new Error("Invalid team share token.");
  }

  const decipher = createDecipheriv(ALGORITHM, getShareSecret(), decode(encodedIv));
  decipher.setAuthTag(decode(encodedTag));
  const decrypted = Buffer.concat([
    decipher.update(decode(encodedEncrypted)),
    decipher.final(),
  ]);
  const payload = JSON.parse(decrypted.toString("utf8")) as Partial<TeamSharePayload>;

  if (!payload.id || !payload.accessKey) {
    throw new Error("Invalid team share token payload.");
  }

  return {
    id: payload.id,
    accessKey: payload.accessKey,
  };
}
