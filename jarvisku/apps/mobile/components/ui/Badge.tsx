import { View, Text } from 'react-native';
import { colors } from '../../lib/theme';

type Tone = 'active' | 'pending' | 'expired' | 'unread' | 'neutral';

const TONES: Record<Tone, { bg: string; fg: string; dot?: string }> = {
  active: { bg: 'rgba(34,197,94,0.15)', fg: colors.success, dot: colors.success },
  pending: { bg: 'rgba(245,158,11,0.15)', fg: colors.warning, dot: colors.warning },
  expired: { bg: 'rgba(239,68,68,0.15)', fg: colors.danger, dot: colors.danger },
  unread: { bg: colors.primary, fg: '#fff' },
  neutral: { bg: 'rgba(148,163,184,0.15)', fg: colors.textSecondary },
};

type Props = {
  label: string;
  tone?: Tone;
  count?: number;
};

/** Status badge: active/pending/expired/unread/neutral. count renders a numeric pill. */
export default function Badge({ label, tone = 'neutral', count }: Props) {
  const t = TONES[tone];
  if (count !== undefined) {
    return (
      <View
        style={{
          minWidth: 20,
          height: 20,
          borderRadius: 10,
          paddingHorizontal: 6,
          backgroundColor: t.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: t.fg, fontSize: 11, fontWeight: '700' }}>{count > 99 ? '99+' : count}</Text>
      </View>
    );
  }
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: t.bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
      }}
    >
      {t.dot ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.dot, marginRight: 6 }} /> : null}
      <Text style={{ color: t.fg, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}
