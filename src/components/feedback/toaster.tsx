import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';

export function ThemeAwareToaster(props: ToasterProps) {
  return <SonnerToaster richColors closeButton position="top-right" {...props} />;
}
