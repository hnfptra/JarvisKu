/**
 * Social platform adapter registry.
 * Each provider exposes: { name, fetchInbox(credentials), sendReply(credentials, messageId, text) }
 * Only the mock provider ships in MVP; real integrations (Instagram/WhatsApp/Telegram/Discord/Messenger)
 * implement the same interface without touching routes or core.
 */

const providers = {};

export function registerProvider(name, provider) {
  providers[name] = provider;
}

export function getProvider(name) {
  return providers[name] || null;
}

export function listProviders() {
  return Object.keys(providers);
}

// --- Mock provider (demo / offline). Inbox is deterministic per user. ---
registerProvider('mock', {
  name: 'mock',
  label: 'Mock (Demo)',
  async fetchInbox() {
    const now = Date.now();
    const mk = (i, from, text, minutesAgo) => ({
      id: `mock-msg-${i}`,
      from,
      text,
      createdAt: new Date(now - minutesAgo * 60_000).toISOString(),
    });
    return [
      mk(1, 'Dina', 'Halo, masih ready kah?', 5),
      mk(2, 'Budi', 'Kirim katalog dong.', 40),
      mk(3, 'Sari', 'Ini barangnya bisa nego?', 130),
    ];
  },
  async sendReply() {
    return { sent: true };
  },
});
