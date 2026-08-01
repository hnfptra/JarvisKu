import { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Screen from '../components/ui/Screen';
import Text from '../components/ui/Text';
import Button from '../components/ui/Button';
import { useAuth } from '../store/auth';

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(name.trim(), email.trim(), password);
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

        <View className="gap-3">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nama"
            placeholderTextColor="#64748B"
            className="h-12 bg-card border border-border rounded-2xl px-4 text-text"
          />
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
            placeholder="Password (min. 8)"
            placeholderTextColor="#64748B"
            secureTextEntry
            className="h-12 bg-card border border-border rounded-2xl px-4 text-text"
          />
          {error ? <Text color="danger" variant="caption">{error}</Text> : null}
        </View>

        <View className="mt-6 gap-3">
          <Button title="Daftar" onPress={submit} loading={loading} />
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
