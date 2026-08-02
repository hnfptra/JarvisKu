import { useEffect, useRef } from 'react';
import { Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast, ToastType } from '../../store/toast';
import { colors } from '../../lib/theme';

const TONES: Record<ToastType, { bg: string; fg: string }> = {
  success: { bg: '#15803D', fg: '#fff' },
  error: { bg: '#B91C1C', fg: '#fff' },
  info: { bg: colors.card, fg: colors.text },
};

/** Renders the global toast. Mount once in the root layout. */
export default function ToastHost() {
  const insets = useSafeAreaInsets();
  const { visible, message, type, hide } = useToast();
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 180 });
      opacity.value = withTiming(1, { duration: 180 });
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => hide(), 2600);
    } else {
      translateY.value = withTiming(-120, { duration: 180 });
      opacity.value = withTiming(0, { duration: 150 });
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [visible, translateY, opacity, hide]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const tone = TONES[type];

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: insets.top + 8,
          left: 16,
          right: 16,
          borderRadius: 16,
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: tone.bg,
          zIndex: 1000,
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        },
        style,
      ]}
    >
      <Text style={{ color: tone.fg, fontSize: 14, fontWeight: '600' }}>{message}</Text>
    </Animated.View>
  );
}
