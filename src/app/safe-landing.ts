import { navigation } from '@/app/navigation';
import { hasPermission } from '@/app/permissions';

export function getDefaultLandingRoute(permissions: readonly string[]): string {
  if (hasPermission(permissions, 'view_all_orders')) {
    return '/';
  }

  for (const item of navigation) {
    if (item.to !== '/' && hasPermission(permissions, item.permission)) {
      return item.to;
    }
  }

  return '/login';
}
