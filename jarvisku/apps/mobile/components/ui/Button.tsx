import { Pressable, ActivityIndicator, PressableProps, ViewStyle, Text } from 'react-native';

type Props = PressableProps & {
  title: string;
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
  loading?: boolean;
  icon?: React.ReactNode;
};

const variantClass = {
  primary: 'bg-primary active:bg-primary/80',
  ghost: 'bg-card active:bg-border',
  danger: 'bg-danger active:bg-danger/80',
  outline: 'border border-border bg-transparent active:bg-card',
};

const variantText = {
  primary: 'text-white',
  ghost: 'text-text',
  danger: 'text-white',
  outline: 'text-text',
};

export default function Button({ title, variant = 'primary', loading, icon, disabled, style, ...rest }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      className={`h-12 rounded-2xl items-center justify-center flex-row gap-2 px-5 ${variantClass[variant]} ${
        isDisabled ? 'opacity-50' : ''
      }`}
      style={style as ViewStyle}
    >
      {icon}
      {loading ? <ActivityIndicator color="#fff" /> : null}
      {!loading ? <Text className={`text-base font-semibold ${variantText[variant]}`}>{title}</Text> : null}
    </Pressable>
  );
}
