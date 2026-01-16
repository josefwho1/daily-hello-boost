import { useEffect } from 'react';

export const useTheme = () => {
  useEffect(() => {
    // Always apply dark mode
    document.documentElement.classList.add('dark');
    
    // Update theme-color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', '#502a13');
    }
  }, []);

  return { theme: 'dark' as const };
};
