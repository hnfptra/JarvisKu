import { useQuery } from '@tanstack/react-query';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Text';
import Icon, { PlatformIcon } from '../../components/ui/Icon';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import { socialApi } from '../../lib/api/endpoints';
import { colors } from '../../lib/theme';
import type { SocialPlatform } from '../../lib/types';

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  discord: 'Discord',
  messenger: 'Messenger',
};

export default function Social() {
  const router = useRouter();
  const { data, isLoading } = useQuery({ queryKey: ['social'], queryFn: () => socialApi.accounts() });
  const messagesQuery = useQuery({ queryKey: ['inbox'], queryFn: () => socialApi.messages() });

  const accounts = data?.accounts ?? [];

  return (
    <Screen scroll>
      <View className="flex-row items-center justify-between mb-4">
        <Text variant="subtitle">Sosial Media</Text>
        <Pressable className="bg-primary rounded-2xl px-3 py-2" onPress={() => router.push('/connect')}>
          <Text className="text-white" variant="caption">+ Hubungkan</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <SkeletonList rows={3} height={64} />
      ) : accounts.length === 0 ? (
        <EmptyState icon="🔗" title="Belum ada akun terhubung" subtitle="Hubungkan WhatsApp, Instagram, dan lainnya." />
      ) : (
        <View className="gap-3">
          {accounts.map((a) => (
            <Card key={a._id} className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-bg items-center justify-center mr-3">
                <PlatformIcon platform={a.platform} size={20} color={colors.accent} />
              </View>
              <View className="flex-1">
                <Text variant="body">{PLATFORM_LABELS[a.platform]}</Text>
                <Text variant="caption" color="secondary">@{a.username}</Text>
              </View>
              <View className={`h-2.5 w-2.5 rounded-full ${a.status === 'active' ? 'bg-success' : 'bg-warning'}`} />
            </Card>
          ))}
        </View>
      )}

      <Text variant="subtitle" className="mt-6 mb-3">Pesan Masuk</Text>
      {messagesQuery.isLoading ? (
        <SkeletonList rows={3} height={56} />
      ) : (messagesQuery.data?.messages ?? []).length === 0 ? (
        <EmptyState icon="📥" title="Belum ada pesan" subtitle="Pesan masuk akan muncul di sini." />
      ) : (
        <View className="gap-3">
          {(messagesQuery.data?.messages ?? []).map((m) => (
            <Card key={m._id} className="flex-row items-start">
              <PlatformIcon platform={m.platform} size={16} color={colors.textSecondary} />
              <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between">
                  <Text variant="body" className="flex-1">{m.from}</Text>
                  <Text variant="caption" color="secondary">{shortTime(m.createdAt)}</Text>
                </View>
                <Text variant="caption" color="secondary" numberOfLines={2}>{m.text}</Text>
                {m.autoReplied ? (
                  <View className="bg-success/10 rounded-lg px-2 py-1 mt-1.5">
                    <Text color="success" variant="caption">⚡ Dibalas otomatis</Text>
                  </View>
                ) : null}
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

function shortTime(iso: string) {
  const d = new Date(iso);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}
