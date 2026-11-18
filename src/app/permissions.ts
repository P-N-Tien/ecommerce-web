type PermissionedNavigationItem = {
  permission?: string;
};

export function hasPermission(permissions: readonly string[], permission?: string): boolean {
  if (!permission) {
    return true;
  }

  return permissions.includes(permission);
}

export function filterNavigation<T extends PermissionedNavigationItem>(items: T[], permissions: readonly string[]): T[] {
  return items.filter((item) => hasPermission(permissions, item.permission));
}
