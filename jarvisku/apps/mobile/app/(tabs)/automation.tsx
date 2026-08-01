import { useState } from 'react';
import { View, Pressable, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import { autoreplyApi } from '../../lib/api/endpoints';
import type { AutoReplyTemplate } from '../../lib/types';
import { colors } from '../../lib/theme';

export default function Automation() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['autoreply'], queryFn: () => autoreplyApi.config() });

  const enableMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      autoreplyApi.enable({
        enabled,
        workingHours: data?.config.workingHours,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['autoreply'] }),
  });

  const templates: AutoReplyTemplate[] = data?.templates ?? [];
  const config = data?.config;

  return (
    <Screen scroll>
      <Text variant="subtitle" className="mb-4">Balas Otomatis</Text>

      {isLoading ? (
        <SkeletonList rows={3} height={64} />
      ) : (
        <View className="gap-4">
          {/* AFK toggle */}
          <Card className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text variant="subtitle">Mode AFK</Text>
              <Text variant="caption" color="secondary">Balas otomatis saat kamu sibuk.</Text>
            </View>
            <Switch
              value={config?.enabled ?? false}
              onValueChange={(v) => enableMutation.mutate(v)}
              trackColor={{ false: '#334155', true: '#4F46E5' }}
              thumbColor="#fff"
            />
          </Card>

          {/* Working hours */}
          <WorkingHoursCard config={config} onSave={(wh) => enableMutation.mutate(config?.enabled ?? false)} />

          {/* Templates */}
          <View className="flex-row items-center justify-between mt-2">
            <Text variant="subtitle">Template Balasan</Text>
            <Pressable className="bg-primary rounded-2xl px-3 py-2" onPress={() => router.push('/template-new')}>
              <Text color="accent" variant="caption">+ Baru</Text>
            </Pressable>
          </View>

          {templates.length === 0 ? (
            <EmptyState icon="⚡" title="Belum ada template" subtitle="Tambahkan template balasan otomatis." />
          ) : (
            templates.map((t) => (
              <Card key={t._id} className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text variant="body">{t.name}</Text>
                  <Text variant="caption" color="secondary" numberOfLines={1}>{t.reply}</Text>
                  <View className="flex-row mt-2 gap-2">
                    <View className="bg-border/40 rounded-full px-2 py-0.5">
                      <Text variant="caption">{t.trigger}</Text>
                    </View>
                    {t.trigger === 'keyword' ? (
                      <Text variant="caption" color="secondary" numberOfLines={1}>
                        {t.keywords.join(', ')}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <Icon name="chevron" size={18} color={colors.textSecondary} />
              </Card>
            ))
          )}
        </View>
      )}
    </Screen>
  );
}

function WorkingHoursCard({ config, onSave }: { config: { enabled: boolean; workingHours: { enabled?: boolean; start: string; end: string } } | undefined; onSave: (wh: unknown) => void }) {
  const wh = config?.workingHours ?? { enabled: false, start: '09:00', end: '18:00' };
  const [enabled, setEnabled] = useState(wh.enabled ?? false);
  const [start, setStart] = useState(wh.start);
  const [end, setEnd] = useState(wh.end);

  return (
    <Card>
      <View className="flex-row items-center justify-between mb-3">
        <Text variant="body">Jam Kerja</Text>
        <Switch value={enabled} onValueChange={setEnabled} trackColor={{ false: '#334155', true: '#4F46E5' }} thumbColor="#fff" />
      </View>
      {enabled ? (
        <View className="flex-row items-center gap-3">
          <TextInput
            value={start}
            onChangeText={setStart}
            placeholder="09:00"
            placeholderTextColor="#64748B"
            className="flex-1 h-11 bg-bg border border-border rounded-xl px-3 text-text"
          />
          <Text variant="caption" color="secondary">s/d</Text>
          <TextInput
            value={end}
            onChangeText={setEnd}
            placeholder="18:00"
            placeholderTextColor="#64748B"
            className="flex-1 h-11 bg-bg border border-border rounded-xl px-3 text-text"
          />
          <Button title="Simpan" variant="ghost" onPress={() => onSave({ enabled: true, start, end })} />
        </View>
      ) : null}
    </Card>
  );
}
