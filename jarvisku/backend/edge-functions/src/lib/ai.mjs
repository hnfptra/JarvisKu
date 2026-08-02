import { env } from '../config/env.mjs';

function hasOpenAIKey() {
  return !!env.OPENAI_API_KEY && !env.OPENAI_API_KEY.startsWith('sk-...') && !env.OPENAI_API_KEY.includes('<');
}

/** OpenAI-compatible chat completion via fetch. No SDK, works on any edge runtime. */
export async function chatCompletion({ messages, temperature = 0.7 }) {
  if (!hasOpenAIKey()) {
    // Offline / unconfigured fallback keeps the app usable during dev.
    return localReply(messages);
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

/** Local, no-key fallback so the demo works offline. Understands a little context. */
function localReply(messages) {
  const user = messages.filter((m) => m.role === 'user').pop()?.content ?? '';
  const t = user.toLowerCase();
  if (t.includes('halo') || t.includes('hai') || t.includes('assalam')) return 'Halo juga! 👋 Ada yang bisa JarvisKu bantu?';
  if (t.includes('siapa kamu')) return 'Aku JarvisKu, asisten pribadimu. Mau bantu apa hari ini?';
  if (t.includes('jangan') || t.includes('tolong')) return 'Siap, aku bantu. Ceritakan lebih detail ya.';
  if (t.includes('harga') || t.includes('berapa')) return 'Untuk info harga, aku cek dulu ya. Tunggu sebentar 👍';
  if (t.includes('terima kasih') || t.includes('makasih')) return 'Sama-sama! Senang bisa bantu 😊';
  return `Kamu bilang: "${user.slice(0, 80)}". (Mode demo — set OPENAI_API_KEY untuk jawaban AI yang sesungguhnya.)`;
}

/** Transcribe audio (WebM/MP3/etc.) using OpenAI Whisper. */
export async function transcribeAudio(audioBuffer, mimeType = 'audio/webm') {
  if (!hasOpenAIKey()) return '';
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
  if (!hasOpenAIKey()) return null;
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
