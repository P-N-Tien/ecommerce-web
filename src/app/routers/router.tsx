import ChangePasswordPage from '@/features/auth/pages/change-password-page';
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';

const LoginPage = lazy(() => import('@/features/auth/pages/login-page'));

export const router = createBrowserRouter([
  {
    children: [
      {
        path: '/login',
        handle: { title: 'Sign in' },
        element: <LoginPage />,
      },
      {
        path: '/change-password',
        handle: { title: 'Change password' },
        element: <ChangePasswordPage />,
      },
    ],
  },
]);
