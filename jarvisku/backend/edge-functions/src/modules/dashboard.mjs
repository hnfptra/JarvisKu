import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.mjs';
import { ok, idToStr } from '../lib/http.mjs';
import { deriveSubscription } from './premium.mjs';

/**
 * Aggregates everything the home screen needs in one round-trip.
 * Querying a handful of collections per user is fine at MVP scale.
 */
export const dashboardRoutes = [
  {
    method: 'GET',
    path: '/',
    run: async (ctx) => {
      const db = await getDb();
      const userId = new ObjectId(ctx.userId);
      const [user, socialAccounts, autoreply, recentChats, inbox, templates] = await Promise.all([
        db.collection('users').findOne({ _id: userId }),
        db.collection('social_accounts').find({ userId }).toArray(),
        db.collection('autoreplies').findOne({ userId }),
        db.collection('conversations').find({ userId }).sort({ updatedAt: -1 }).limit(5).toArray(),
        db.collection('messages').find({ userId }).sort({ createdAt: -1 }).limit(5).toArray(),
        db.collection('autoreplies').find({ userId, kind: 'template' }).limit(3).toArray(),
      ]);

      const automationEnabled = !!autoreply?.enabled;
      const templateCount = templates.length;

      return ok({
        user: user ? { _id: idToStr(user._id), name: user.name, email: user.email } : null,
        subscription: user ? deriveSubscription(user) : { plan: 'free', status: 'trialing' },
        social: {
          accounts: socialAccounts.map((a) => ({
            platform: a.platform,
            username: a.username,
            status: a.status,
          })),
          connected: socialAccounts.length,
        },
        automation: {
          enabled: automationEnabled,
          templateCount,
          lastActivity: autoreply?.updatedAt || null,
        },
        recentActivity: [
          ...recentChats.map((c) => ({ kind: 'chat', title: c.title, at: c.updatedAt, id: idToStr(c._id) })),
          ...inbox.map((m) => ({ kind: 'message', title: `${m.from}: ${m.text.slice(0, 60)}`, at: m.createdAt, id: idToStr(m._id) })),
        ].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 8),
      });
    },
  },
];
