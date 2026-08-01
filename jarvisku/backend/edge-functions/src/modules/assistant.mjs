import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.mjs';
import { ok, fail, idToStr } from '../lib/http.mjs';
import { chatCompletion, transcribeAudio, textToSpeech } from '../lib/ai.mjs';

const SYSTEM_PROMPT = `Kamu adalah JarvisKu, asisten pribadi yang ramah dan singkat. Selalu jawab dalam Bahasa Indonesia, maksimal 2-3 kalimat, langsung ke inti. Gunakan bahasa santai. Jika perlu ringkasan percakapan, buat poin-poin singkat.`;

const chatSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
  summary: z.boolean().optional(),
});

async function makeConversation(db, userId, message) {
  const now = new Date().toISOString();
  const { insertedId } = await db.collection('conversations').insertOne({
    userId: new ObjectId(userId),
    title: message.slice(0, 60),
    messages: [{ role: 'user', content: message, createdAt: now }],
    summary: null,
    createdAt: now,
    updatedAt: now,
  });
  return insertedId;
}

function publicMessage(m) {
  return { role: m.role, content: m.content, createdAt: m.createdAt };
}

export const assistantRoutes = [
  {
    method: 'POST',
    path: '/chat',
    run: async (ctx) => {
      const data = chatSchema.parse(ctx.body);
      const db = await getDb();
      const userId = new ObjectId(ctx.userId);

      // Context: reuse the recent conversation history when a conversationId is given.
      let conversation = null;
      let history = [];
      if (data.conversationId) {
        conversation = await db
          .collection('conversations')
          .findOne({ _id: new ObjectId(data.conversationId), userId });
        if (!conversation) return fail('Percakapan tidak ditemukan', 404, 'CONVERSATION_NOT_FOUND');
        history = conversation.messages.slice(-8).map(publicMessage);
      }

      const now = new Date().toISOString();
      const userMsg = { role: 'user', content: data.message, createdAt: now };

      const aiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        userMsg,
      ];
      const reply = await chatCompletion({ messages: aiMessages });

      if (conversation) {
        await db
          .collection('conversations')
          .updateOne(
            { _id: conversation._id },
            { $push: { messages: { $each: [userMsg, { role: 'assistant', content: reply, createdAt: now }] } }, $set: { updatedAt: now } }
          );
      } else {
        const conversationId = await makeConversation(db, ctx.userId, data.message);
        conversation = { _id: conversationId };
        await db
          .collection('conversations')
          .updateOne({ _id: conversationId }, { $push: { messages: { role: 'assistant', content: reply, createdAt: now } } });
      }

      return ok({ conversationId: idToStr(conversation._id), reply });
    },
  },
  {
    method: 'POST',
    path: '/speech',
    run: async (ctx) => {
      const db = await getDb();
      const body = ctx.body;
      const audioBase64 = body?.audio;
      const mime = body?.mimeType || 'audio/webm';
      if (!audioBase64) return fail('Field audio (base64) wajib ada', 400, 'MISSING_AUDIO');

      const buffer = Buffer.from(audioBase64, 'base64');
      const text = await transcribeAudio(buffer, mime);
      if (!text) return fail('Audio tidak bisa dikenali', 422, 'STT_FAILED');

      // Treat STT output as a normal chat turn so history is kept.
      const userId = new ObjectId(ctx.userId);
      const now = new Date().toISOString();
      const userMsg = { role: 'user', content: text, createdAt: now };
      const reply = await chatCompletion({
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, userMsg],
      });
      const { insertedId } = await db.collection('conversations').insertOne({
        userId,
        title: text.slice(0, 60),
        messages: [userMsg, { role: 'assistant', content: reply, createdAt: now }],
        summary: null,
        createdAt: now,
        updatedAt: now,
      });

      const tts = body?.tts ? await textToSpeech(reply) : null;
      return ok({
        conversationId: idToStr(insertedId),
        text,
        reply,
        audioBase64: tts ? tts.toString('base64') : null,
      });
    },
  },
  {
    method: 'POST',
    path: '/tts',
    run: async (ctx) => {
      const data = z.object({ text: z.string().min(1).max(4000) }).parse(ctx.body);
      const tts = await textToSpeech(data.text);
      if (!tts) return fail('TTS tidak tersedia (OPENAI_API_KEY belum diatur)', 503, 'TTS_UNAVAILABLE');
      return ok({ audioBase64: tts.toString('base64') });
    },
  },
  {
    method: 'GET',
    path: '/history',
    run: async (ctx) => {
      const db = await getDb();
      const limit = Math.min(Number(ctx.query?.limit) || 20, 50);
      const rows = await db
        .collection('conversations')
        .find({ userId: new ObjectId(ctx.userId) })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .toArray();
      const summary = ctx.query?.summary === 'true';
      return ok({
        conversations: rows.map((c) => ({
          _id: idToStr(c._id),
          title: c.title,
          messages: summary ? undefined : c.messages.map(publicMessage),
          summary: c.summary || null,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
      });
    },
  },
  {
    method: 'GET',
    path: '/history/:id',
    run: async (ctx) => {
      const db = await getDb();
      const row = await db
        .collection('conversations')
        .findOne({ _id: new ObjectId(ctx.params.id), userId: new ObjectId(ctx.userId) });
      if (!row) return fail('Percakapan tidak ditemukan', 404, 'CONVERSATION_NOT_FOUND');
      return ok({
        conversation: {
          _id: idToStr(row._id),
          title: row.title,
          messages: row.messages.map(publicMessage),
          summary: row.summary || null,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        },
      });
    },
  },
  {
    method: 'DELETE',
    path: '/history/:id',
    run: async (ctx) => {
      const db = await getDb();
      const res = await db
        .collection('conversations')
        .deleteOne({ _id: new ObjectId(ctx.params.id), userId: new ObjectId(ctx.userId) });
      if (!res.deletedCount) return fail('Percakapan tidak ditemukan', 404, 'CONVERSATION_NOT_FOUND');
      return ok({ deleted: true });
    },
  },
];
