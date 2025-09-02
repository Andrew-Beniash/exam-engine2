import React, {createContext, useContext, useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {
  colors,
  spacing,
  radius,
  elevation,
  typography,
  touchTarget,
  motion,
  contrastPairs,
  type ColorScheme,
  type ExamAccent,
} from './tokens';

interface ThemeContextValue {
  colorScheme: ColorScheme;
  examAccent: ExamAccent;
  colors: {
    primary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    bg: string;
    surface01: string;
    surface02: string;
    outline: string;
    textHigh: string;
    textMid: string;
    textLow: string;
    accent: string;
    accentGradient: readonly string[];
  };
  spacing: typeof spacing;
  radius: typeof radius;
  elevation: typeof elevation;
  typography: typeof typography;
  touchTarget: typeof touchTarget;
  motion: typeof motion;
  contrastPairs: typeof contrastPairs.light | typeof contrastPairs.dark;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  examAccent?: ExamAccent;
  forcedColorScheme?: ColorScheme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  examAccent = 'cbap',
  forcedColorScheme,
}) => {
  const systemColorScheme = useColorScheme();
  const colorScheme = forcedColorScheme || systemColorScheme || 'light';

  const theme = useMemo(() => {
    const themeColors = colors[colorScheme];
    const accentConfig = colors.accents[examAccent];

    return {
      colorScheme,
      examAccent,
      colors: {
        // Global semantic colors
        primary: colors.primary,
        success: colors.success,
        warning: colors.warning,
        danger: colors.danger,
        info: colors.info,
        
        // Theme-specific colors
        bg: themeColors.bg,
        surface01: themeColors.surface01,
        surface02: themeColors.surface02,
        outline: themeColors.outline,
        textHigh: themeColors.textHigh,
        textMid: themeColors.textMid,
        textLow: themeColors.textLow,
        
        // Exam-specific accent
        accent: accentConfig.primary,
        accentGradient: accentConfig.gradient,
      },
      spacing,
      radius,
      elevation,
      typography,
      touchTarget,
      motion,
      contrastPairs: contrastPairs[colorScheme],
    };
  }, [colorScheme, examAccent]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const theme = useContext(ThemeContext);
  
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return theme;
};