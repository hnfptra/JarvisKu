import { create } from 'zustand';
import { authApi } from '../lib/api/endpoints';
import { setTokens, getAccessToken } from '../lib/api/client';
import { loadJSON, saveJSON, removeItem } from '../lib/storage';
import type { User } from '../lib/types';

const ONBOARD_KEY = 'jk_onboarded';

interface AuthState {
  user: User | null;
  token: string | null;
  booting: boolean;
  onboarded: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  booting: true,
  onboarded: false,

  login: async (email, password) => {
    const res = await authApi.login({ email, password });
    await setTokens(res.accessToken, res.refreshToken);
    set({ user: res.user, token: res.accessToken });
  },

  register: async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    await setTokens(res.accessToken, res.refreshToken);
    set({ user: res.user, token: res.accessToken });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // token already invalid — ignore
    }
    await setTokens(null, null);
    set({ user: null, token: null });
  },

  hydrate: async () => {
    const onboarded = (await loadJSON<boolean>(ONBOARD_KEY)) ?? false;
    // Token lives in SecureStore; if present, refetch profile to validate.
    const token = await getAccessToken();
    set({ onboarded, booting: false });
    if (token && !get().user) {
      try {
        const { user } = await authApi.getProfile();
        set({ user, token });
      } catch {
        await setTokens(null, null);
        set({ user: null, token: null });
      }
    }
  },

  completeOnboarding: async () => {
    await saveJSON(ONBOARD_KEY, true);
    set({ onboarded: true });
  },
}));

export async function resetOnboarding() {
  await removeItem(ONBOARD_KEY);
}
