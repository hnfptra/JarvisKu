import { View, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Screen from '../components/ui/Screen';
import Text from '../components/ui/Text';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { FormInput } from '../components/ui/Input';
import { FormTextArea } from '../components/ui/TextArea';
import { autoreplyApi } from '../lib/api/endpoints';
import { useToast } from '../store/toast';
import { colors } from '../lib/theme';

type FormValues = {
  name: string;
  reply: string;
  trigger: 'keyword' | 'match_all';
  keywords: string;
  enabled: boolean;
};

export default function TemplateNew() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const toast = useToast();

  const { control, handleSubmit, watch, formState } = useForm<FormValues>({
    defaultValues: { name: '', reply: '', trigger: 'match_all', keywords: '', enabled: true },
  });
  const trigger = watch('trigger');

  const create = useMutation({
    mutationFn: (v: FormValues) =>
      autoreplyApi.createTemplate({
        name: v.name,
        reply: v.reply,
        trigger: v.trigger,
        keywords: v.trigger === 'keyword' ? v.keywords.split(',').map((k) => k.trim()).filter(Boolean) : [],
        enabled: v.enabled,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['autoreply'] });
      toast.show('Template tersimpan', 'success');
      router.back();
    },
    onError: (e) => toast.show(e instanceof Error ? e.message : 'Gagal menyimpan', 'error'),
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
        <FormInput
          control={control}
          name="name"
          label="Nama"
          placeholder="cth: AFK, Info harga"
          rules={{ required: 'Nama wajib diisi', minLength: { value: 2, message: 'Minimal 2 karakter' } }}
        />

        <View>
          <Text variant="caption" color="secondary" className="mb-2">Tipe trigger</Text>
          <Controller
            control={control}
            name="trigger"
            render={({ field }) => (
              <View className="flex-row gap-2">
                {(['match_all', 'keyword'] as const).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => field.onChange(t)}
                    className={`flex-1 h-12 rounded-2xl border items-center justify-center ${
                      field.value === t ? 'bg-primary border-primary' : 'bg-card border-border'
                    }`}
                  >
                    <Text variant="body" className={field.value === t ? 'text-white' : 'text-text-secondary'}>
                      {t === 'match_all' ? 'Semua pesan' : 'Kata kunci'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          />
        </View>

        {trigger === 'keyword' ? (
          <FormInput
            control={control}
            name="keywords"
            label="Kata kunci (pisahkan dengan koma)"
            placeholder="harga, berapa, ready"
            rules={{ required: 'Tulis minimal 1 kata kunci' }}
          />
        ) : null}

        <FormTextArea
          control={control}
          name="reply"
          label="Isi balasan"
          placeholder="Halo! Aku lagi AFK, nanti dibalas ya 🙌"
          rules={{ required: 'Isi balasan wajib diisi', minLength: { value: 2, message: 'Terlalu pendek' } }}
        />

        <Controller
          control={control}
          name="enabled"
          render={({ field }) => (
            <View className="flex-row items-center justify-between">
              <Text variant="body">Aktifkan sekarang</Text>
              <Switch value={field.value} onValueChange={field.onChange} trackColor={{ false: '#334155', true: '#4F46E5' }} thumbColor="#fff" />
            </View>
          )}
        />

        <Button
          title={create.isPending ? 'Menyimpan…' : 'Simpan Template'}
          onPress={handleSubmit((v) => create.mutate(v))}
          loading={create.isPending}
          disabled={!formState.isValid || create.isPending}
        />
      </View>
    </Screen>
  );
}
