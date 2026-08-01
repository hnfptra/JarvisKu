import { useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  startRecording,
  stopRecording,
  playAudioBase64,
  browserSpeechToText,
} from '../lib/voice';
import { assistantApi } from '../lib/api/endpoints';
import { useVoice } from '../store/voice';

export type Phase = 'idle' | 'listening' | 'thinking' | 'speaking';

/**
 * Voice assistant flow: hold-to-record → STT (edge) → AI reply → TTS playback.
 * On web, falls back to the browser SpeechRecognition API.
 */
export function useVoiceAssistant(onResult: (text: string, reply: string, audio?: string | null) => void) {
  const [phase, setPhase] = useState<Phase>('idle');
  const recRef = useRef<Awaited<ReturnType<typeof startRecording>> | null>(null);
  const setListening = useVoice((s) => s.setListening);
  const setSpeaking = useVoice((s) => s.setSpeaking);

  async function start() {
    setPhase('listening');
    setListening(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (Platform.OS === 'web') {
      browserSpeechToText((text) => {
        if (text.trim()) onResult(text.trim(), '');
        setPhase('idle');
        setListening(false);
      });
      // Auto-stop after 8s on web.
      setTimeout(() => {
        setPhase('idle');
        setListening(false);
      }, 8000);
      return;
    }
    const rec = await startRecording();
    recRef.current = rec;
  }

  async function stop() {
    if (Platform.OS === 'web') return;
    if (!recRef.current) {
      setPhase('idle');
      setListening(false);
      return;
    }
    setPhase('thinking');
    setListening(false);
    try {
      const { base64 } = await stopRecording(recRef.current);
      recRef.current = null;
      if (!base64) {
        setPhase('idle');
        return;
      }
      const res = await assistantApi.speech({ audio: base64, mimeType: 'audio/m4a', tts: true });
      onResult(res.text, res.reply, res.audioBase64);
      if (res.audioBase64) {
        setSpeaking(true);
        setPhase('speaking');
        const sound = await playAudioBase64(res.audioBase64);
        if (sound) {
          await new Promise<void>((r) => {
            sound.setOnPlaybackStatusUpdate((s) => {
              if (!s.isLoaded || s.didJustFinish) r();
            });
          });
          await sound.unloadAsync();
        }
      }
    } catch {
      // STT failed — stay quiet.
    } finally {
      setSpeaking(false);
      setPhase('idle');
    }
  }

  return { phase, start, stop };
}
