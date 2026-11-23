import { useState } from 'react';
import { Check, ChevronDown, KeyRound, LogOut, Menu, Moon, PanelsTopLeft, Sun, UserRound } from 'lucide-react';
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
import { useTheme } from '@/app/providers/theme-context';
import { USE_MOCK_API } from '@/lib/api/runtime';
import { DropdownMenuGroup } from '@radix-ui/react-dropdown-menu';

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const { session, logout } = useAuth();
  const { theme, setTheme } = useTheme();
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
            <button
              type="button"
              className="group flex cursor-pointer items-center gap-2.5 rounded-full border border-border/80 bg-background/80 py-1 pl-1 pr-3 shadow-xs transition-all hover:border-border hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-xs">
                {initials || <UserRound className="size-4" aria-hidden="true" />}
              </span>
              <span className="hidden max-w-44 truncate text-xs font-medium text-left sm:block">{displayName}</span>
              <ChevronDown
                className="size-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                aria-hidden="true"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-60">
            <DropdownMenuLabel className="font-normal">
              <div className="flex justify-between">
                <span className="flex size-7 mr-3 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-xs">
                  {initials || <UserRound className="size-4" aria-hidden="true" />}
                </span>
                <div className="flex-1">
                  <span className="block truncate font-medium text-foreground">{displayName}</span>
                  {session?.roles.length ? (
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {session.roles.join(', ')}
                    </span>
                  ) : null}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/change-password">
                <KeyRound className="size-3" aria-hidden="true" />
                Change password
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
            <DropdownMenuGroup className="flex gap-1">
              <DropdownMenuItem className="flex-1 justify-center px-2" onSelect={() => setTheme('light')}>
                <Sun className="size-3" aria-hidden="true" />
                Light
                {theme === 'light' ? <Check className="size-3" aria-label="Selected" /> : null}
              </DropdownMenuItem>
              <DropdownMenuItem className="flex-1 justify-center px-2" onSelect={() => setTheme('dark')}>
                <Moon className="size-3" aria-hidden="true" />
                Dark
                {theme === 'dark' ? <Check className="size-3" aria-label="Selected" /> : null}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" disabled={isLoggingOut} onSelect={() => void handleLogout()}>
              <LogOut className="size-3" aria-hidden="true" />
              {isLoggingOut ? 'Logging out…' : 'Logout'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
