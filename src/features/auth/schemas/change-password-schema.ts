import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Use at least 8 characters for your new password'),
    confirmNewPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: 'Your new password must be different from your current password',
    path: ['newPassword'],
  })
  .refine((values) => values.newPassword === values.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
