import React, {useState} from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
} from 'react-native';
import {useTheme} from '../../theme';

export interface ButtonProps {
  /**
   * Button text content
   */
  children: React.ReactNode;
  
  /**
   * Button variant style
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  
  /**
   * Button size 
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Loading state - shows spinner
   */
  loading?: boolean;
  
  /**
   * Press handler
   */
  onPress?: () => void;
  
  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
  
  /**
   * Accessibility hint
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

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}) => {
  const theme = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const isDisabled = disabled || loading;

  // Size configurations - ensure minimum 44pt touch target
  const sizeConfig = {
    small: {
      height: Math.max(theme.touchTarget.minimum, 36),
      paddingHorizontal: theme.spacing.m,
      fontSize: theme.typography.bodySm.fontSize,
      minWidth: theme.touchTarget.minimum,
    },
    medium: {
      height: Math.max(theme.touchTarget.minimum, 48),
      paddingHorizontal: theme.spacing.l,
      fontSize: theme.typography.body.fontSize,
      minWidth: theme.touchTarget.minimum,
    },
    large: {
      height: Math.max(theme.touchTarget.minimum, 56),
      paddingHorizontal: theme.spacing.xl,
      fontSize: theme.typography.bodyLg.fontSize,
      minWidth: theme.touchTarget.minimum,
    },
  };

  const currentSize = sizeConfig[size];

  // Variant color configurations
  const getVariantStyles = (): {container: ViewStyle; text: TextStyle} => {
    const baseStyle = {
      borderRadius: theme.radius.lg,
      height: currentSize.height,
      paddingHorizontal: currentSize.paddingHorizontal,
      minWidth: currentSize.minWidth,
      borderWidth: 0,
    };

    switch (variant) {
      case 'primary':
        return {
          container: {
            ...baseStyle,
            backgroundColor: isDisabled 
              ? theme.colors.textLow 
              : isPressed 
                ? theme.colors.accent 
                : theme.colors.primary,
            borderWidth: 0,
          } as ViewStyle,
          text: {
            color: isDisabled 
              ? theme.colors.textMid 
              : theme.colors.bg, // White text on primary bg - meets AA contrast
            fontSize: currentSize.fontSize,
            fontWeight: theme.typography.weights.semibold,
          } as TextStyle,
        };

      case 'secondary':
        return {
          container: {
            ...baseStyle,
            backgroundColor: isPressed ? `${theme.colors.primary}12` : 'transparent',
            borderWidth: 1.5,
            borderColor: isDisabled 
              ? theme.colors.outline 
              : theme.colors.primary,
          } as ViewStyle,
          text: {
            color: isDisabled 
              ? theme.colors.textLow 
              : theme.colors.primary,
            fontSize: currentSize.fontSize,
            fontWeight: theme.typography.weights.semibold,
          } as TextStyle,
        };

      case 'tertiary':
        return {
          container: {
            ...baseStyle,
            backgroundColor: isPressed ? `${theme.colors.primary}08` : 'transparent',
            borderWidth: 0,
          } as ViewStyle,
          text: {
            color: isDisabled 
              ? theme.colors.textLow 
              : theme.colors.primary,
            fontSize: currentSize.fontSize,
            fontWeight: theme.typography.weights.semibold,
          } as TextStyle,
        };

      case 'destructive':
        return {
          container: {
            ...baseStyle,
            backgroundColor: isDisabled 
              ? theme.colors.textLow 
              : isPressed 
                ? `${theme.colors.danger}CC` 
                : theme.colors.danger,
            borderWidth: 0,
          } as ViewStyle,
          text: {
            color: isDisabled 
              ? theme.colors.textMid 
              : theme.colors.bg, // White text on danger bg - meets AA contrast
            fontSize: currentSize.fontSize,
            fontWeight: theme.typography.weights.semibold,
          } as TextStyle,
        };

      default:
        // Fallback to primary variant
        return {
          container: {
            ...baseStyle,
            backgroundColor: isDisabled 
              ? theme.colors.textLow 
              : isPressed 
                ? theme.colors.accent 
                : theme.colors.primary,
            borderWidth: 0,
          } as ViewStyle,
          text: {
            color: isDisabled 
              ? theme.colors.textMid 
              : theme.colors.bg,
            fontSize: currentSize.fontSize,
            fontWeight: theme.typography.weights.semibold,
          } as TextStyle,
        };
    }
  };

  const styles = getVariantStyles();

  const accessibilityRole: AccessibilityRole = 'button';

  return (
    <Pressable
      style={[
        buttonStyles.container,
        styles.container,
        style,
      ]}
      onPress={isDisabled ? undefined : onPress}
      onPressIn={() => !isDisabled && setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={isDisabled}
      accessible={true}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      testID={testID}>
      
      {loading && (
        <ActivityIndicator
          size="small"
          color={styles.text.color}
          style={buttonStyles.spinner}
        />
      )}
      
      <Text 
        style={[
          buttonStyles.text,
          styles.text,
          buttonStyles.loadingOpacity,
          loading && buttonStyles.loading,
        ]}
        allowFontScaling={true} // Support 200% text scaling
        maxFontSizeMultiplier={2.0}>
        {children}
      </Text>
    </Pressable>
  );
};

const buttonStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loading: {
    opacity: 0.7,
  },
  loadingOpacity: {
    opacity: 1,
  },
  spinner: {
    marginRight: 8,
  },
  text: {
    textAlign: 'center',
  },
});