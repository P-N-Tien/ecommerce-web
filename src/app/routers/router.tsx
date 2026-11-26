/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import { AdminLayout } from '@/widgets/admin-layout';
import { ProtectedRoute } from '@/app/routers/protected-route';
import { PermissionRoute } from '@/app/routers/permission-route';
import { DashboardPage } from '@/pages/dashboard-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { RootErrorPage } from '@/pages/root-error-page';

const LoginPage = lazy(() => import('@/pages/login-page'));
const ChangePasswordPage = lazy(() => import('@/pages/change-password-page'));
const CategoriesPage = lazy(() => import('@/pages/catalog/categories-page'));
const ProductsPage = lazy(() => import('@/pages/catalog/products-page'));
const ProductEditorPage = lazy(() => import('@/pages/catalog/product-editor-page'));
const InventoryPage = lazy(() => import('@/pages/inventory-page'));
const OrdersPage = lazy(() => import('@/pages/orders-page'));
const UsersPage = lazy(() => import('@/pages/users-page'));
const RolesPage = lazy(() => import('@/pages/access/roles-page'));

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
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, handle: { title: 'Dashboard' }, element: <DashboardPage /> },
          {
            path: 'products',
            element: (
              <PermissionRoute permission="view_all_products">
                <ProductsPage />
              </PermissionRoute>
            ),
          },
          {
            path: 'products/new',
            handle: { title: 'New product' },
            element: (
              <PermissionRoute permission="manage_products">
                <ProductEditorPage />
              </PermissionRoute>
            ),
          },
          {
            path: 'products/:id/edit',
            handle: { title: 'Edit product' },
            element: (
              <PermissionRoute permission="manage_products">
                <ProductEditorPage />
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
                <InventoryPage />
              </PermissionRoute>
            ),
          },
          {
            path: 'orders',
            element: (
              <PermissionRoute permission="view_all_orders">
                <OrdersPage />
              </PermissionRoute>
            ),
          },
          {
            path: 'users',
            element: (
              <PermissionRoute permission="view_all_users">
                <UsersPage />
              </PermissionRoute>
            ),
          },
          {
            path: 'settings/roles',
            element: (
              <PermissionRoute permission="manage_roles">
                <RolesPage />
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
