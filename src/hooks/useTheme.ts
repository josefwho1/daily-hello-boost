import { useState, useEffect } from 'react';

type Theme = 'system' | 'light' | 'dark';

const THEME_KEY = 'onehello-theme';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(THEME_KEY) as Theme) || 'system';
    }
    return 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (selectedTheme: Theme) => {
      let isDark = false;
      
      if (selectedTheme === 'system') {
        isDark = mediaQuery.matches;
      } else {
        isDark = selectedTheme === 'dark';
      }

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Update theme-color meta tag dynamically
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', isDark ? '#502a13' : '#fff3f4');
      }
    };

    applyTheme(theme);

    // Listen for system theme changes when in system mode
    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  return { theme, setTheme: updateTheme };
};
