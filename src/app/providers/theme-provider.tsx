import { useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext, type ThemeMode } from '@/app/providers/theme-context';

const THEME_STORAGE_KEY = 'ecommerce-admin.theme';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useLayoutEffect(() => {
    function syncThemeFromAnotherTab(event: StorageEvent) {
      if (event.key !== THEME_STORAGE_KEY) return;
      setTheme(event.newValue === 'dark' ? 'dark' : 'light');
    }

    window.addEventListener('storage', syncThemeFromAnotherTab);
    return () => window.removeEventListener('storage', syncThemeFromAnotherTab);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext value={value}>{children}</ThemeContext>;
}
