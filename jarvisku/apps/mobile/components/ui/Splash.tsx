import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import Icon from './Icon';
import { colors } from '../../lib/theme';

/** Full-screen splash: centered logo, gentle fade-in. Shown while hydrating. */
export default function Splash() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [opacity, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{ alignItems: 'center' }, style]}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 28,
            backgroundColor: 'rgba(79,70,229,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="wave" size={52} color={colors.primary} />
        </View>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 20 }}>
          JarvisKu
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>
          Asisten pribadimu
        </Text>
      </Animated.View>
    </View>
  );
}
