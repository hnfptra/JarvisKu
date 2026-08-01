import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.mjs';
import { ok, fail, idToStr } from '../lib/http.mjs';

/**
 * Premium is mocked for MVP (no payment processor yet).
 * `/plans` is static; `/subscription` reads/derives from the user record;
 * `/subscribe` flips the plan locally. Swap for a real billing provider later.
 */

export const PLANS = [
  {
    id: 'free',
    name: 'Gratis',
    price: 0,
    features: ['Asisten suara (terbatas)', 'Balas otomatis 1 template', 'Riwayat 7 hari'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49000,
    features: [
      'Asisten suara tanpa batas',
      'Balas otomatis tanpa batas',
      'Koneksi semua platform',
      'Riwayat tanpa batas',
      'Prioritas dukungan',
    ],
  },
];

const subscribeSchema = z.object({
  plan: z.enum(['free', 'pro']),
});

export const premiumRoutes = [
  {
    method: 'GET',
    path: '/plans',
    public: true,
    run: () => ok({ plans: PLANS }),
  },
  {
    method: 'GET',
    path: '/subscription',
    run: async (ctx) => {
      const db = await getDb();
      const user = await db.collection('users').findOne({ _id: new ObjectId(ctx.userId) });
      if (!user) return fail('User tidak ditemukan', 404, 'USER_NOT_FOUND');
      return ok({ subscription: deriveSubscription(user) });
    },
  },
  {
    method: 'POST',
    path: '/subscribe',
    run: async (ctx) => {
      const { plan } = subscribeSchema.parse(ctx.body);
      const db = await getDb();
      const now = new Date();
      const renewsAt = new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString();
      await db.collection('users').updateOne(
        { _id: new ObjectId(ctx.userId) },
        { $set: { plan, subscriptionUpdatedAt: now.toISOString() } }
      );
      const subscription = {
        _id: idToStr(new ObjectId()),
        userId: ctx.userId,
        plan,
        status: 'active',
        renewsAt,
      };
      await db.collection('subscriptions').insertOne({
        ...subscription,
        userId: new ObjectId(ctx.userId),
      });
      const user = await db.collection('users').findOne({ _id: new ObjectId(ctx.userId) });
      return ok({ subscription: { ...subscription, plan: user.plan } });
    },
  },
];

export function deriveSubscription(user) {
  return {
    plan: user.plan || 'free',
    status: user.plan === 'pro' ? 'active' : 'trialing',
    renewsAt: user.subscriptionUpdatedAt
      ? new Date(new Date(user.subscriptionUpdatedAt).getTime() + 30 * 24 * 3600 * 1000).toISOString()
      : null,
  };
}
