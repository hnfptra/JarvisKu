import { Tabs } from 'expo-router';
import Icon from '../../components/ui/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Bottom navigation — 5 tabs, dark glass style. */
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#334155',
          borderTopWidth: 0.5,
          paddingTop: 6,
          height: 58 + insets.bottom,
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
        name="social"
        options={{ title: 'Sosial', tabBarIcon: ({ color, size }) => <Icon name="reply" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Akun', tabBarIcon: ({ color, size }) => <Icon name="user" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
