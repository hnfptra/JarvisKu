import { env } from '../config/env.mjs';

/** OpenAI-compatible chat completion via fetch. No SDK, works on any edge runtime. */
export async function chatCompletion({ messages, temperature = 0.7 }) {
  if (!env.OPENAI_API_KEY) {
    // Offline / unconfigured fallback keeps the app usable during dev.
    const last = messages[messages.length - 1]?.content ?? '';
    return `(AI belum dikonfigurasi) Kamu berkata: "${last}". Set OPENAI_API_KEY untuk jawaban nyata.`;
  }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      messages,
      temperature,
    }),
  });
  if (!res.ok) {
    const e = new Error(`OpenAI error ${res.status}: ${await res.text()}`);
    e.status = 502;
    throw e;
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? '';
}

/** Transcribe audio (WebM/MP3/etc.) using OpenAI Whisper. */
export async function transcribeAudio(audioBuffer, mimeType = 'audio/webm') {
  if (!env.OPENAI_API_KEY) return '';
  const form = new FormData();
  form.append('file', new Blob([audioBuffer], { type: mimeType }), 'input.webm');
  form.append('model', 'whisper-1');
  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}` },
    body: form,
  });
  if (!res.ok) {
    const e = new Error(`Whisper error ${res.status}: ${await res.text()}`);
    e.status = 502;
    throw e;
  }
  const json = await res.json();
  return json.text ?? '';
}

/** Text-to-speech using OpenAI TTS. Returns an MP3 Buffer. */
export async function textToSpeech(text) {
  if (!env.OPENAI_API_KEY) return null;
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'tts-1',
      voice: 'nova',
      input: text.slice(0, 4000),
    }),
  });
  if (!res.ok) {
    const e = new Error(`TTS error ${res.status}: ${await res.text()}`);
    e.status = 502;
    throw e;
  }
  return Buffer.from(await res.arrayBuffer());
}
