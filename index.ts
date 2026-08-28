/**
 * Stellar AppKit RN Demo — entry point.
 *
 * `./src/polyfills` MUST be the first import: it installs the Buffer and
 * crypto.getRandomValues globals (Expo Go-safe, see the file header) that
 * @saganta/stellar-appkit and @stellar/stellar-sdk need at runtime.
 * All imports below are hoisted, but polyfills only have to be in place
 * before the first *call* into the SDK — which happens at render time,
 * safely after this module has evaluated.
 */
import './src/polyfills';

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
registerRootComponent(App);
