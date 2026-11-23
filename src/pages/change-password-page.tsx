import { useAuth } from '@/app/providers/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChangePasswordForm } from '@/features/auth/components/change-password-form';

function ChangePasswordPage() {
  const { session } = useAuth();
  const displayName = session?.email ?? 'Account';

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Ecommerce Admin</p>
            <p className="mt-1 text-sm text-muted-foreground">Control Center</p>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              <h1>Change your password</h1>
            </CardTitle>
            <CardDescription>Choose a new password to continue to the admin dashboard.</CardDescription>
          </div>

          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{displayName}</span>
          </p>
        </CardHeader>

        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}

export default ChangePasswordPage;
