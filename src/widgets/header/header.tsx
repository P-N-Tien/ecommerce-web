import { useState } from 'react';
import { CircleUserRound, KeyRound, LogOut, Menu, PanelsTopLeft, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/app/providers/auth-context';
import { USE_MOCK_API } from '@/lib/api/runtime';

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const displayName = session?.email ?? 'Account';
  const initials = displayName.slice(0, 1).toUpperCase();

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('You have been logged out.');
    } catch {
      toast.error('Your local session ended, but the server could not confirm logout.');
    } finally {
      navigate('/login', { replace: true });
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
        >
          <Menu aria-hidden="true" />
        </Button>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <PanelsTopLeft className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="font-semibold">Ecommerce Admin</p>
          <p className="text-xs text-muted-foreground">Control Center</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {USE_MOCK_API ? (
          <span className="hidden rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200 sm:inline-flex">
            Demo data
          </span>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="h-10 gap-2 px-2 sm:px-3"
              aria-label="Open user profile menu"
              disabled={isLoggingOut}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initials || <UserRound className="size-4" aria-hidden="true" />}
              </span>
              <span className="hidden max-w-44 truncate text-left sm:block">{displayName}</span>
              <CircleUserRound className="size-4 sm:hidden" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-60">
            <DropdownMenuLabel className="font-normal">
              <span className="block text-xs text-muted-foreground">Signed in as</span>
              <span className="block truncate font-medium text-foreground">{displayName}</span>
              {session?.roles.length ? (
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">{session.roles.join(', ')}</span>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/change-password">
                <KeyRound aria-hidden="true" />
                Change password
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" disabled={isLoggingOut} onSelect={() => void handleLogout()}>
              <LogOut aria-hidden="true" />
              {isLoggingOut ? 'Logging out…' : 'Logout'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
