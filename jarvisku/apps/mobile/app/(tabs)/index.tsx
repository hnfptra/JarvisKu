import { useQuery } from '@tanstack/react-query';
import { View, Pressable } from 'react-native';
import { Link } from 'expo-router';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Text';
import Icon from '../../components/ui/Icon';
import { SkeletonList } from '../../components/ui/Skeleton';
import { dashboardApi } from '../../lib/api/endpoints';
import { useAuth } from '../../store/auth';
import { colors } from '../../lib/theme';

const QUICK_ACTIONS = [
  { href: '/assistant', icon: 'mic', label: 'Bicara', tint: colors.primary },
  { href: '/automation', icon: 'zap', label: 'Otomatis', tint: colors.accent },
  { href: '/social', icon: 'reply', label: 'Pesan', tint: colors.success },
  { href: '/account', icon: 'user', label: 'Akun', tint: colors.warning },
] as const;

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get(),
  });

  return (
    <Screen scroll refreshing={isRefetching} onRefresh={refetch}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6 mt-2">
        <View>
          <Text variant="caption" color="secondary">Halo,</Text>
          <Text variant="title">{user?.name ?? 'JarvisKu'}</Text>
        </View>
        <View className="flex-row items-center gap-2 bg-card rounded-2xl px-3 py-2 border border-border">
          <Icon name="crown" size={16} color={colors.warning} />
          <Text variant="caption">{data?.subscription.plan === 'pro' ? 'Pro' : 'Gratis'}</Text>
        </View>
      </View>

      {/* Quick actions */}
      <View className="flex-row gap-3 mb-6">
        {QUICK_ACTIONS.map((q) => (
          <Link key={q.label} href={q.href} asChild>
            <Pressable className="flex-1 bg-card rounded-3xl border border-border items-center py-4">
              <Icon name={q.icon} size={24} color={q.tint} />
              <Text variant="caption" className="mt-2">{q.label}</Text>
            </Pressable>
          </Link>
        ))}
      </View>

      {isLoading ? (
        <SkeletonList rows={4} height={72} />
      ) : (
        <View className="gap-4">
          {/* Voice assistant CTA */}
          <Link href="/assistant" asChild>
            <Pressable className="bg-primary/20 border border-primary/40 rounded-3xl p-4 flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-primary items-center justify-center mr-3">
                <Icon name="mic" size={22} color="#fff" />
              </View>
              <View className="flex-1">
                <Text variant="subtitle">Tanya JarvisKu</Text>
                <Text variant="caption" color="secondary">Tekan dan bicara — dijawab seketika.</Text>
              </View>
            </Pressable>
          </Link>

          {/* Automation status */}
          <Card>
            <View className="flex-row items-center justify-between mb-2">
              <Text variant="subtitle">Balas Otomatis</Text>
              <View className={`h-2.5 w-2.5 rounded-full ${data?.automation.enabled ? 'bg-success' : 'bg-border'}`} />
            </View>
            <Text variant="caption" color="secondary">
              {data?.automation.enabled
                ? `Aktif · ${data.automation.templateCount} template`
                : 'Nonaktif — aktifkan di tab Otomatis'}
            </Text>
          </Card>

          {/* Connected social */}
          <Card>
            <View className="flex-row items-center justify-between mb-2">
              <Text variant="subtitle">Sosial Media</Text>
              <Link href="/social" asChild>
                <Pressable><Text color="accent" variant="caption">Kelola</Text></Pressable>
              </Link>
            </View>
            <View className="flex-row gap-2">
              {data?.social.accounts.length ? (
                data.social.accounts.map((a) => (
                  <View key={a.platform} className="bg-card border border-border rounded-xl px-3 py-1.5 flex-row items-center gap-1.5">
                    <Icon name={a.platform} size={14} color={colors.textSecondary} />
                    <Text variant="caption">{a.platform}</Text>
                  </View>
                ))
              ) : (
                <Text variant="caption" color="secondary">Belum ada akun terhubung.</Text>
              )}
            </View>
          </Card>

          {/* Recent activity */}
          <Card>
            <Text variant="subtitle" className="mb-3">Aktivitas Terbaru</Text>
            {!data?.recentActivity.length ? (
              <Text variant="caption" color="secondary">Belum ada aktivitas. Mulai chat dengan asisten!</Text>
            ) : (
              data.recentActivity.map((act) => (
                <View key={`${act.kind}-${act.id}`} className="flex-row items-center py-2 border-b border-border/50 last:border-0">
                  <Icon name={act.kind === 'chat' ? 'chat' : 'reply'} size={16} color={colors.textSecondary} />
                  <Text variant="body" className="ml-3 flex-1" numberOfLines={1}>{act.title}</Text>
                  <Text variant="caption" color="secondary">{relativeTime(act.at)}</Text>
                </View>
              ))
            )}
          </Card>
        </View>
      )}
    </Screen>
  );
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j`;
  const days = Math.floor(hours / 24);
  return `${days}h`;
}
