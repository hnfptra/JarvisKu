import { View, Image, ImageSourcePropType, Text } from 'react-native';
import Icon from './Icon';
import { colors } from '../../lib/theme';

type Props = {
  name?: string;
  source?: ImageSourcePropType;
  size?: number;
};

const PALETTE = ['#4F46E5', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444'];

/** Avatar: image or initials on colored circle. Fallback to user icon. */
export default function Avatar({ name, source, size = 40 }: Props) {
  const initials = (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  if (source) {
    return (
      <Image
        source={source}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.card }}
      />
    );
  }

  const bg = name ? PALETTE[Math.abs(hash(name)) % PALETTE.length] : colors.card;
  const fs = Math.round(size * 0.38);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {initials ? (
        <Text style={{ color: '#fff', fontSize: fs, fontWeight: '700' }}>{initials}</Text>
      ) : (
        <Icon name="user" size={size * 0.5} color="#fff" />
      )}
    </View>
  );
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
