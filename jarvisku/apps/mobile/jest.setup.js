/* eslint-env jest */
require('react-native-reanimated').setUpTests?.();

// Silence act() warnings during focused component tests.
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}));
