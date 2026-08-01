import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8888';
const TOKEN_KEY = 'jk_access_token';
const REFRESH_KEY = 'jk_refresh_token';

/**
 * Minimal fetch wrapper: injects Bearer token, handles JSON, auto-refreshes
 * once on 401, and returns typed `{ ok, data?, error? }`.
 */

class ApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code = 'ERROR') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function setTokens(access: string | null, refresh: string | null) {
  if (Platform.OS === 'web') {
    if (access) localStorage.setItem(TOKEN_KEY, access);
    else localStorage.removeItem(TOKEN_KEY);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    else localStorage.removeItem(REFRESH_KEY);
    return;
  }
  if (access) await SecureStore.setItemAsync(TOKEN_KEY, access);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
  if (refresh) await SecureStore.setItemAsync(REFRESH_KEY, refresh);
  else await SecureStore.deleteItemAsync(REFRESH_KEY);
}

export async function getAccessToken(): Promise<string | null> {
  return Platform.OS === 'web'
    ? localStorage.getItem(TOKEN_KEY)
    : SecureStore.getItemAsync(TOKEN_KEY);
}

async function getRefreshToken(): Promise<string | null> {
  return Platform.OS === 'web'
    ? localStorage.getItem(REFRESH_KEY)
    : SecureStore.getItemAsync(REFRESH_KEY);
}

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  retry?: boolean;
};

export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const { method = 'GET', body, auth = true, retry = true } = opts;
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (auth) {
    const token = await getAccessToken();
    if (token) headers.authorization = `Bearer ${token}`;
  }

  let res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && retry) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      headers.authorization = `Bearer ${refreshed}`;
      res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    }
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(json?.error?.message || `Request failed (${res.status})`, res.status, json?.error?.code);
  }
  return json.data as T;
}

async function refreshTokens(): Promise<string | null> {
  const refresh = await getRefreshToken();
  if (!refresh) return null;
  const res = await fetch(`${BASE_URL}/api/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) {
    await setTokens(null, null);
    return null;
  }
  const json = await res.json();
  await setTokens(json.data.accessToken, json.data.refreshToken);
  return json.data.accessToken;
}

export { BASE_URL, ApiError };
