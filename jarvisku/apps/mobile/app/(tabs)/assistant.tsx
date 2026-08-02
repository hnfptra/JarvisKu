import { useState, useRef, useEffect } from 'react';
import { View, TextInput, Pressable, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import Screen from '../../components/ui/Screen';
import Text from '../../components/ui/Text';
import Icon from '../../components/ui/Icon';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { assistantApi } from '../../lib/api/endpoints';
import { colors } from '../../lib/theme';
import { useQueryClient } from '@tanstack/react-query';

/** Expanding ring behind the mic while listening. 180ms pulse, soft easing. */
function PulseRing() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.6, { duration: 600, easing: Easing.out(Easing.cubic) }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
      -1,
      true
    );
  }, [scale, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.danger,
        },
        style,
      ]}
    />
  );
}

type Msg = { role: 'user' | 'assistant'; content: string; createdAt: string };

const phaseHints: Record<string, string> = {
  idle: 'Tekan mic untuk bicara, atau ketik pesan.',
  listening: 'Mendengarkan…',
  thinking: 'JarvisKu berpikir…',
  speaking: 'Membalas…',
};

export default function Assistant() {
  const router = useRouter();
  const qc = useQueryClient();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);

  const append = (role: Msg['role'], content: string) => {
    const msg = { role, content, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, msg]);
    return msg;
  };

  async function send(text: string) {
    if (!text.trim() || sending) return;
    setSending(true);
    append('user', text.trim());
    setInput('');
    try {
      const res = await assistantApi.chat({ message: text.trim(), conversationId: conversationId ?? undefined });
      setConversationId(res.conversationId);
      append('assistant', res.reply);
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    } catch {
      append('assistant', 'Maaf, terjadi kendala. Coba lagi ya.');
    } finally {
      setSending(false);
    }
  }

  const onVoice = useVoiceAssistant((text, reply, audio) => {
    void audio;
    if (text) {
      append('user', text);
      if (reply) append('assistant', reply);
    }
  });

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen padded={false} style={{ paddingHorizontal: 0 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
          <Text variant="subtitle">Asisten Suara</Text>
          <Pressable
            className="bg-card border border-border rounded-2xl px-3 py-1.5"
            onPress={() => router.push('/history')}
          >
            <Text color="accent" variant="caption">Riwayat</Text>
          </Pressable>
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 16 }}
          ListEmptyComponent={
            <View className="items-center pt-16">
              <Icon name="wave" size={44} color={colors.textSecondary} />
              <Text variant="body" color="secondary" className="mt-4 text-center">
                {phaseHints[onVoice.phase]}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              className={`mb-3 max-w-[82%] rounded-2xl px-4 py-3 ${
                item.role === 'user' ? 'self-end bg-primary' : 'self-start bg-card border border-border'
              }`}
            >
              <Text variant="body" className={item.role === 'user' ? 'text-white' : ''}>{item.content}</Text>
            </View>
          )}
        />

        {/* Composer */}
        <View className="flex-row items-center gap-2 px-4 pb-4">
          <View className="flex-1 bg-card border border-border rounded-3xl flex-row items-center px-4">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ketik pesan…"
              placeholderTextColor="#64748B"
              className="flex-1 h-12 text-text"
              onSubmitEditing={() => send(input)}
            />
            <Pressable onPress={() => send(input)} disabled={sending} className="ml-2">
              <Icon name="send" size={20} color={sending ? colors.textSecondary : colors.accent} />
            </Pressable>
          </View>

          {/* Voice button */}
          <View>
            {onVoice.phase === 'listening' ? <PulseRing /> : null}
            <Pressable
              onPressIn={onVoice.start}
              onPressOut={onVoice.stop}
              className={`w-14 h-14 rounded-full items-center justify-center ${
                onVoice.phase === 'listening' ? 'bg-danger' : 'bg-primary'
              }`}
            >
              <Icon name="mic" size={24} color="#fff" />
            </Pressable>
          </View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
