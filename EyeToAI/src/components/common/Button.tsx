// src/components/common/Button.tsx
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacityProps 
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  onPress, 
  title, 
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
  ...props 
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity 
      style={[
        styles.button,
        variant === 'secondary' ? styles.secondaryButton : styles.primaryButton,
        isDisabled && styles.disabledButton,
        style
      ]} 
      onPress={onPress}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={variant === 'secondary' ? '#000000' : '#FFFFFF'} 
        />
      ) : (
        <Text 
          style={[
            styles.text,
            variant === 'secondary' ? styles.secondaryText : styles.primaryText,
            isDisabled && styles.disabledText
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#F2F2F2',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#000000',
  },
  disabledText: {
    color: '#666666',
  },
});
