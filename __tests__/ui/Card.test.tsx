import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import {Text} from 'react-native';
import {Card} from '../../src/components/ui/Card';
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

describe('Card', () => {
  describe('Rendering and Content', () => {
    it('renders children content', () => {
      render(
        <TestWrapper>
          <Card testID="test-card">
            <Text>Card Content</Text>
          </Card>
        </TestWrapper>,
      );

      expect(screen.getByTestId('test-card')).toBeTruthy();
      expect(screen.getByText('Card Content')).toBeTruthy();
    });

    it('renders as non-interactive by default', () => {
      render(
        <TestWrapper>
          <Card testID="non-interactive-card">
            <Text>Non-Interactive Card</Text>
          </Card>
        </TestWrapper>,
      );

      const card = screen.getByTestId('non-interactive-card');
      
      // Should not have button role when not interactive
      expect(card.props.accessibilityRole).not.toBe('button');
      
      // Should render as a View, not Pressable
      expect(card.type).toBe('View');
    });

    it('renders as interactive when specified', () => {
      const mockOnPress = jest.fn();
      
      render(
        <TestWrapper>
          <Card testID="interactive-card" interactive={true} onPress={mockOnPress}>
            <Text>Interactive Card</Text>
          </Card>
        </TestWrapper>,
      );

      const card = screen.getByTestId('interactive-card');
      
      // Should have button role when interactive
      expect(card.props.accessibilityRole).toBe('button');
      
      // Press should work
      fireEvent.press(card);
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Elevation Prop', () => {
    it('respects rest elevation prop', () => {
      render(
        <TestWrapper>
          <Card testID="rest-elevation-card" elevation="rest">
            <Text>Rest Elevation</Text>
          </Card>
        </TestWrapper>,
      );

      expect(screen.getByTestId('rest-elevation-card')).toBeTruthy();
    });

    it('respects pressed elevation prop', () => {
      render(
        <TestWrapper>
          <Card testID="pressed-elevation-card" elevation="pressed">
            <Text>Pressed Elevation</Text>
          </Card>
        </TestWrapper>,
      );

      expect(screen.getByTestId('pressed-elevation-card')).toBeTruthy();
    });
  });

  describe('Padding Variants', () => {
    it('renders with no padding', () => {
      render(
        <TestWrapper>
          <Card testID="no-padding-card" padding="none">
            <Text>No Padding</Text>
          </Card>
        </TestWrapper>,
      );

      expect(screen.getByTestId('no-padding-card')).toBeTruthy();
    });

    it('renders with small padding', () => {
      render(
        <TestWrapper>
          <Card testID="small-padding-card" padding="small">
            <Text>Small Padding</Text>
          </Card>
        </TestWrapper>,
      );

      expect(screen.getByTestId('small-padding-card')).toBeTruthy();
    });

    it('renders with medium padding (default)', () => {
      render(
        <TestWrapper>
          <Card testID="medium-padding-card">
            <Text>Medium Padding</Text>
          </Card>
        </TestWrapper>,
      );

      expect(screen.getByTestId('medium-padding-card')).toBeTruthy();
    });

    it('renders with large padding', () => {
      render(
        <TestWrapper>
          <Card testID="large-padding-card" padding="large">
            <Text>Large Padding</Text>
          </Card>
        </TestWrapper>,
      );

      expect(screen.getByTestId('large-padding-card')).toBeTruthy();
    });
  });

  describe('Interactive Accessibility', () => {
    it('supports custom accessibility label and hint for interactive cards', () => {
      render(
        <TestWrapper>
          <Card
            testID="custom-a11y-card"
            interactive={true}
            accessibilityLabel="Custom Card Label"
            accessibilityHint="Custom Card Hint">
            <Text>Accessible Card</Text>
          </Card>
        </TestWrapper>,
      );

      const card = screen.getByTestId('custom-a11y-card');
      expect(card.props.accessibilityLabel).toBe('Custom Card Label');
      expect(card.props.accessibilityHint).toBe('Custom Card Hint');
    });
  });

  describe('Theme Snapshots', () => {
    it('matches snapshot in light theme', () => {
      const tree = render(
        <TestWrapper colorScheme="light">
          <Card>
            <Text>Light Theme Card</Text>
          </Card>
        </TestWrapper>,
      );

      expect(tree).toMatchSnapshot('Card-light-theme');
    });

    it('matches snapshot in dark theme', () => {
      const tree = render(
        <TestWrapper colorScheme="dark">
          <Card>
            <Text>Dark Theme Card</Text>
          </Card>
        </TestWrapper>,
      );

      expect(tree).toMatchSnapshot('Card-dark-theme');
    });

    it('matches snapshot with rest elevation', () => {
      const tree = render(
        <TestWrapper>
          <Card elevation="rest">
            <Text>Rest Elevation Card</Text>
          </Card>
        </TestWrapper>,
      );

      expect(tree).toMatchSnapshot('Card-rest-elevation');
    });

    it('matches snapshot with pressed elevation', () => {
      const tree = render(
        <TestWrapper>
          <Card elevation="pressed">
            <Text>Pressed Elevation Card</Text>
          </Card>
        </TestWrapper>,
      );

      expect(tree).toMatchSnapshot('Card-pressed-elevation');
    });

    it('matches snapshot as interactive card', () => {
      const tree = render(
        <TestWrapper>
          <Card interactive={true}>
            <Text>Interactive Card</Text>
          </Card>
        </TestWrapper>,
      );

      expect(tree).toMatchSnapshot('Card-interactive');
    });
  });
});