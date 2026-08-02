/**
 * Runtime config, always from environment variables. Never hardcode secrets.
 */
function required(name) {
  const v = process.env[name];
  if (!v) {
    // Only throw in non-serverless contexts; platforms inject env at runtime.
    if (process.env.ALLOW_MISSING_ENV) return '';
    console.warn(`[env] missing ${name}`);
    return '';
  }
  return v;
}

export const env = {
  MONGODB_URI: required('MONGODB_URI'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  REFRESH_EXPIRES_IN: process.env.REFRESH_EXPIRES_IN || '30d',
  OPENAI_API_KEY: required('OPENAI_API_KEY'),
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  // OpenRouter: dipakai untuk chat bila OPENAI_API_KEY kosong/dummy.
  // Key berformat sk-or-v1-...  Model bebas pilih (mis. nvidia/nemotron-3-super-120b-a12b:free).
  OPENROUTER_API_KEY: required('OPENROUTER_API_KEY'),
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free',
};
