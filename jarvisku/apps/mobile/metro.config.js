const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Watch the shared packages so changes hot-reload (monorepo support).
config.watchFolders = [__dirname, '../../packages'];

module.exports = config;
