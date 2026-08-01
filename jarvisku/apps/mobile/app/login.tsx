import { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Screen from '../components/ui/Screen';
import Text from '../components/ui/Text';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { useAuth } from '../store/auth';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!email || !password) {
      setError('Isi email dan password dulu ya.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  }

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

        <View className="gap-3">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#64748B"
            keyboardType="email-address"
            autoCapitalize="none"
            className="h-12 bg-card border border-border rounded-2xl px-4 text-text"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#64748B"
            secureTextEntry
            className="h-12 bg-card border border-border rounded-2xl px-4 text-text"
          />
          {error ? <Text color="danger" variant="caption">{error}</Text> : null}
        </View>

        <View className="mt-6 gap-3">
          <Button title="Login" onPress={submit} loading={loading} />
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
