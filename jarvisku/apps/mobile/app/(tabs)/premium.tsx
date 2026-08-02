import { View, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import ErrorState from '../../components/ui/ErrorState';
import { SkeletonList } from '../../components/ui/Skeleton';
import { premiumApi } from '../../lib/api/endpoints';
import { colors } from '../../lib/theme';

export default function Premium() {
  const qc = useQueryClient();
  const { data: plansData, isLoading, isError, refetch } = useQuery({ queryKey: ['plans'], queryFn: () => premiumApi.plans() });
  const { data: subData } = useQuery({ queryKey: ['subscription'], queryFn: () => premiumApi.subscription() });

  const subscribe = useMutation({
    mutationFn: (plan: 'free' | 'pro') => premiumApi.subscribe(plan),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      Alert.alert('Berhasil', 'Paket berhasil diubah.');
    },
  });

  const plans = plansData?.plans ?? [];
  const current = subData?.subscription?.plan ?? 'free';

  return (
    <Screen>
      <View className="flex-row items-center justify-between mb-5">
        <Text variant="subtitle">JarvisKu Pro</Text>
        <Text variant="caption" color="secondary">Upgrade asisten</Text>
      </View>

      {isLoading ? (
        <SkeletonList rows={3} height={120} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : plans.length === 0 ? (
        <EmptyState icon="👑" title="Paket belum tersedia" />
      ) : (
        <View className="gap-4">
          {plans.map((p) => {
            const active = p.id === current;
            const pro = p.id === 'pro';
            return (
              <Card
                key={p.id}
                className={pro ? 'border-primary' : ''}
                style={pro ? { borderColor: colors.primary } : undefined}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    {pro ? <Icon name="crown" size={18} color={colors.warning} /> : null}
                    <Text variant="subtitle">{p.name}</Text>
                    {pro && !active ? <Badge label="Populer" tone="active" /> : null}
                  </View>
                  {active ? <Badge label="Aktif" tone="active" /> : null}
                </View>
                <View className="flex-row items-end mb-3">
                  <Text variant="title">
                    {p.price === 0 ? 'Gratis' : `Rp ${p.price.toLocaleString('id-ID')}`}
                  </Text>
                  {p.price > 0 ? <Text variant="caption" color="secondary" className="mb-1 ml-1">/bulan</Text> : null}
                </View>
                {p.features.map((f) => (
                  <View key={f} className="flex-row items-center py-1">
                    <Icon name="check" size={14} color={colors.success} />
                    <Text variant="caption" className="ml-2">{f}</Text>
                  </View>
                ))}
                {!active ? (
                  <Button
                    title={p.id === 'pro' ? 'Upgrade' : 'Turun ke Gratis'}
                    variant={p.id === 'pro' ? 'primary' : 'ghost'}
                    className="mt-4"
                    onPress={() => subscribe.mutate(p.id as 'free' | 'pro')}
                    loading={subscribe.isPending}
                  />
                ) : null}
              </Card>
            );
          })}

          <Text variant="caption" color="secondary" className="text-center mt-2">
            MVP: pembayaran disimulasikan, tidak ada tagihan nyata.
          </Text>
        </View>
      )}
    </Screen>
  );
}
