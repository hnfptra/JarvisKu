import { useQuery } from '@tanstack/react-query';
import { View, FlatList, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Screen from '../../components/ui/Screen';
import Text from '../../components/ui/Text';
import Icon from '../../components/ui/Icon';
import { SkeletonList } from '../../components/ui/Skeleton';
import { assistantApi } from '../../lib/api/endpoints';
import { colors } from '../../lib/theme';

export default function ConversationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading } = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => assistantApi.conversation(id),
  });

  const messages = data?.conversation.messages ?? [];

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <View className="flex-row items-center px-5 pt-2 pb-3" style={{ paddingTop: insets.top + 8 }}>
        <Pressable className="mr-3 p-1" onPress={() => router.back()}>
          <Icon name="chevron" size={22} color={colors.text} />
        </Pressable>
        <Text variant="subtitle" numberOfLines={1} className="flex-1">{data?.conversation.title ?? 'Percakapan'}</Text>
      </View>

      {isLoading ? (
        <View className="px-5"><SkeletonList rows={8} height={48} /></View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(_, i) => String(i)}
          className="px-5"
          contentContainerStyle={{ gap: 10, paddingBottom: insets.bottom + 24 }}
          ListHeaderComponent={
            data?.conversation.summary ? (
              <View className="bg-accent/10 border border-accent/30 rounded-2xl p-3 mb-2">
                <Text color="accent" variant="caption">Ringkasan</Text>
                <Text variant="caption" color="secondary">{data.conversation.summary}</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                item.role === 'user' ? 'self-end bg-primary' : 'self-start bg-card border border-border'
              }`}
            >
              <Text variant="body" className={item.role === 'user' ? 'text-white' : ''}>{item.content}</Text>
            </View>
          )}
        />
      )}
    </Screen>
  );
}
