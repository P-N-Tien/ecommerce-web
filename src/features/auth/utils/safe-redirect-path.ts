export function safeRedirectPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }

  if (
    value === '/login' ||
    value.startsWith('/login?') ||
    value.startsWith('/login/') ||
    value === '/change-password' ||
    value.startsWith('/change-password?') ||
    value.startsWith('/change-password/')
  ) {
    return '/';
  }

  return value;
}
