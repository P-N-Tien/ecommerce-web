import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/providers/auth-context';
import { getDefaultLandingRoute } from '@/app/safe-landing';

export function ForbiddenPage() {
  const { session } = useAuth();
  const safeLandingRoute = session?.permissions ? getDefaultLandingRoute(session.permissions) : '/';
  const ctaLabel = safeLandingRoute === '/' ? 'Back to dashboard' : 'Back to home';

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">403</p>
      <h1 className="text-2xl font-semibold">You don’t have access to this section</h1>
      <p className="text-sm text-muted-foreground">Your account does not have the permission required for this page.</p>
      <Button asChild variant="outline"><Link to={safeLandingRoute}>{ctaLabel}</Link></Button>
    </main>
  );
}
