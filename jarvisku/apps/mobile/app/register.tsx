import { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { Link, useRouter } from 'expo-router';
import Screen from '../components/ui/Screen';
import Text from '../components/ui/Text';
import Button from '../components/ui/Button';
import { FormInput } from '../components/ui/Input';
import { useAuth } from '../store/auth';

type FormValues = { name: string; email: string; password: string };

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { control, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: { name: '', email: '', password: '' },
  });

  async function submit(v: FormValues) {
    setLoading(true);
    setError('');
    try {
      await register(v.name.trim(), v.email.trim(), v.password);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Daftar gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View className="flex-1 justify-center px-6">
        <Text variant="title" className="mb-1">Buat akun</Text>
        <Text variant="caption" className="mb-6">Satu langkah lagi, gratis.</Text>

        <View className="gap-4">
          <FormInput
            control={control}
            name="name"
            label="Nama"
            placeholder="Nama kamu"
            rules={{ required: 'Nama wajib diisi', minLength: { value: 2, message: 'Minimal 2 karakter' } }}
          />
          <FormInput
            control={control}
            name="email"
            label="Email"
            placeholder="nama@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            rules={{ required: 'Email wajib diisi', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email tidak valid' } }}
          />
          <FormInput
            control={control}
            name="password"
            label="Password"
            placeholder="Minimal 8 karakter"
            secureTextEntry
            rules={{ required: 'Password wajib diisi', minLength: { value: 8, message: 'Minimal 8 karakter' } }}
          />
          {error ? <Text color="danger" variant="caption">{error}</Text> : null}
        </View>

        <View className="mt-6 gap-3">
          <Button
            title="Daftar"
            onPress={handleSubmit(submit)}
            loading={loading}
            disabled={!formState.isValid || loading}
          />
          <Link href="/login" asChild>
            <TouchableOpacity className="items-center py-2">
              <Text variant="body" color="secondary">
                Sudah punya akun? <Text color="primary">Login</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </Screen>
  );
}
