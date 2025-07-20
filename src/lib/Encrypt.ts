// lib/encrypt.ts
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPT_KEY || "default_key";

// Encode to Base64 with URI-safe variant
function encodeURIBase64(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
// Decode from URI-safe Base64
function decodeURIBase64(str: string) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return str;
}

export function encrypt(text: string) {
  const ciphertext = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  const base64 = encodeURIBase64(ciphertext);
  return base64;
}

export function decrypt(encoded: string) {
  const base64 = decodeURIBase64(encoded);
  const bytes = CryptoJS.AES.decrypt(base64, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
