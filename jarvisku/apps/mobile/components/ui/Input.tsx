import { forwardRef } from 'react';
import { TextInput, TextInputProps, View, Text as RNText } from 'react-native';
import { Controller, FieldValues, UseControllerProps } from 'react-hook-form';
import { colors } from '../../lib/theme';

type BaseInputProps = TextInputProps & {
  label?: string;
  error?: string;
};

/** Standalone text input (not form-bound). */
export const Input = forwardRef<TextInput, BaseInputProps>(function Input(
  { label, error, className = '', style, ...rest },
  ref
) {
  const border = error ? colors.danger : colors.border;
  return (
    <View>
      {label ? (
        <RNText style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 6 }}>{label}</RNText>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor="#64748B"
        className={`h-12 bg-card border rounded-2xl px-4 text-text ${className}`}
        style={[{ borderColor: border }, style]}
        {...rest}
      />
      {error ? (
        <RNText style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>{error}</RNText>
      ) : null}
    </View>
  );
});

type FormInputProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<BaseInputProps, 'value' | 'onChangeText' | 'onBlur'>;

/** Text input wired to React Hook Form via Controller. */
export function FormInput<T extends FieldValues>({ control, name, rules, label, error, ...rest }: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <Input
          label={label}
          value={field.value as string}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={error ?? fieldState.error?.message}
          {...rest}
        />
      )}
    />
  );
}
