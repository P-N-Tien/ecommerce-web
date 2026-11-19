import { Menu, PanelsTopLeft } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { USE_MOCK_API } from '@/services/http/runtime';

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
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
        <Button asChild type="button" variant="ghost" size="sm">
          <Link to="/change-password">Change password</Link>
        </Button>
      </div>
    </header>
  );
}
