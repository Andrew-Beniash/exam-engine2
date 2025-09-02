import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import {Button} from '../../src/components/ui/Button';
import {ThemeProvider} from '../../src/theme/ThemeProvider';

// Test wrapper with theme
const TestWrapper: React.FC<{
  children: React.ReactNode;
  colorScheme?: 'light' | 'dark';
  examAccent?: 'cbap' | 'pmp' | 'azure';
}> = ({children, colorScheme, examAccent}) => (
  <ThemeProvider forcedColorScheme={colorScheme} examAccent={examAccent}>
    {children}
  </ThemeProvider>
);

describe('Button', () => {
  describe('Rendering and Interaction', () => {
    it('renders button with label', () => {
      render(
        <TestWrapper>
          <Button testID="test-button">Test Button</Button>
        </TestWrapper>,
      );

      expect(screen.getByTestId('test-button')).toBeTruthy();
      expect(screen.getByText('Test Button')).toBeTruthy();
    });

    it('is pressable and calls onPress', () => {
      const mockOnPress = jest.fn();
      
      render(
        <TestWrapper>
          <Button testID="test-button" onPress={mockOnPress}>
            Pressable Button
          </Button>
        </TestWrapper>,
      );

      const button = screen.getByTestId('test-button');
      fireEvent.press(button);
      
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('respects disabled state', () => {
      const mockOnPress = jest.fn();
      
      render(
        <TestWrapper>
          <Button testID="test-button" disabled={true} onPress={mockOnPress}>
            Disabled Button  
          </Button>
        </TestWrapper>,
      );

      const button = screen.getByTestId('test-button');
      fireEvent.press(button);
      
      expect(mockOnPress).not.toHaveBeenCalled();
      expect(button).toHaveAccessibilityState({disabled: true});
    });

    it('respects loading state', () => {
      const mockOnPress = jest.fn();
      
      render(
        <TestWrapper>
          <Button testID="test-button" loading={true} onPress={mockOnPress}>
            Loading Button
          </Button>
        </TestWrapper>,
      );

      const button = screen.getByTestId('test-button');
      fireEvent.press(button);
      
      expect(mockOnPress).not.toHaveBeenCalled();
      expect(button).toHaveAccessibilityState({disabled: true, busy: true});
    });
  });

  describe('Variants', () => {
    it('renders primary variant', () => {
      render(
        <TestWrapper>
          <Button testID="primary-button" variant="primary">
            Primary
          </Button>
        </TestWrapper>,
      );

      expect(screen.getByTestId('primary-button')).toBeTruthy();
    });

    it('renders secondary variant', () => {
      render(
        <TestWrapper>
          <Button testID="secondary-button" variant="secondary">
            Secondary
          </Button>
        </TestWrapper>,
      );

      expect(screen.getByTestId('secondary-button')).toBeTruthy();
    });

    it('renders tertiary variant', () => {
      render(
        <TestWrapper>
          <Button testID="tertiary-button" variant="tertiary">
            Tertiary
          </Button>
        </TestWrapper>,
      );

      expect(screen.getByTestId('tertiary-button')).toBeTruthy();
    });

    it('renders destructive variant', () => {
      render(
        <TestWrapper>
          <Button testID="destructive-button" variant="destructive">
            Destructive
          </Button>
        </TestWrapper>,
      );

      expect(screen.getByTestId('destructive-button')).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      render(
        <TestWrapper>
          <Button testID="small-button" size="small">
            Small
          </Button>
        </TestWrapper>,
      );

      expect(screen.getByTestId('small-button')).toBeTruthy();
    });

    it('renders medium size (default)', () => {
      render(
        <TestWrapper>
          <Button testID="medium-button">Medium</Button>
        </TestWrapper>,
      );

      expect(screen.getByTestId('medium-button')).toBeTruthy();
    });

    it('renders large size', () => {
      render(
        <TestWrapper>
          <Button testID="large-button" size="large">
            Large
          </Button>
        </TestWrapper>,
      );

      expect(screen.getByTestId('large-button')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility role', () => {
      render(
        <TestWrapper>
          <Button testID="accessible-button">Accessible Button</Button>
        </TestWrapper>,
      );

      const button = screen.getByTestId('accessible-button');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('supports custom accessibility label and hint', () => {
      render(
        <TestWrapper>
          <Button
            testID="custom-a11y-button"
            accessibilityLabel="Custom Label"
            accessibilityHint="Custom Hint">
            Button
          </Button>
        </TestWrapper>,
      );

      const button = screen.getByTestId('custom-a11y-button');
      expect(button.props.accessibilityLabel).toBe('Custom Label');
      expect(button.props.accessibilityHint).toBe('Custom Hint');
    });

    it('uses button text as default accessibility label', () => {
      render(
        <TestWrapper>
          <Button testID="default-a11y-button">Default Label</Button>
        </TestWrapper>,
      );

      const button = screen.getByTestId('default-a11y-button');
      expect(button.props.accessibilityLabel).toBe('Default Label');
    });
  });

  describe('Theme Snapshots', () => {
    it('matches snapshot in light theme', () => {
      const tree = render(
        <TestWrapper colorScheme="light">
          <Button variant="primary">Light Theme Button</Button>
        </TestWrapper>,
      );

      expect(tree).toMatchSnapshot('Button-light-theme');
    });

    it('matches snapshot in dark theme', () => {
      const tree = render(
        <TestWrapper colorScheme="dark">
          <Button variant="primary">Dark Theme Button</Button>
        </TestWrapper>,
      );

      expect(tree).toMatchSnapshot('Button-dark-theme');
    });

    it('matches snapshot with CBAP accent', () => {
      const tree = render(
        <TestWrapper examAccent="cbap">
          <Button variant="primary">CBAP Accent Button</Button>
        </TestWrapper>,
      );

      expect(tree).toMatchSnapshot('Button-cbap-accent');
    });

    it('matches snapshot with PMP accent', () => {
      const tree = render(
        <TestWrapper examAccent="pmp">
          <Button variant="primary">PMP Accent Button</Button>
        </TestWrapper>,
      );

      expect(tree).toMatchSnapshot('Button-pmp-accent');
    });

    it('matches snapshot with Azure accent', () => {
      const tree = render(
        <TestWrapper examAccent="azure">
          <Button variant="primary">Azure Accent Button</Button>
        </TestWrapper>,
      );

      expect(tree).toMatchSnapshot('Button-azure-accent');
    });
  });
});