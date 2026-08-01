import { ReactNode } from 'react';
import { View, ScrollView, RefreshControl, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  style?: ViewStyle;
};

/** Standard app screen background + safe area + optional scroll/refresh. */
export default function Screen({ children, scroll, refreshing, onRefresh, padded = true, style }: Props) {
  const insets = useSafeAreaInsets();
  const pad = padded ? { paddingHorizontal: 20, paddingBottom: insets.bottom + 16 } : {};
  const base = { flex: 1, backgroundColor: '#0F172A' } as const;

  if (!scroll) {
    return <View style={[base, pad, style]}>{children}</View>;
  }

  return (
    <ScrollView
      style={base}
      contentContainerStyle={[pad, style]}
      refreshControl={
        refreshing !== undefined ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#94A3B8" />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}
