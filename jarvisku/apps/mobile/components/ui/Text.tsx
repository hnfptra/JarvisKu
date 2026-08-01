import { Text as RNText, TextProps } from 'react-native';

type Props = TextProps & {
  variant?: 'title' | 'subtitle' | 'body' | 'caption';
  color?: 'text' | 'secondary' | 'primary' | 'accent' | 'danger' | 'success';
};

const variantClass = {
  title: 'text-2xl font-bold text-text',
  subtitle: 'text-lg font-semibold text-text',
  body: 'text-base text-text',
  caption: 'text-sm text-text-secondary',
};

const colorClass = {
  text: 'text-text',
  secondary: 'text-text-secondary',
  primary: 'text-primary',
  accent: 'text-accent',
  danger: 'text-danger',
  success: 'text-success',
};

export default function Text({ variant = 'body', color = 'text', className = '', style, ...rest }: Props) {
  return (
    <RNText
      {...rest}
      style={style}
      className={`${variantClass[variant]} ${colorClass[color]} ${className}`}
    />
  );
}
