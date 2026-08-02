import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../components/ui/Icon';
import { colors } from '../../lib/theme';

/** Bottom navigation — 5 tabs, dark glass style, primary active indicator. */
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          paddingTop: 6,
          height: 58 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? 8 : 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="assistant"
        options={{ title: 'Asisten', tabBarIcon: ({ color, size }) => <Icon name="bot" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="automation"
        options={{ title: 'Otomatis', tabBarIcon: ({ color, size }) => <Icon name="zap" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Akun', tabBarIcon: ({ color, size }) => <Icon name="user" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="premium"
        options={{ title: 'Premium', tabBarIcon: ({ color, size }) => <Icon name="crown" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
