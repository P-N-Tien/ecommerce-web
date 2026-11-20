import type { AuthSession } from '@/features/auth/types';

export const DEMO_EMAIL = 'admin@example.com';
export const DEMO_PASSWORD = 'Admin123!';

const SESSION_KEY = 'ecommerce-admin.demo-session';
const PASSWORD_KEY = 'ecommerce-admin.demo-password';

const demoSession: AuthSession = {
  userId: 'demo-admin',
  email: DEMO_EMAIL,
  role: 'Administrator',
  permissions: ['view_all_orders', 'manage_orders', 'view_all_products', 'manage_products', 'view_all_inventory', 'manage_inventory', 'view_all_users', 'manage_users', 'manage_roles'],
  mustChangePassword: false,
};

function delay(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 180));
}

export async function mockLogin(email: string, password: string): Promise<AuthSession> {
  await delay();
  const storedPassword = window.localStorage.getItem(PASSWORD_KEY) ?? DEMO_PASSWORD;
  if (email.toLowerCase() !== DEMO_EMAIL || password !== storedPassword) {
    throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });
  }
  const session = readMockSession() ?? demoSession;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function mockRefreshSession(): Promise<AuthSession | null> {
  await delay();
  return readMockSession();
}

export async function mockChangePassword(currentPassword: string, newPassword: string): Promise<void> {
  await delay();
  const storedPassword = window.localStorage.getItem(PASSWORD_KEY) ?? DEMO_PASSWORD;
  if (currentPassword !== storedPassword) {
    throw Object.assign(new Error('Current password is incorrect.'), { statusCode: 400 });
  }
  window.localStorage.setItem(PASSWORD_KEY, newPassword);
  const session = readMockSession();
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, mustChangePassword: false }));
  }
}

function readMockSession(): AuthSession | null {
  const stored = window.localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}
