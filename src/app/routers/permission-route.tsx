import type { ReactNode } from 'react';
import { ForbiddenPage } from '@/app/pages/forbidden-page';
import { useAuth } from '@/app/providers/auth-context';

type PermissionRouteProps = {
  permission: string;
  children: ReactNode;
};

export function PermissionRoute({ permission, children }: PermissionRouteProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <ForbiddenPage />;
  }

  return children;
}
