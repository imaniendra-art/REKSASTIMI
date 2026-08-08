import crypto from "crypto";

export function generateVerifiedToken(): string {
  // Generate a random 16-byte hex string (32 characters)
  return crypto.randomBytes(16).toString("hex");
}

export function buildVerifiedUrl(token: string): string {
  // The base URL can be defined through environment variables if needed
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return `${baseUrl}/verify/dokumen/${token}`;
}
