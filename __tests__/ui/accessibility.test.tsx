import React from 'react';
import {render, screen} from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import {Text} from 'react-native';
import {Button} from '../../src/components/ui/Button';
import {Card} from '../../src/components/ui/Card';
import {ThemeProvider, useTheme} from '../../src/theme';
import {touchTarget, contrastPairs} from '../../src/theme/tokens';

// Test wrapper with theme
const TestWrapper: React.FC<{
  children: React.ReactNode;
  colorScheme?: 'light' | 'dark';
}> = ({children, colorScheme}) => (
  <ThemeProvider forcedColorScheme={colorScheme}>
    {children}
  </ThemeProvider>
);

// Helper component to test theme values
const ThemeTestHelper: React.FC<{
  onThemeCapture: (theme: ReturnType<typeof useTheme>) => void;
}> = ({onThemeCapture}) => {
  const theme = useTheme();
  React.useEffect(() => {
    onThemeCapture(theme);
  }, [theme, onThemeCapture]);
  return null;
};

describe('Accessibility Standards', () => {
  describe('Touch Target Size - WCAG AA Minimum 44pt', () => {
    it('Button meets minimum touch target size for all sizes', () => {
      let capturedTheme: ReturnType<typeof useTheme> | undefined;
      
      render(
        <TestWrapper>
          <ThemeTestHelper
            onThemeCapture={theme => {
              capturedTheme = theme;
            }}
          />
        </TestWrapper>,
      );

      // Verify our minimum touch target constant meets WCAG AA
      expect(touchTarget.minimum).toBeGreaterThanOrEqual(44);
      expect(capturedTheme?.touchTarget.minimum).toBe(44);
    });

    it('Small button maintains minimum 44pt touch target', () => {
      render(
        <TestWrapper>
          <Button testID="small-button" size="small">
            Small
          </Button>
        </TestWrapper>,
      );

      const button = screen.getByTestId('small-button');
      const buttonStyle = button.props.style;
      
      // Extract height from style arrays/objects
      const height = Array.isArray(buttonStyle)
        ? buttonStyle.reduce((acc, style) => ({...acc, ...style}), {}).height
        : buttonStyle?.height;
      
      expect(height).toBeGreaterThanOrEqual(44);
    });

    it('Medium button maintains minimum 44pt touch target', () => {
      render(
        <TestWrapper>
          <Button testID="medium-button" size="medium">
            Medium
          </Button>
        </TestWrapper>,
      );

      const button = screen.getByTestId('medium-button');
      const buttonStyle = button.props.style;
      
      const height = Array.isArray(buttonStyle)
        ? buttonStyle.reduce((acc, style) => ({...acc, ...style}), {}).height
        : buttonStyle?.height;
      
      expect(height).toBeGreaterThanOrEqual(44);
    });

    it('Large button maintains minimum 44pt touch target', () => {
      render(
        <TestWrapper>
          <Button testID="large-button" size="large">
            Large
          </Button>
        </TestWrapper>,
      );

      const button = screen.getByTestId('large-button');
      const buttonStyle = button.props.style;
      
      const height = Array.isArray(buttonStyle)
        ? buttonStyle.reduce((acc, style) => ({...acc, ...style}), {}).height
        : buttonStyle?.height;
      
      expect(height).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Color Contrast - WCAG AA Compliance (4.5:1)', () => {
    it('Light theme contrast pairs meet WCAG AA standards', () => {
      const lightContrast = contrastPairs.light;
      
      // Verify all contrast ratios meet or exceed WCAG AA (4.5:1)
      expect(lightContrast['textHigh-bg']).toBeGreaterThanOrEqual(4.5);
      expect(lightContrast['textMid-bg']).toBeGreaterThanOrEqual(4.5);
      expect(lightContrast['textLow-bg']).toBeGreaterThanOrEqual(4.5);
      expect(lightContrast['textHigh-surface01']).toBeGreaterThanOrEqual(4.5);
      expect(lightContrast['primary-bg']).toBeGreaterThanOrEqual(4.5);
    });

    it('Dark theme contrast pairs meet WCAG AA standards', () => {
      const darkContrast = contrastPairs.dark;
      
      // Verify all contrast ratios meet or exceed WCAG AA (4.5:1)
      expect(darkContrast['textHigh-bg']).toBeGreaterThanOrEqual(4.5);
      expect(darkContrast['textMid-bg']).toBeGreaterThanOrEqual(4.5);
      expect(darkContrast['textLow-bg']).toBeGreaterThanOrEqual(4.5);
      expect(darkContrast['textHigh-surface01']).toBeGreaterThanOrEqual(4.5);
      expect(darkContrast['primary-bg']).toBeGreaterThanOrEqual(4.5);
    });

    it('Theme tokens provide AA compliant contrast pairs', () => {
      let lightTheme: ReturnType<typeof useTheme> | undefined;
      let darkTheme: ReturnType<typeof useTheme> | undefined;
      
      render(
        <TestWrapper colorScheme="light">
          <ThemeTestHelper
            onThemeCapture={theme => {
              lightTheme = theme;
            }}
          />
        </TestWrapper>,
      );
      
      render(
        <TestWrapper colorScheme="dark">
          <ThemeTestHelper
            onThemeCapture={theme => {
              darkTheme = theme;
            }}
          />
        </TestWrapper>,
      );

      // Verify theme objects include contrast validation data
      expect(lightTheme?.contrastPairs).toBeDefined();
      expect(darkTheme?.contrastPairs).toBeDefined();
      
      // All documented pairs should meet AA standards
      Object.values(lightTheme?.contrastPairs || {}).forEach((ratio: number) => {
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
      
      Object.values(darkTheme?.contrastPairs || {}).forEach((ratio: number) => {
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    });
  });

  describe('Text Scaling Support - Up to 200%', () => {
    it('Button supports font scaling with allowFontScaling and maxFontSizeMultiplier', () => {
      render(
        <TestWrapper>
          <Button testID="scalable-button">Scalable Text</Button>
        </TestWrapper>,
      );

      const button = screen.getByTestId('scalable-button');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const textComponent = button.findByType(Text) as any;
      
      expect(textComponent.props.allowFontScaling).toBe(true);
      expect(textComponent.props.maxFontSizeMultiplier).toBe(2.0);
    });

    it('Button text supports 200% scaling as specified', () => {
      render(
        <TestWrapper>
          <Button testID="text-scaling-button">Text Scaling Test</Button>
        </TestWrapper>,
      );

      const button = screen.getByTestId('text-scaling-button');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const textComponent = button.findByType(Text) as any;
      
      // Verify the maximum scaling factor allows 200% (2.0x)
      expect(textComponent.props.maxFontSizeMultiplier).toBe(2.0);
      expect(textComponent.props.allowFontScaling).toBe(true);
    });
  });

  describe('Accessibility Properties', () => {
    it('Button has proper accessibility attributes', () => {
      render(
        <TestWrapper>
          <Button 
            testID="a11y-button" 
            accessibilityLabel="Accessible Button"
            accessibilityHint="This button performs an action">
            Button Text
          </Button>
        </TestWrapper>,
      );

      const button = screen.getByTestId('a11y-button');
      
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Accessible Button');
      expect(button.props.accessibilityHint).toBe('This button performs an action');
      expect(button.props.accessible).toBe(true);
    });

    it('Interactive Card has proper accessibility attributes', () => {
      render(
        <TestWrapper>
          <Card 
            testID="a11y-card" 
            interactive={true}
            accessibilityLabel="Accessible Card"
            accessibilityHint="This card is interactive">
            <Text>Card Content</Text>
          </Card>
        </TestWrapper>,
      );

      const card = screen.getByTestId('a11y-card');
      
      expect(card.props.accessibilityRole).toBe('button');
      expect(card.props.accessibilityLabel).toBe('Accessible Card');
      expect(card.props.accessibilityHint).toBe('This card is interactive');
      expect(card.props.accessible).toBe(true);
    });

    it('Non-interactive Card does not have button accessibility role', () => {
      render(
        <TestWrapper>
          <Card testID="non-interactive-a11y-card">
            <Text>Non-Interactive Content</Text>
          </Card>
        </TestWrapper>,
      );

      const card = screen.getByTestId('non-interactive-a11y-card');
      
      // Non-interactive cards should not have button role
      expect(card.props.accessibilityRole).not.toBe('button');
    });

    it('Disabled button has correct accessibility state', () => {
      render(
        <TestWrapper>
          <Button testID="disabled-a11y-button" disabled={true}>
            Disabled Button
          </Button>
        </TestWrapper>,
      );

      const button = screen.getByTestId('disabled-a11y-button');
      
      expect(button).toHaveAccessibilityState({disabled: true});
    });

    it('Loading button has correct accessibility state', () => {
      render(
        <TestWrapper>
          <Button testID="loading-a11y-button" loading={true}>
            Loading Button
          </Button>
        </TestWrapper>,
      );

      const button = screen.getByTestId('loading-a11y-button');
      
      expect(button).toHaveAccessibilityState({disabled: true, busy: true});
    });
  });
});