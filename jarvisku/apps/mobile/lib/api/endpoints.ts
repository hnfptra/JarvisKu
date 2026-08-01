import { api } from './client';
import type {
  AuthResponse,
  Conversation,
  SocialAccount,
  InboxMessage,
  AutoReplyTemplate,
  Subscription,
} from '../types';

export interface AutoReplyConfig {
  enabled: boolean;
  workingHours: { enabled: boolean; start: string; end: string };
}

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api<AuthResponse>('/api/register', { method: 'POST', body: data, auth: false }),
  login: (data: { email: string; password: string }) =>
    api<AuthResponse>('/api/login', { method: 'POST', body: data, auth: false }),
  logout: () => api<{ revoked: boolean }>('/api/logout', { method: 'POST' }),
  getProfile: () => api<{ user: AuthResponse['user']; preferences: Record<string, unknown> }>('/api/profile'),
  updateProfile: (data: Record<string, unknown>) => api('/api/profile', { method: 'PUT', body: data }),
};

export const assistantApi = {
  chat: (body: { message: string; conversationId?: string }) =>
    api<{ conversationId: string; reply: string }>('/api/assistant/chat', { method: 'POST', body }),
  speech: (body: { audio: string; mimeType?: string; tts?: boolean }) =>
    api<{ conversationId: string; text: string; reply: string; audioBase64?: string | null }>('/api/assistant/speech', {
      method: 'POST',
      body,
    }),
  tts: (text: string) => api<{ audioBase64: string }>('/api/assistant/tts', { method: 'POST', body: { text } }),
  history: (summary = false) => api<{ conversations: Conversation[] }>(`/api/assistant/history?summary=${summary}`),
  conversation: (id: string) => api<{ conversation: Conversation }>(`/api/assistant/history/${id}`),
  deleteConversation: (id: string) => api<{ deleted: boolean }>(`/api/assistant/history/${id}`, { method: 'DELETE' }),
};

export const autoreplyApi = {
  config: () => api<{ config: AutoReplyConfig; templates: AutoReplyTemplate[] }>('/api/autoreply/config'),
  enable: (config: { enabled: boolean; workingHours?: AutoReplyConfig['workingHours'] }) =>
    api('/api/autoreply/enable', { method: 'POST', body: config }),
  createTemplate: (body: Omit<AutoReplyTemplate, '_id'>) => api<{ template: AutoReplyTemplate }>('/api/autoreply/template', { method: 'POST', body }),
  updateTemplate: (id: string, body: Partial<AutoReplyTemplate>) =>
    api<{ template: AutoReplyTemplate }>(`/api/autoreply/template/${id}`, { method: 'PUT', body }),
  deleteTemplate: (id: string) => api<{ deleted: boolean }>(`/api/autoreply/template/${id}`, { method: 'DELETE' }),
  logs: () => api<{ logs: Array<{ _id: string; platform: string; message: string; reply: string; matchedKeyword: string | null; createdAt: string }> }>('/api/autoreply/log'),
};

export const socialApi = {
  accounts: () => api<{ accounts: SocialAccount[] }>('/api/social/accounts'),
  messages: () => api<{ messages: InboxMessage[] }>('/api/social/messages'),
  connect: (data: { platform: SocialAccount['platform']; username: string; token?: string }) =>
    api<{ account: SocialAccount }>('/api/social/connect', { method: 'POST', body: data }),
  disconnect: (platform: string) => api<{ deleted: boolean }>('/api/social/disconnect', { method: 'POST', body: { platform } }),
  ingest: (data: { platform: string; from: string; text: string }) =>
    api<{ message: InboxMessage }>('/api/social/ingest', { method: 'POST', body: data }),
};

export const premiumApi = {
  plans: () =>
    api<{ plans: Array<{ id: string; name: string; price: number; features: string[] }> }>('/api/plans', { auth: false }),
  subscription: () => api<{ subscription: Subscription }>('/api/subscription'),
  subscribe: (plan: 'free' | 'pro') => api<{ subscription: Subscription }>('/api/subscribe', { method: 'POST', body: { plan } }),
};

export const dashboardApi = {
  get: () =>
    api<{
      user: AuthResponse['user'];
      subscription: Subscription;
      social: { connected: number; accounts: Array<{ platform: string; username: string; status: string }> };
      automation: { enabled: boolean; templateCount: number; lastActivity: string | null };
      recentActivity: Array<{ kind: string; title: string; at: string; id: string }>;
    }>('/api/dashboard'),
};
