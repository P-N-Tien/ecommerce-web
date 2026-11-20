export async function mockDelay(): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, 160));
}

export function readMockList<T>(key: string, seed: T[]): T[] {
  const stored = window.localStorage.getItem(key);
  if (!stored) {
    window.localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    const value: unknown = JSON.parse(stored);
    return Array.isArray(value) ? (value as T[]) : seed;
  } catch {
    window.localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
}

export function writeMockList<T>(key: string, records: T[]): void {
  window.localStorage.setItem(key, JSON.stringify(records));
}

export function makeMockId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function mockNotFound(resource: string): Error & { statusCode: number } {
  return Object.assign(new Error(`${resource} was not found.`), { statusCode: 404 });
}
