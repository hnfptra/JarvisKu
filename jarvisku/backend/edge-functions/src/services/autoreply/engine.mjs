import { ObjectId } from 'mongodb';

/**
 * Auto-reply matching engine (pure logic, no route concerns).
 * Checks: autoreply enabled → working hours (if configured) → keyword templates.
 * Returns { reply, keyword } or null.
 */
export async function matchAutoReply(db, userId, text) {
  const userIdObj = new ObjectId(userId);
  const config = await db.collection('autoreplies').findOne({ userId: userIdObj });
  if (!config?.enabled) return null;

  if (config.workingHours?.enabled && !inWorkingHours(config.workingHours)) return null;

  const templates = await db
    .collection('autoreplies')
    .find({ userId: userIdObj, kind: 'template', enabled: true })
    .toArray();

  const lower = text.toLowerCase();
  // Specific keyword matches first; fall back to match_all.
  const keywordMatch = templates.find(
    (t) => t.trigger === 'keyword' && t.keywords.some((k) => lower.includes(k.toLowerCase()))
  );
  if (keywordMatch) {
    const keyword = keywordMatch.keywords.find((k) => lower.includes(k.toLowerCase()));
    return { reply: keywordMatch.reply, keyword };
  }
  const allMatch = templates.find((t) => t.trigger === 'match_all');
  if (allMatch) return { reply: allMatch.reply, keyword: null };
  return null;
}

function inWorkingHours({ start, end }) {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = (start || '09:00').split(':').map(Number);
  const [eh, em] = (end || '18:00').split(':').map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  if (startMin === endMin) return true; // 24h window
  return minutes >= startMin && minutes < endMin;
}
