// src/components/common/types.ts
export interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
  }
  
  export interface InputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    error?: string;
  }

  // src/components/auth/types.ts
export interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
}