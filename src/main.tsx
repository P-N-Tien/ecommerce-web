import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { router } from '@/app/routers/router';
import { RouterProvider } from 'react-router';
import { AuthProvider } from '@/app/providers/auth-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { hasHttpStatus } from '@/lib/api/parse-api-error';
import { ThemeAwareToaster } from '@/components/feedback/toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Domain queries: only skip retry on 429 (rate limit); other 4xx may still retry once.
      retry: (failureCount, error) => {
        if (hasHttpStatus(error, 429)) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <ThemeAwareToaster />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
