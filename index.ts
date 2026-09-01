/**
 * Stellar AppKit RN Demo — entry point.
 *
 * `./src/polyfills` MUST be the first import: it installs the Buffer and
 * crypto.getRandomValues globals (Expo Go-safe, see the file header) that
 * @saganta/stellar-appkit and @stellar/stellar-sdk need at runtime.
 * All imports below are hoisted, but polyfills only have to be in place
 * before the first *call* into the SDK — which happens at render time,
 * safely after this module has evaluated.
 *
 * The dynamic import right after it is the startup-freeze fix (see the RN
 * package README, "Zero startup freeze"): evaluating the WalletConnect SDK's
 * module tree is a SYNCHRONOUS require the first time anything reaches it —
 * seconds of frozen JS thread on a debug Expo Go build. Firing it here pays
 * that cost exactly once, BEFORE React's first render — i.e. behind the
 * native splash screen, where a load simply looks like a load. Metro caches
 * module instances, so every later path (the modal's warm-ups, autoConnect's
 * restore, the first connect()) requires the SDK instantly and the app comes
 * up fully interactive. Without it the freeze landed right after the first
 * paint — every button dead for ~10 seconds.
 */
import './src/polyfills';
import 'react-native-gesture-handler';

// Pay the WC SDK evaluation behind the splash — see the file header. Fire
// and forget: the connector's own warmUp()/init still runs later against the
// already-evaluated module; a failure here leaves the connector cold and the
// next connect() surfaces the real error (same contract as warmUp()).
void import('@walletconnect/sign-client').catch(() => undefined);

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
registerRootComponent(App);
