/** API contract types mirrored from packages/shared. */

export type Plan = 'free' | 'pro';

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  title: string;
  messages?: ConversationMessage[];
  summary?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SocialPlatform = 'instagram' | 'whatsapp' | 'telegram' | 'discord' | 'messenger';

export interface SocialAccount {
  _id: string;
  platform: SocialPlatform;
  username: string;
  status: 'active' | 'error';
  connectedAt: string;
}

export interface InboxMessage {
  _id: string;
  platform: string;
  from: string;
  text: string;
  autoReplied?: boolean;
  reply?: string | null;
  createdAt: string;
}

export interface AutoReplyTemplate {
  _id: string;
  name: string;
  trigger: 'keyword' | 'match_all';
  keywords: string[];
  reply: string;
  enabled: boolean;
}

export interface Subscription {
  plan: Plan;
  status: 'active' | 'trialing' | 'expired';
  renewsAt: string | null;
}

export interface UserPreferences {
  voiceEnabled: boolean;
  notificationsEnabled: boolean;
  theme: 'dark' | 'light' | 'system';
  timezone: string | null;
}
