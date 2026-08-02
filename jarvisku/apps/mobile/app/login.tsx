import { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { Link, useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import Screen from '../components/ui/Screen';
import Text from '../components/ui/Text';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { FormInput } from '../components/ui/Input';
import { useAuth } from '../store/auth';
import { colors } from '../lib/theme';

type FormValues = { email: string; password: string };

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bioLoading, setBioLoading] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);

  const { control, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: { email: '', password: '' },
  });

  useState(() => {
    LocalAuthentication.hasHardwareAsync().then((ok) => setBioAvailable(ok));
  });

  async function submit(v: FormValues) {
    setLoading(true);
    setError('');
    try {
      await login(v.email.trim(), v.password);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  }

  async function biometricLogin() {
    setBioLoading(true);
    try {
      const ok = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Buka JarvisKu',
      });
      if (ok.success) {
        // MVP: biometric hanya verifikasi device; token di SecureStore tetap berlaku.
        router.replace('/(tabs)');
      }
    } finally {
      setBioLoading(false);
    }
  }

  const invalid = !formState.isValid;

  return (
    <Screen>
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-4">
            <Icon name="wave" size={32} color="#fff" />
          </View>
          <Text variant="title">Selamat datang di JarvisKu</Text>
          <Text variant="caption" className="mt-1">Login untuk lanjut</Text>
        </View>

        <View className="gap-4">
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
            placeholder="Password"
            secureTextEntry
            rules={{ required: 'Password wajib diisi' }}
          />
          {error ? <Text color="danger" variant="caption">{error}</Text> : null}
        </View>

        <View className="mt-6 gap-3">
          <Button
            title="Login"
            onPress={handleSubmit(submit)}
            loading={loading}
            disabled={invalid || loading}
          />
          {bioAvailable ? (
            <Button
              title="Masuk dengan Biometrik"
              variant="ghost"
              icon={<Icon name="fingerprint" size={18} color={colors.textSecondary} />}
              onPress={biometricLogin}
              loading={bioLoading}
            />
          ) : null}
          <Link href="/register" asChild>
            <TouchableOpacity className="items-center py-2">
              <Text variant="body" color="secondary">
                Belum punya akun? <Text color="primary">Daftar</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </Screen>
  );
}
