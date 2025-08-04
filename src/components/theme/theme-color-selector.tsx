import { Check, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useColorTheme, colorThemes, type ColorTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface ColorThemeSelectorProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function ColorThemeSelector({ variant = 'default', className }: ColorThemeSelectorProps) {
  const { colorTheme, setColorTheme } = useColorTheme();
  const { t } = useTranslation('common');

  // Color preview component
  const ColorPreview = ({ theme, isActive }: { theme: ColorTheme; isActive: boolean }) => (
    <div className="flex items-center gap-3 w-full">
      <div 
        className={cn(
          "w-4 h-4 rounded-full border-2 border-background shadow-sm transition-all duration-200",
          isActive && "ring-2 ring-ring ring-offset-1"
        )}
        style={{ 
          backgroundColor: colorThemes[theme].preview,
        }}
      />
      <span className="flex-1 text-sm">{t(colorThemes[theme].translationKey)}</span>
      {isActive && <Check className="h-4 w-4" />}
    </div>
  );

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className={className}>
            <div 
              className="w-4 h-4 rounded-full border border-background"
              style={{ backgroundColor: colorThemes[colorTheme].preview }}
            />
            <span className="sr-only">Change color theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {t('settings.appearance.colorTheme')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="p-1">
            {Object.keys(colorThemes).map((themeKey) => (
              <button
                key={themeKey}
                onClick={() => setColorTheme(themeKey as ColorTheme)}
                className={cn(
                  "w-full flex items-center px-2 py-1.5 text-sm rounded-sm transition-colors duration-200",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                  colorTheme === themeKey && "bg-accent text-accent-foreground"
                )}
              >
                <ColorPreview theme={themeKey as ColorTheme} isActive={colorTheme === themeKey} />
              </button>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("w-auto h-8 px-2", className)}>
          <Palette className="h-4 w-4 mr-2" />
          <div 
            className="w-3 h-3 rounded-full border border-background mr-1"
            style={{ backgroundColor: colorThemes[colorTheme].preview }}
          />
          <span className="text-sm">{t(colorThemes[colorTheme].translationKey)}</span>
        </Button>
      </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {t('settings.appearance.colorTheme')}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="p-1">
            {Object.keys(colorThemes).map((themeKey) => (
              <button
                key={themeKey}
                onClick={() => setColorTheme(themeKey as ColorTheme)}
                className={cn(
                  "w-full flex items-center px-2 py-2 text-sm rounded-sm transition-colors duration-200",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                  colorTheme === themeKey && "bg-accent text-accent-foreground"
                )}
              >
                <ColorPreview theme={themeKey as ColorTheme} isActive={colorTheme === themeKey} />
              </button>
            ))}
          </div>
        </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Grid-based color selector for settings panel
export function ColorThemeGrid({ className }: { className?: string }) {
  const { colorTheme, setColorTheme } = useColorTheme();
  const { t } = useTranslation('common');

  return (
    <div className={cn("grid grid-cols-6 gap-2", className)}>
      {Object.entries(colorThemes).map(([themeKey, themeConfig]) => (
        <button
          key={themeKey}
          onClick={() => setColorTheme(themeKey as ColorTheme)}
          className={cn(
            "group relative w-8 h-8 rounded-full border-2 border-background shadow-sm transition-all duration-200",
            "hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            colorTheme === themeKey && "ring-2 ring-ring ring-offset-2 scale-110"
          )}
          style={{ backgroundColor: themeConfig.preview }}
          title={t(themeConfig.translationKey)}
        >
          {colorTheme === themeKey && (
            <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-sm" />
          )}
        </button>
      ))}
    </div>
  );
} 