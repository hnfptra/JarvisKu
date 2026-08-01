import { useState } from 'react';
import { View, Pressable, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Screen from '../components/ui/Screen';
import Text from '../components/ui/Text';
import Button from '../components/ui/Button';
import Icon, { PlatformIcon } from '../components/ui/Icon';
import { socialApi } from '../lib/api/endpoints';
import { colors } from '../lib/theme';
import type { SocialPlatform } from '../lib/types';

const PLATFORMS: SocialPlatform[] = ['instagram', 'whatsapp', 'telegram', 'discord', 'messenger'];
const LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  whatsapp: 'WhatsApp Business',
  telegram: 'Telegram',
  discord: 'Discord',
  messenger: 'Messenger',
};

export default function Connect() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [platform, setPlatform] = useState<SocialPlatform | null>(null);
  const [username, setUsername] = useState('');

  const connect = useMutation({
    mutationFn: () => socialApi.connect({ platform: platform!, username: username.trim() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
    },
    onError: (e) => Alert.alert('Gagal terhubung', e instanceof Error ? e.message : 'Coba lagi'),
  });

  return (
    <Screen style={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row items-center mb-5">
        <Pressable className="mr-3 p-1" onPress={() => router.back()}>
          <Icon name="chevron" size={22} color={colors.text} />
        </Pressable>
        <Text variant="subtitle">Hubungkan Akun</Text>
      </View>

      <View className="flex-row flex-wrap gap-3 mb-6">
        {PLATFORMS.map((p) => (
          <Pressable
            key={p}
            onPress={() => setPlatform(p)}
            className={`w-[48%] h-14 rounded-2xl border flex-row items-center justify-center gap-2 ${
              platform === p ? 'bg-primary border-primary' : 'bg-card border-border'
            }`}
          >
            <PlatformIcon platform={p} size={20} color={platform === p ? '#fff' : colors.textSecondary} />
            <Text variant="body" className={platform === p ? 'text-white' : 'text-text-secondary'}>{LABELS[p]}</Text>
          </Pressable>
        ))}
      </View>

      <Text variant="caption" color="secondary" className="mb-2">Nama pengguna / handle</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="@username"
        placeholderTextColor="#64748B"
        className="h-12 bg-card border border-border rounded-2xl px-4 text-text mb-6"
      />

      <Button
        title={connect.isPending ? 'Menghubungkan…' : 'Hubungkan'}
        disabled={!platform || !username.trim()}
        onPress={() => connect.mutate()}
        loading={connect.isPending}
      />

      <Text variant="caption" color="secondary" className="text-center mt-4">
        MVP: koneksi disimulasikan (adapter mock). Integrasi asli menyusul.
      </Text>
    </Screen>
  );
}
