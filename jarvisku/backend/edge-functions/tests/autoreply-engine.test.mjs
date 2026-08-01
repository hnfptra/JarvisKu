import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchAutoReply } from '../src/services/autoreply/engine.mjs';

// Realistic fake: separate "config" doc from "template" docs.
function makeDb({ enabled = true, workingHours, templates = [] }) {
  return {
    async findOne() {
      return null;
    },
    collection(name) {
      return {
        findOne: async (q) => {
          if (name === 'autoreplies' && q.kind === undefined) {
            return { enabled, workingHours };
          }
          return null;
        },
        find: () => ({ toArray: async () => templates }),
      };
    },
  };
}

test('returns null when autoreply disabled', async () => {
  const db = makeDb({ enabled: false, templates: [] });
  const res = await matchAutoReply(db, '000000000000000000000001', 'halo');
  assert.equal(res, null);
});

test('matches keyword template', async () => {
  const db = makeDb({
    enabled: true,
    templates: [
      { trigger: 'keyword', keywords: ['harga', 'price'], reply: 'Info harga segera ya', enabled: true },
    ],
  });
  const res = await matchAutoReply(db, '000000000000000000000001', 'berapa harganya?');
  assert.equal(res.reply, 'Info harga segera ya');
  assert.equal(res.keyword, 'harga');
});

test('falls back to match_all', async () => {
  const db = makeDb({
    enabled: true,
    templates: [
      { trigger: 'match_all', keywords: [], reply: 'Aku lagi AFK ya', enabled: true },
    ],
  });
  const res = await matchAutoReply(db, '000000000000000000000001', 'pesan apapun');
  assert.equal(res.reply, 'Aku lagi AFK ya');
});

test('keyword template takes priority over match_all', async () => {
  const db = makeDb({
    enabled: true,
    templates: [
      { trigger: 'keyword', keywords: ['harga'], reply: 'Cek dulu ya', enabled: true },
      { trigger: 'match_all', keywords: [], reply: 'AFK nih', enabled: true },
    ],
  });
  const res = await matchAutoReply(db, '000000000000000000000001', 'harga berapa');
  assert.equal(res.reply, 'Cek dulu ya');
});
