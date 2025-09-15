import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle, TextStyle, TouchableOpacityProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ButtonVariant = 'primary' | 'secondary' | 'text';

interface CustomButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  leftIcon,
  style,
  textStyle,
  ...props
}) => {
  const getButtonStyle = (): ViewStyle => {
    if (variant === 'primary') {
      return disabled ? styles.buttonPrimaryDisabled : styles.buttonPrimary;
    } else if (variant === 'secondary') {
      return styles.buttonSecondary;
    } else {
      return styles.buttonText;
    }
  };

  const getTextStyle = (): TextStyle => {
    if (variant === 'primary') {
      return styles.textPrimary;
    } else {
      return styles.textSecondary;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      <View style={styles.buttonContent}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={16}
            color={variant === 'primary' ? 'white' : '#4A90E2'}
            style={styles.leftIcon}
          />
        )}
        <Text style={[getTextStyle(), textStyle]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonPrimary: {
    backgroundColor: '#4A90E2',
  },
  buttonPrimaryDisabled: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  buttonText: {
    backgroundColor: 'transparent',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textPrimary: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  textSecondary: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
  leftIcon: {
    marginRight: 8,
  },
});

export default CustomButton;