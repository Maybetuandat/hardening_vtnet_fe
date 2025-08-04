import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

// Color theme type definition
export type ColorTheme = 'blue' | 'cyan' | 'green' | 'purple' | 'orange' | 'pink';

// Theme context interface
interface ThemeContextType {
  // Next-themes inherited
  theme: string | undefined;
  setTheme: (theme: string) => void;
  resolvedTheme: string | undefined;
  
  // Color theme extension
  colorTheme: ColorTheme;
  setColorTheme: (colorTheme: ColorTheme) => void;
  
  // Utility functions
  isDark: boolean;
  isSystemTheme: boolean;
}

// Color theme configurations
export const colorThemes: Record<ColorTheme, { value: string; preview: string; translationKey: string }> = {
  blue: {
    value: 'blue',
    preview: 'hsl(222.2, 47.4%, 11.2%)', // Default shadcn blue
    translationKey: 'settings.colors.blue',
  },
  cyan: {
    value: 'cyan',
    preview: 'hsl(189, 94%, 43%)', // Bright cyan
    translationKey: 'settings.colors.cyan',
  },
  green: {
    value: 'green',
    preview: 'hsl(142, 76%, 36%)', // Emerald green
    translationKey: 'settings.colors.green',
  },
  purple: {
    value: 'purple',
    preview: 'hsl(262, 83%, 58%)', // Violet purple
    translationKey: 'settings.colors.purple',
  },
  orange: {
    value: 'orange',
    preview: 'hsl(25, 95%, 53%)', // Orange
    translationKey: 'settings.colors.orange',
  },
  pink: {
    value: 'pink',
    preview: 'hsl(330, 81%, 60%)', // Pink
    translationKey: 'settings.colors.pink',
  },
};

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme storage keys
const COLOR_THEME_STORAGE_KEY = 'color-theme';

// Color theme CSS variables configuration
function getColorThemeConfig(colorTheme: ColorTheme, isDark: boolean): Record<string, string> {
  const configs: Record<ColorTheme, { light: Record<string, string>; dark: Record<string, string> }> = {
    blue: {
      light: {
        'primary': '222.2 47.4% 11.2%',
        'primary-foreground': '210 40% 98%',
        'ring': '222.2 84% 4.9%',
        'sidebar-primary': '222.2 47.4% 11.2%',
        'sidebar-ring': '217.2 91.2% 59.8%',
      },
      dark: {
        'primary': '210 40% 98%',
        'primary-foreground': '222.2 47.4% 11.2%',
        'ring': '212.7 26.8% 83.9%',
        'sidebar-primary': '210 40% 98%',
        'sidebar-primary-foreground': '222.2 47.4% 11.2%',
        'sidebar-ring': '217.2 91.2% 59.8%',
      },
    },
    cyan: {
      light: {
        'primary': '189 94% 43%',
        'primary-foreground': '0 0% 98%',
        'ring': '189 94% 43%',
        'sidebar-primary': '189 94% 43%',
        'sidebar-ring': '189 94% 43%',
      },
      dark: {
        'primary': '189 100% 80%',
        'primary-foreground': '189 94% 10%',
        'ring': '189 100% 80%',
        'sidebar-primary': '189 100% 80%',
        'sidebar-primary-foreground': '189 94% 10%',
        'sidebar-ring': '189 100% 80%',
      },
    },
    green: {
      light: {
        'primary': '142 76% 36%',
        'primary-foreground': '0 0% 98%',
        'ring': '142 76% 36%',
        'sidebar-primary': '142 76% 36%',
        'sidebar-ring': '142 76% 36%',
      },
      dark: {
        'primary': '142 84% 70%',
        'primary-foreground': '142 76% 10%',
        'ring': '142 84% 70%',
        'sidebar-primary': '142 84% 70%',
        'sidebar-primary-foreground': '142 76% 10%',
        'sidebar-ring': '142 84% 70%',
      },
    },
    purple: {
      light: {
        'primary': '262 83% 58%',
        'primary-foreground': '0 0% 98%',
        'ring': '262 83% 58%',
        'sidebar-primary': '262 83% 58%',
        'sidebar-ring': '262 83% 58%',
      },
      dark: {
        'primary': '262 90% 75%',
        'primary-foreground': '262 83% 15%',
        'ring': '262 90% 75%',
        'sidebar-primary': '262 90% 75%',
        'sidebar-primary-foreground': '262 83% 15%',
        'sidebar-ring': '262 90% 75%',
      },
    },
    orange: {
      light: {
        'primary': '25 95% 53%',
        'primary-foreground': '0 0% 98%',
        'ring': '25 95% 53%',
        'sidebar-primary': '25 95% 53%',
        'sidebar-ring': '25 95% 53%',
      },
      dark: {
        'primary': '25 100% 70%',
        'primary-foreground': '25 95% 15%',
        'ring': '25 100% 70%',
        'sidebar-primary': '25 100% 70%',
        'sidebar-primary-foreground': '25 95% 15%',
        'sidebar-ring': '25 100% 70%',
      },
    },
    pink: {
      light: {
        'primary': '330 81% 60%',
        'primary-foreground': '0 0% 98%',
        'ring': '330 81% 60%',
        'sidebar-primary': '330 81% 60%',
        'sidebar-ring': '330 81% 60%',
      },
      dark: {
        'primary': '330 85% 75%',
        'primary-foreground': '330 81% 15%',
        'ring': '330 85% 75%',
        'sidebar-primary': '330 85% 75%',
        'sidebar-primary-foreground': '330 81% 15%',
        'sidebar-ring': '330 85% 75%',
      },
    },
  };
  
  return isDark ? configs[colorTheme].dark : configs[colorTheme].light;
}

