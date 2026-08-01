import { View } from 'react-native';
import Text from './Text';

/** Friendly empty state used across lists (history, inbox, logs, templates). */
export default function EmptyState({ icon, title, subtitle }: { icon?: string; title: string; subtitle?: string }) {
  return (
    <View className="items-center justify-center py-12 px-8">
      <View className="w-16 h-16 rounded-full bg-card items-center justify-center mb-4">
        <Text className="text-3xl">{icon ?? '🫧'}</Text>
      </View>
      <Text variant="subtitle" className="text-center">{title}</Text>
      {subtitle ? <Text variant="caption" className="text-center mt-1">{subtitle}</Text> : null}
    </View>
  );
}
