import { Settings, Sun, Moon, Monitor, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { useExtendedTheme } from '@/contexts/ThemeContext';
import { ColorThemeGrid } from './theme-color-selector';
import { cn } from '@/lib/utils';

interface ThemeSettingsPanelProps {
  variant?: 'dialog' | 'popover' | 'inline';
  className?: string;
  trigger?: React.ReactNode;
}

// Languages configuration
const languages = [
  { code: 'vi', nameKey: 'settings.languages.vi', flag: '🇻🇳' },
  { code: 'en', nameKey: 'settings.languages.en', flag: '🇺🇸' },
];

export function ThemeSettingsPanel({ 
  variant = 'popover', 
  className, 
  trigger 
}: ThemeSettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const { colorTheme } = useExtendedTheme();
  const { i18n, t } = useTranslation('common');

  const currentLanguage = languages.find(lang => lang.code === i18n.language);

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  // Theme mode options with translations
  const themeModes = [
    { value: 'light', labelKey: 'settings.appearance.light', icon: Sun },
    { value: 'dark', labelKey: 'settings.appearance.dark', icon: Moon },
    { value: 'system', labelKey: 'settings.appearance.system', icon: Monitor },
  ];

  // Settings content component
  const SettingsContent = () => (
    <div className="space-y-6 w-full">
      {/* Appearance Section */}
      <div className="space-y-4">

        {/* Theme Mode */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('settings.appearance.themeMode')}</label>
          <div className="grid grid-cols-3 gap-2">
            {themeModes.map(({ value, labelKey, icon: Icon }) => (
              <Button
                key={value}
                variant={theme === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme(value)}
                className="h-10 justify-start"
              >
                <Icon className="h-4 w-4 mr-2" />
                {t(labelKey)}
              </Button>
            ))}
          </div>
        </div>

        {/* Color Theme */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('settings.appearance.colorTheme')}</label>
          <ColorThemeGrid />
        </div>
      </div>

      <Separator />

      {/* Language Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-medium flex items-center gap-2">
            <Languages className="h-4 w-4" />
            {t('settings.language.title')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('settings.language.description')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {languages.map((language) => (
            <Button
              key={language.code}
              variant={i18n.language === language.code ? 'default' : 'outline'}
              size="sm"
              onClick={() => changeLanguage(language.code)}
              className="h-10 justify-start"
            >
              <span className="mr-2">{language.flag}</span>
              {t(language.nameKey)}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Current Settings Summary */}
      <div className="space-y-3">
        <h3 className="text-base font-medium">{t('settings.currentSettings')}</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('settings.theme')}:</span>
            <Badge variant="secondary">{t(`settings.appearance.${theme}`)}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('settings.color')}:</span>
            <Badge variant="secondary">{t(`settings.colors.${colorTheme}`)}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('settings.language.title')}:</span>
            <Badge variant="secondary">
              {currentLanguage ? t(currentLanguage.nameKey) : ''}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );

  // Default trigger
  const defaultTrigger = (
    <Button variant="outline" size="icon" className={className}>
      <Settings className="h-4 w-4" />
      <span className="sr-only">{t('settings.openSettings')}</span>
    </Button>
  );

  if (variant === 'dialog') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('settings.title')}
            </DialogTitle>
            <DialogDescription>
              {t('settings.description')}
            </DialogDescription>
          </DialogHeader>
          <SettingsContent />
        </DialogContent>
      </Dialog>
    );
  }

  if (variant === 'popover') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          {trigger || defaultTrigger}
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium leading-none flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t('settings.title')}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {t('settings.customizePreferences')}
              </p>
            </div>
            <Separator />
            <SettingsContent />
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Inline variant
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t('settings.title')}
        </CardTitle>
        <CardDescription>
          {t('settings.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SettingsContent />
      </CardContent>
    </Card>
  );
}

// Quick settings component for header/navbar
export function QuickSettings({ className }: { className?: string }) {
  const { t } = useTranslation('common');
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ThemeSettingsPanel 
        variant="popover"
        trigger={
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
            <span className="sr-only">{t('settings.title')}</span>
          </Button>
        }
      />
    </div>
  );
} 