import { useEffect } from 'react';
import { Stack, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../lib/theme';
import { QueryProvider } from '../lib/query';
import { useAuth } from '../store/auth';
import '../global.css';

export default function RootLayout() {
  const { booting, onboarded, user, hydrate } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (booting) return null; // splash shows while hydrating

  if (!onboarded) return <Redirect href="/onboarding" />;
  if (!user) return <Redirect href="/login" />;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0F172A' },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
