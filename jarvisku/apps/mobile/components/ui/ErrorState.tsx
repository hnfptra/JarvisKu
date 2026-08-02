import { View, Pressable } from 'react-native';
import Icon from './Icon';
import Text from './Text';
import { colors } from '../../lib/theme';

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

/** Full-width error panel with retry button. */
export default function ErrorState({
  title = 'Terjadi kendala',
  message = 'Tidak bisa memuat data. Periksa koneksi lalu coba lagi.',
  onRetry,
}: Props) {
  return (
    <View className="items-center justify-center py-12 px-8">
      <View className="w-16 h-16 rounded-full bg-danger/10 items-center justify-center mb-4">
        <Icon name="x" size={28} color={colors.danger} />
      </View>
      <Text variant="subtitle" className="text-center">{title}</Text>
      <Text variant="caption" color="secondary" className="text-center mt-1">{message}</Text>
      {onRetry ? (
        <Pressable
          className="mt-5 bg-primary rounded-2xl px-6 py-3"
          onPress={onRetry}
        >
          <Text className="text-white font-semibold">Coba Lagi</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
