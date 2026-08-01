/**
 * Shared API contract types for JarvisKu.
 * Kept dependency-free so both frontend and edge functions can mirror it.
 */
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
  messages: ConversationMessage[];
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialAccount {
  _id: string;
  platform: 'instagram' | 'whatsapp' | 'telegram' | 'discord' | 'messenger';
  username: string;
  connectedAt: string;
  status: 'active' | 'error';
}

export interface InboxMessage {
  _id: string;
  platform: string;
  from: string;
  text: string;
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
  renewsAt: string;
}
