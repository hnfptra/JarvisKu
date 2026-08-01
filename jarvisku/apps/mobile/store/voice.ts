import { create } from 'zustand';

interface VoiceState {
  listening: boolean;
  speaking: boolean;
  transcript: string;
  setListening: (v: boolean) => void;
  setSpeaking: (v: boolean) => void;
  setTranscript: (t: string) => void;
}

/** UI state for the voice assistant. Recording itself is in lib/voice. */
export const useVoice = create<VoiceState>((set) => ({
  listening: false,
  speaking: false,
  transcript: '',
  setListening: (v) => set({ listening: v }),
  setSpeaking: (v) => set({ speaking: v }),
  setTranscript: (t) => set({ transcript: t }),
}));
