import { NavLink } from 'react-router';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { navigation } from '@/app/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/providers/auth-context';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { session } = useAuth();
  const visibleNavigation = navigation.filter(
    (item) => !item.permission || session?.permissions.includes(item.permission),
  );
  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 top-16 z-30 bg-black/40 md:hidden"
          onClick={onClose}
        />
      ) : null}
      <aside
        aria-label="Main navigation"
        className={cn(
          'fixed inset-y-16 left-0 z-40 w-64 border-r bg-card p-3 transition-transform md:sticky md:top-16 md:z-0 md:block md:h-[calc(100vh-4rem)] md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-3 flex items-center justify-between px-3 py-2 md:hidden">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Menu</span>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close navigation menu">
            <X aria-hidden="true" />
          </Button>
        </div>
        <nav className="space-y-1" aria-label="Admin sections">
          {visibleNavigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
