import { useEffect } from 'react';
import { Stack, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../lib/theme';
import { QueryProvider } from '../lib/query';
import { useAuth } from '../store/auth';
import ToastHost from '../components/ui/Toast';
import Splash from '../components/ui/Splash';
import '../global.css';

export default function RootLayout() {
  const { booting, onboarded, user, hydrate } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Navigator (Stack) must always mount on first render — returning null first
  // triggers "navigate before mounting Root Layout" in Expo Router.
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryProvider>
            <StatusBar style="light" />
            {booting ? (
              <Splash />
            ) : (
              <>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#0F172A' },
                  }}
                />
                {!onboarded ? (
                  <Redirect href="/onboarding" />
                ) : !user ? (
                  <Redirect href="/login" />
                ) : null}
              </>
            )}
            <ToastHost />
          </QueryProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
