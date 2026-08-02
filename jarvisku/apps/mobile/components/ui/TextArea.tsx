import { forwardRef } from 'react';
import { TextInput, TextInputProps, View, Text as RNText } from 'react-native';
import { Controller, FieldValues, UseControllerProps } from 'react-hook-form';
import { colors } from '../../lib/theme';

export const TextArea = forwardRef<TextInput, TextInputProps & { label?: string; error?: string }>(
  function TextArea({ label, error, style, ...rest }, ref) {
    return (
      <View>
        {label ? (
          <RNText style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 6 }}>{label}</RNText>
        ) : null}
        <TextInput
          ref={ref}
          multiline
          placeholderTextColor="#64748B"
          className="bg-card border rounded-2xl px-4 py-3 text-text"
          style={[{ borderColor: error ? colors.danger : colors.border, minHeight: 96, textAlignVertical: 'top' }, style]}
          {...rest}
        />
        {error ? (
          <RNText style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>{error}</RNText>
        ) : null}
      </View>
    );
  }
);

export function FormTextArea<T extends FieldValues>({
  control,
  name,
  rules,
  label,
  error,
  ...rest
}: UseControllerProps<T> & Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'> & { label?: string; error?: string }) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <TextArea
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
