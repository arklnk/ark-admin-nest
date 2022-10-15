import { nanoid } from 'nanoid';

export function buildUUID(): string {
  return nanoid();
}

export function buildShortUUID(): string {
  return nanoid(10);
}
