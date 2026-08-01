import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { authApi } from '../../lib/api/endpoints';
import { useAuth } from '../../store/auth';
import { colors } from '../../lib/theme';

export default function Account() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, logout } = useAuth();
  const { data } = useQuery({ queryKey: ['profile'], queryFn: authApi.getProfile });

  const prefs = data?.preferences ?? {};

  const toggleMutation = useMutation({
    mutationFn: (patch: Record<string, unknown>) => authApi.updateProfile(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });

  return (
    <Screen scroll>
      {/* Profile header */}
      <Card className="items-center py-6 mb-4">
        <View className="w-16 h-16 rounded-full bg-primary/25 items-center justify-center mb-3">
          <Icon name="user" size={28} color={colors.primary} />
        </View>
        <Text variant="subtitle">{user?.name}</Text>
        <Text variant="caption" color="secondary">{user?.email}</Text>
        <View className="bg-accent/15 rounded-full px-3 py-1 mt-3">
          <Text color="accent" variant="caption">Paket Gratis</Text>
        </View>
      </Card>

      <Text variant="subtitle" className="mb-3">Preferensi</Text>
      <Card className="gap-4">
        <SettingRow
          icon="mic"
          label="Suara"
          value={!!prefs.voiceEnabled}
          onChange={(v) => toggleMutation.mutate({ voiceEnabled: v })}
        />
        <SettingRow
          icon="bell"
          label="Notifikasi"
          value={!!prefs.notificationsEnabled}
          onChange={(v) => toggleMutation.mutate({ notificationsEnabled: v })}
        />
        <Pressable className="flex-row items-center justify-between" onPress={() => router.push('/premium')}>
          <View className="flex-row items-center">
            <Icon name="crown" size={18} color={colors.warning} />
            <Text variant="body" className="ml-3">JarvisKu Pro</Text>
          </View>
          <Icon name="chevron" size={18} color={colors.textSecondary} />
        </Pressable>
      </Card>

      <Text variant="subtitle" className="mt-6 mb-3">Tentang</Text>
      <Card>
        <Pressable className="py-2">
          <Text variant="body">Biometric login</Text>
          <Text variant="caption" color="secondary">Tersedia di perangkat yang mendukung</Text>
        </Pressable>
        <Pressable className="py-2 border-t border-border/50">
          <Text variant="body">Bantuan</Text>
        </Pressable>
        <Pressable className="py-2 border-t border-border/50">
          <Text variant="body">Kebijakan privasi</Text>
        </Pressable>
      </Card>

      <Button
        title="Logout"
        variant="danger"
        className="mt-6"
        onPress={async () => {
          await logout();
          router.replace('/login');
        }}
      />
    </Screen>
  );
}

function SettingRow({ icon, label, value, onChange }: { icon: string; label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <Icon name={icon} size={18} color={colors.textSecondary} />
        <Text variant="body" className="ml-3">{label}</Text>
      </View>
      <Pressable
        className="w-11 h-6 rounded-full px-0.5 justify-center bg-border"
        style={[{ backgroundColor: value ? '#4F46E5' : '#334155' }]}
        onPress={() => onChange(!value)}
      >
        <View style={[{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignSelf: value ? 'flex-end' : 'flex-start' }]} />
      </Pressable>
    </View>
  );
}
