import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/features/auth/components/login-form';

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Ecommerce Admin</p>
            <p className="mt-1 text-sm text-muted-foreground">Control Center</p>
          </div>
          <div className="space-y-1.5">
            <CardTitle as="h1">Sign in</CardTitle>
            <CardDescription>Use your operator account to access the admin dashboard.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
            Demo login: <span className="font-medium text-foreground">admin@example.com</span> / <span className="font-medium text-foreground">Admin123!</span>
          </div>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
