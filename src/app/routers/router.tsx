/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { createBrowserRouter, Outlet } from 'react-router';
import { AdminLayout } from '@/widgets/admin-layout';
import { ProtectedRoute } from '@/app/routers/protected-route';
import { PermissionRoute } from '@/app/routers/permission-route';
import { DashboardPage } from '@/app/pages/dashboard-page';
import { NotFoundPage } from '@/app/pages/not-found-page';
import { RootErrorPage } from '@/app/pages/root-error-page';
import { FeaturePlaceholderPage } from '@/app/pages/feature-placeholder-page';

const LoginPage = lazy(() => import('@/app/pages/login-page'));
const ChangePasswordPage = lazy(() => import('@/app/pages/change-password-page'));
const CategoriesPage = lazy(() => import('@/app/pages/categories-page'));

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
        element: (
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/',
        element: (
          <ProtectedRoute enforcePasswordChange>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, handle: { title: 'Dashboard' }, element: <DashboardPage /> },
          {
            path: 'products',
            element: (
              <PermissionRoute permission="view_all_products">
                <Outlet />
              </PermissionRoute>
            ),
          },
          {
            path: 'categories',
            element: (
              <PermissionRoute permission="view_all_products">
                <CategoriesPage />
              </PermissionRoute>
            ),
          },
          {
            path: 'inventory',
            element: (
              <PermissionRoute permission="view_all_inventory">
                <FeaturePlaceholderPage title="Inventory" />
              </PermissionRoute>
            ),
          },
          {
            path: 'orders',
            element: (
              <PermissionRoute permission="view_all_orders">
                <FeaturePlaceholderPage title="Orders" />
              </PermissionRoute>
            ),
          },
          {
            path: 'users',
            element: (
              <PermissionRoute permission="view_all_users">
                <FeaturePlaceholderPage title="Users" />
              </PermissionRoute>
            ),
          },
          {
            path: 'settings/roles',
            element: (
              <PermissionRoute permission="manage_roles">
                <FeaturePlaceholderPage title="Roles & permissions" />
              </PermissionRoute>
            ),
          },
        ],
      },
    ],
    errorElement: <RootErrorPage />,
  },
  { path: '*', element: <NotFoundPage /> },
]);