// Theme provider component
export function ExtendedThemeProvider({ children }: { children: React.ReactNode }) {
  const nextTheme = useNextTheme();
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('blue');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load color theme from localStorage
  useEffect(() => {
    try {
      const savedColorTheme = localStorage.getItem(COLOR_THEME_STORAGE_KEY) as ColorTheme;
      if (savedColorTheme && colorThemes[savedColorTheme]) {
        setColorThemeState(savedColorTheme);
      }
    } catch (error) {
      console.warn('Failed to load color theme from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Apply color theme to document
  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;
    
    // Remove existing color theme classes
    Object.keys(colorThemes).forEach(theme => {
      root.classList.remove(`theme-${theme}`);
    });
    
    // Add current color theme class
    root.classList.add(`theme-${colorTheme}`);
    
    // Direct CSS variables injection to force override
    const isDarkMode = nextTheme.resolvedTheme === 'dark';
    const colorConfig = getColorThemeConfig(colorTheme, isDarkMode);
    
    // Apply CSS variables directly to root
    Object.entries(colorConfig).forEach(([property, value]) => {
      root.style.setProperty(`--${property}`, value);
    });
    
    // Force style recalculation
    requestAnimationFrame(() => {
      // Trigger reflow to ensure CSS variables are updated
      void root.offsetHeight;
    });
    
    // Save to localStorage
    try {
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, colorTheme);
    } catch (error) {
      console.warn('Failed to save color theme to localStorage:', error);
    }
  }, [colorTheme, isLoaded, nextTheme.resolvedTheme]);

  // Color theme setter with validation
  const setColorTheme = (newColorTheme: ColorTheme) => {
    if (colorThemes[newColorTheme]) {
      setColorThemeState(newColorTheme);
    } else {
      console.warn(`Invalid color theme: ${newColorTheme}`);
    }
  };

  // Utility computations
  const isDark = nextTheme.resolvedTheme === 'dark';
  const isSystemTheme = nextTheme.theme === 'system';

  const contextValue: ThemeContextType = {
    // Next-themes integration
    theme: nextTheme.theme,
    setTheme: nextTheme.setTheme,
    resolvedTheme: nextTheme.resolvedTheme,
    
    // Color theme extension
    colorTheme,
    setColorTheme,
    
    // Utilities
    isDark,
    isSystemTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme context
export function useExtendedTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useExtendedTheme must be used within an ExtendedThemeProvider');
  }
  return context;
}

// Backwards compatibility hook
export function useColorTheme() {
  const { colorTheme, setColorTheme } = useExtendedTheme();
  return { colorTheme, setColorTheme };
} 