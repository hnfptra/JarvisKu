import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { View, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../components/ui/Screen';
import Text from '../components/ui/Text';
import Icon from '../components/ui/Icon';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/Skeleton';
import { assistantApi } from '../lib/api/endpoints';
import { colors } from '../lib/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function History() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => assistantApi.history(),
  });

  const del = useMutation({
    mutationFn: assistantApi.deleteConversation,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['history'] }),
  });

  const conversations = data?.conversations ?? [];

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3" style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center">
          <Pressable className="mr-3 p-1" onPress={() => router.back()}>
            <Icon name="chevron" size={22} color={colors.text} />
          </Pressable>
          <Text variant="subtitle">Riwayat Percakapan</Text>
        </View>
        {conversations.length > 0 ? (
          <Pressable
            onPress={() =>
              Alert.alert('Hapus semua', 'Hapus seluruh riwayat?', [
                { text: 'Batal', style: 'cancel' },
                { text: 'Hapus', style: 'destructive' },
              ])
            }
          >
            <Icon name="trash" size={18} color={colors.danger} />
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <View className="px-5"><SkeletonList rows={6} height={64} /></View>
      ) : conversations.length === 0 ? (
        <EmptyState icon="💬" title="Belum ada percakapan" subtitle="Mulai bicara dengan asisten di tab Asisten." />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c._id}
          className="px-5"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24, gap: 10 }}
          renderItem={({ item }) => (
            <Pressable
              className="bg-card border border-border rounded-2xl p-4 flex-row items-center"
              onPress={() => router.push({ pathname: '/history/[id]', params: { id: item._id } })}
            >
              <View className="flex-1">
                <Text variant="body" numberOfLines={1}>{item.title}</Text>
                <Text variant="caption" color="secondary" className="mt-1">{relative(item.updatedAt)}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                {del.isPending && del.variables === item._id ? (
                  <ActivityIndicator size="small" color={colors.danger} />
                ) : (
                  <Pressable
                    onPress={() =>
                      Alert.alert('Hapus', 'Hapus percakapan ini?', [
                        { text: 'Batal', style: 'cancel' },
                        { text: 'Hapus', style: 'destructive', onPress: () => del.mutate(item._id) },
                      ])
                    }
                  >
                    <Icon name="trash" size={18} color={colors.textSecondary} />
                  </Pressable>
                )}
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

function relative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}
