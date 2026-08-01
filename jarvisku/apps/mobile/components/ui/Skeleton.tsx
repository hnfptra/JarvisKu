import { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

/** Pulse skeleton placeholder for loading states. */
export function Skeleton({ width = '100%', height = 16, radius = 8, style }: { width?: number | string; height?: number; radius?: number; style?: ViewStyle }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  const w = typeof width === 'number' ? width : (width as `${number}%`);

  return (
    <Animated.View
      style={[{ width: w, height, borderRadius: radius, backgroundColor: '#334155', opacity }, style]}
    />
  );
}

export function SkeletonList({ rows = 4, height = 56 }: { rows?: number; height?: number }) {
  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={height} radius={16} />
      ))}
    </View>
  );
}
