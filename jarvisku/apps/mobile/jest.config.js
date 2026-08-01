module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|expo-modules-core|react-navigation|@react-navigation/.*|nativewind|react-native-css-interop|react-native-svg|react-native-reanimated|react-native-gesture-handler|react-native-worklets-core|react-native-worklets|@tanstack/.*)/)',
  ],
};
