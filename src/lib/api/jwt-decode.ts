export type AccessTokenClaims = {
  sub: string;
  email: string;
  roles: string[];
};

export function decodeAccessTokenClaims(token: string): AccessTokenClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3 || !parts[1]) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const decoded = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;

    if (
      typeof decoded.sub !== 'string' ||
      typeof decoded.email !== 'string' ||
      !Array.isArray(decoded.roles) ||
      !decoded.roles.every((item) => typeof item === 'string')
    ) {
      return null;
    }

    return {
      sub: decoded.sub,
      email: decoded.email,
      roles: decoded.roles,
    };
  } catch {
    return null;
  }
}
