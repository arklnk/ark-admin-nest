import { MD5, enc } from 'crypto-js';

export function encryptByMD5(text: string) {
  return MD5(text).toString();
}

export function encodeByBase64(text: string) {
  return enc.Utf8.parse(text).toString(enc.Base64);
}

export function decodeByBase64(decode: string) {
  return enc.Base64.parse(decode).toString();
}
