import Svg, { Path, Circle } from 'react-native-svg';

/**
 * Minimal icon set drawn inline (react-native-svg).
 * Colors follow the app palette via `color` prop; size in px.
 * Fallback to emoji glyphs for web keeps the bundle light.
 */
const paths: Record<string, string> = {
  home: 'M3 11.5 12 4l9 7.5V21h-6v-6h-6v6H3z',
  mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V22h2v-3.08A7 7 0 0 0 19 12z',
  bot: 'M12 2a2 2 0 0 0-2 2v1H7a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3h-3V4a2 2 0 0 0-2-2zM9 11a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z',
  zap: 'M13 2 3 14h7l-1 8 10-12h-7z',
  user: 'M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z',
  crown: 'M3 7l4 4 5-6 5 6 4-4-2 12H5z',
  send: 'M3 4l18 8-18 8 3-8zM6 12h9',
  chat: 'M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-5 4V6a2 2 0 0 1 1-2z',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7zm5 12a2 2 0 0 0 4 0z',
  chevron: 'M9 6l6 6-6 6',
  x: 'M6 6l12 12M18 6L6 18',
  check: 'M4 12l5 5L20 6',
  plus: 'M12 5v14M5 12h14',
  trash: 'M6 7h12l-1 14H7zM4 4h16M10 4h4',
  clock: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 4v6l4 2',
  reply: 'M3 10c0-3 3-5 8-5h10l-4 4 4 4H11c-3 0-5-1-5-3zM5 16h14',
  instagram: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm0 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2zm5-3.5a1 1 0 1 0 1 1 1 1 0 0 0-1-1z',
  whatsapp: 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.5-6.5c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.5 7.5 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.5a1 1 0 0 0 .2-.4.4.4 0 0 0 0-.4c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4.1 5.7 5.7 0 0 0 1.8.5 2.2 2.2 0 0 0 1.6-.8 1.8 1.8 0 0 0 .4-.7z',
  telegram: 'M21.5 4.6 2.9 11.7c-1 .4-1 1.4 0 1.7l4.7 1.5 1.8 5.5c.3.8 1.1.8 1.6.2l2.6-3 4.8 3.5c.7.4 1.4.1 1.6-.7l3-14.4c.3-1.2-.5-1.9-1.5-1.4zM8.5 14.4l9.5-6c.4-.3.8.2.5.5l-7.7 7.1-.3 3z',
  discord: 'M20.3 4.4A18.6 18.6 0 0 0 15.7 3l-.2.4a17 17 0 0 1 4 2A15.7 15.7 0 0 0 8 5.4a17 17 0 0 1 4-2L11.8 3a18.6 18.6 0 0 0-4.6 1.4A19.2 19.2 0 0 0 3 17.9a19 19 0 0 0 5.8 2.9l.4-.6a12 12 0 0 1-2-1l.5-.3a13.6 13.6 0 0 0 11.7 0l.5.3a12 12 0 0 1-2 1l.4.6a19 19 0 0 0 5.8-2.9 19 19 0 0 0-1.3-13.5zM8.8 14.8c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.4 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z',
  messenger: 'M12 2C6.5 2 2 6 2 11a8.8 8.8 0 0 0 3.5 7L5 22l4.2-2.2A11 11 0 0 0 12 20c5.5 0 10-4 10-9s-4.5-9-10-9zm1 12-2.5-2.7L5 14l5-5.3 2.5 2.7L17 8z',
  wave: 'M2 12h2l2-7 3 14 3-10 2 6 1-3h7',
  sun: 'M12 7a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0-5v2m0 16v2m-7-9H3m18 0h-2M6 6 4.5 4.5m15 15L18 18M6 18l-1.5 1.5M18 6l1.5-1.5',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  lock: 'M6 10h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zm2 0V7a4 4 0 1 1 8 0v3M12 15v3',
  mail: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 2 8 6 8-6',
  settings: 'M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm8 4a8 8 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a8 8 0 0 0-1.7-1L15 3h-4l-.8 2.4a8 8 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a8 8 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a8 8 0 0 0 1.7 1l.8 2.4h4l.8-2.4a8 8 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6a8 8 0 0 0 .1-1z',
  fingerprint: 'M12 3a8 8 0 0 1 8 8v2m-8-10c-1.5 0-3 .4-4.2 1.1M12 3c1.8 0 3.4.5 4.8 1.4M5 7.5A8 8 0 0 1 4 11v4M5.5 12a6.5 6.5 0 0 0 1 3.5M9 5.2A8 8 0 0 0 6 8M12 5v14m3-9v5m3-8v8m-12 0v3m4 0v-5m-4 5H3m15 0h3',
  arrow: 'M12 19V5m-7 7 7-7 7 7',
};

const fallbackEmoji: Record<string, string> = {
  home: '🏠',
  mic: '🎙️',
  bot: '🤖',
  zap: '⚡',
  user: '👤',
  crown: '👑',
  send: '➤',
  chat: '💬',
  bell: '🔔',
  chevron: '›',
  x: '✕',
  check: '✓',
  plus: '+',
  trash: '🗑️',
  clock: '🕐',
  reply: '↩️',
  wave: '👋',
  sun: '☀️',
  moon: '🌙',
  lock: '🔒',
  mail: '✉️',
  settings: '⚙️',
  fingerprint: '🫆',
  arrow: '↑',
};

export default function Icon({
  name,
  size = 20,
  color = '#FFFFFF',
  strokeWidth = 1.8,
}: {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const d = paths[name];
  if (!d) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={d}
        stroke={color}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* some paths include an inner filled element handled below when needed */}
    </Svg>
  );
}

/** Glyph used for brand-platform fallback when a specific path is absent. */
export function PlatformIcon({ platform, size = 24, color = '#94A3B8' }: { platform: string; size?: number; color?: string }) {
  if (paths[platform]) return <Icon name={platform} size={size} color={color} />;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth={1.5} />
      <Path d="M12 7v5l3 2" stroke={color} fill="none" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}
