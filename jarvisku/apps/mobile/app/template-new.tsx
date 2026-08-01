import { useState } from 'react';
import { View, TextInput, Pressable, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Screen from '../components/ui/Screen';
import Text from '../components/ui/Text';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { autoreplyApi } from '../lib/api/endpoints';
import { colors } from '../lib/theme';

export default function TemplateNew() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [reply, setReply] = useState('');
  const [trigger, setTrigger] = useState<'keyword' | 'match_all'>('match_all');
  const [keywords, setKeywords] = useState('');
  const [enabled, setEnabled] = useState(true);

  const create = useMutation({
    mutationFn: () =>
      autoreplyApi.createTemplate({
        name,
        reply,
        trigger,
        keywords: trigger === 'keyword' ? keywords.split(',').map((k) => k.trim()).filter(Boolean) : [],
        enabled,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['autoreply'] });
      router.back();
    },
    onError: (e) => Alert.alert('Gagal', e instanceof Error ? e.message : 'Coba lagi'),
  });

  return (
    <Screen style={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row items-center mb-5">
        <Pressable className="mr-3 p-1" onPress={() => router.back()}>
          <Icon name="chevron" size={22} color={colors.text} />
        </Pressable>
        <Text variant="subtitle">Template Baru</Text>
      </View>

      <View className="gap-4">
        <Field label="Nama">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="cth: AFK, Info harga"
            placeholderTextColor="#64748B"
            className="h-12 bg-card border border-border rounded-2xl px-4 text-text"
          />
        </Field>

        <Field label="Tipe trigger">
          <View className="flex-row gap-2">
            {(['match_all', 'keyword'] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setTrigger(t)}
                className={`flex-1 h-12 rounded-2xl border items-center justify-center ${
                  trigger === t ? 'bg-primary border-primary' : 'bg-card border-border'
                }`}
              >
                <Text variant="body" className={trigger === t ? 'text-white' : 'text-text-secondary'}>
                  {t === 'match_all' ? 'Semua pesan' : 'Kata kunci'}
                </Text>
              </Pressable>
            ))}
          </View>
        </Field>

        {trigger === 'keyword' ? (
          <Field label="Kata kunci (pisahkan dengan koma)">
            <TextInput
              value={keywords}
              onChangeText={setKeywords}
              placeholder="harga, berapa, ready"
              placeholderTextColor="#64748B"
              className="h-12 bg-card border border-border rounded-2xl px-4 text-text"
            />
          </Field>
        ) : null}

        <Field label="Isi balasan">
          <TextInput
            value={reply}
            onChangeText={setReply}
            placeholder="Halo! Aku lagi AFK, nanti dibalas ya 🙌"
            placeholderTextColor="#64748B"
            multiline
            className="min-h-[96px] bg-card border border-border rounded-2xl px-4 py-3 text-text"
            style={{ textAlignVertical: 'top' }}
          />
        </Field>

        <View className="flex-row items-center justify-between">
          <Text variant="body">Aktifkan sekarang</Text>
          <Switch value={enabled} onValueChange={setEnabled} trackColor={{ false: '#334155', true: '#4F46E5' }} thumbColor="#fff" />
        </View>

        <Button
          title={create.isPending ? 'Menyimpan…' : 'Simpan Template'}
          onPress={() => {
            if (!name.trim() || !reply.trim()) {
              Alert.alert('Lengkapi dulu', 'Nama dan isi balasan wajib diisi.');
              return;
            }
            create.mutate();
          }}
          loading={create.isPending}
        />
      </View>
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text variant="caption" color="secondary" className="mb-2">{label}</Text>
      {children}
    </View>
  );
}
