import { Audio } from 'expo-av';

/**
 * Voice I/O utilities.
 * STT: record → send audio bytes to edge function (Whisper) → returns text.
 * TTS: server returns MP3 base64 → play via expo-av.
 * Web target uses the browser SpeechRecognition API instead of recording.
 */

export interface RecordingHandle {
  stop: () => Promise<{ uri?: string }>;
  getURI: () => string | null;
}

/** Start a recording session. Caller must stopRecording() to finalize. */
export async function startRecording(): Promise<RecordingHandle | null> {
  try {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const rec = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    return rec as unknown as RecordingHandle;
  } catch {
    return null;
  }
}

export async function stopRecording(rec: RecordingHandle): Promise<{ uri: string; base64: string }> {
  let uri = '';
  try {
    const r = await rec.stop();
    uri = r.uri ?? '';
  } catch {
    // already stopped
  }
  await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
  const base64 = uri ? await uriToBase64(uri) : '';
  return { uri, base64 };
}

async function uriToBase64(uri: string): Promise<string> {
  try {
    const res = await fetch(uri);
    const blob = await res.blob();
    return await blobToBase64(blob);
  } catch {
    return '';
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Play a base64 MP3 returned by the TTS edge function. Returns a Sound to unload later. */
export async function playAudioBase64(base64: string): Promise<Audio.Sound | null> {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(
      { uri: `data:audio/mp3;base64,${base64}` },
      { shouldPlay: true }
    );
    return sound;
  } catch {
    return null;
  }
}

// Minimal structural types for the browser SpeechRecognition API (not in TS lib).
interface SpeechResult {
  transcript: string;
}
interface SpeechRecognitionEvent {
  results: ArrayLike<{ [index: number]: SpeechResult }>;
}
type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  onresult: (e: SpeechRecognitionEvent) => void;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

/** Browser-only SpeechRecognition for the web target. Returns a stop function. */
export function browserSpeechToText(onResult: (text: string) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const w = window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor };
  if (!w.webkitSpeechRecognition) return () => {};
  const rec = new w.webkitSpeechRecognition();
  rec.lang = 'id-ID';
  rec.interimResults = true;
  rec.onresult = (e) => {
    const text = Array.from(e.results)
      .map((r) => r[0].transcript)
      .join('');
    onResult(text);
  };
  rec.start();
  return () => rec.stop();
}

export { uriToBase64 };
