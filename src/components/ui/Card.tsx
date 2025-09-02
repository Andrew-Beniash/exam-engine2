import React, {useState} from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {useTheme} from '../../theme';

export interface CardProps {
  /**
   * Card content
   */
  children: React.ReactNode;
  
  /**
   * Whether the card is interactive (pressable)
   */
  interactive?: boolean;
  
  /**
   * Press handler for interactive cards
   */
  onPress?: () => void;
  
  /**
   * Elevation variant - affects shadow depth
   */
  elevation?: 'rest' | 'pressed';
  
  /**
   * Card padding variant
   */
  padding?: 'none' | 'small' | 'medium' | 'large';
  
  /**
   * Accessibility label for interactive cards
   */
  accessibilityLabel?: string;
  
  /**
   * Accessibility hint for interactive cards  
   */
  accessibilityHint?: string;
  
  /**
   * Test ID for testing
   */
  testID?: string;
  
  /**
   * Additional styles
   */
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  onPress,
  elevation = 'rest',
  padding = 'medium',
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}) => {
  const theme = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  // Determine which elevation to use
  const currentElevation = interactive && isPressed ? 'pressed' : elevation;
  const shadowStyle = theme.elevation.card[currentElevation];

  // Padding configurations
  const paddingConfig = {
    none: 0,
    small: theme.spacing.m,     // 12pt
    medium: theme.spacing.l,    // 16pt (phone) / 20pt would be tablet
    large: theme.spacing.xl,    // 24pt
  };

  const cardStyles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface02,
      borderRadius: theme.radius.xl,
      padding: paddingConfig[padding],
      // Apply shadow/elevation styles
      ...shadowStyle,
    },
  });

  // If not interactive, render as a simple View
  if (!interactive) {
    return (
      <View
        style={[cardStyles.container, style]}
        testID={testID}>
        {children}
      </View>
    );
  }

  // Render as interactive Pressable
  return (
    <Pressable
      style={[cardStyles.container, style]}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      testID={testID}>
      {children}
    </Pressable>
  );
};