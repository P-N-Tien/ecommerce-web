import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AUTH_SESSION_QUERY_KEY, useAuth } from '@/app/providers/auth-provider';
import type { AuthSession } from '@/features/auth/types';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/features/auth/schemas/change-password-schema';
import { navigateAfterLoginPath } from '@/features/auth/utils/navigate-after-login';
import { hasHttpStatus } from '@/lib/api/parse-api-error';
import { useQueryClient } from '@tanstack/react-query';

type LocationState = { redirect?: string } | null;

export function ChangePasswordForm() {
  const { changePassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit({ currentPassword, newPassword }: ChangePasswordFormValues) {
    setFormError(null);
    try {
      await changePassword({ currentPassword, newPassword });
      const session = queryClient.getQueryData<AuthSession>(AUTH_SESSION_QUERY_KEY);
      if (session) {
        const redirect = (location.state as LocationState)?.redirect ?? null;
        navigate(navigateAfterLoginPath(session, redirect), { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (error) {
      if (hasHttpStatus(error, 400, 401)) {
        setFormError('Your current password is incorrect or the new password was rejected.');
      } else if (hasHttpStatus(error, 429)) {
        setFormError('Too many attempts. Please wait and try again.');
      } else {
        setFormError('Could not change your password. Please try again.');
      }
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        {(
          [
            ['currentPassword', 'Current password', 'current-password'],
            ['newPassword', 'New password', 'new-password'],
            ['confirmPassword', 'Confirm new password', 'new-password'],
          ] as const
        ).map(([name, label, autoComplete]) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input {...field} type="password" autoComplete={autoComplete} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        {formError ? (
          <p className="text-sm text-destructive" role="alert">
            {formError}
          </p>
        ) : null}
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Changing password…' : 'Change password'}
        </Button>
      </form>
    </Form>
  );
}
