const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Watch the shared packages so changes hot-reload (monorepo support).
config.watchFolders = [__dirname, '../../packages'];

// Compile Tailwind (global.css) through Metro — required for NativeWind classes.
module.exports = withNativeWind(config, { input: './global.css' });
