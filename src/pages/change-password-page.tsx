import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChangePasswordForm } from '@/features/auth/components/change-password-form';

function ChangePasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Ecommerce Admin</p>
            <p className="mt-1 text-sm text-muted-foreground">Control Center</p>
          </div>
          <div className="space-y-1.5">
            <CardTitle as="h1">Change your password</CardTitle>
            <CardDescription>Choose a new password to continue to the admin dashboard.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}

export default ChangePasswordPage;
