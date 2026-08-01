import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  ...(require('./app.json') as ExpoConfig),
};

export default config;
