import { useTheme as useNextTheme } from "next-themes";

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const { theme, setTheme } = useNextTheme();
  
  return {
    theme: theme as Theme,
    setTheme: (newTheme: Theme) => setTheme(newTheme)
  };
}