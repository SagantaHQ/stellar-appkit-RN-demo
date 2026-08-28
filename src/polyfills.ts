/**
 * Polyfills required by Stellar AppKit on React Native.
 *
 * `@saganta/stellar-appkit-react-native/polyfills` exports `installPolyfills()`,
 * which installs:
 *   - `global.Buffer`            (from the `buffer` npm package)
 *   - `crypto.getRandomValues`   (from `react-native-get-random-values`)
 *   - WalletConnect RN compat    (storage/event shims for the WC SDK)
 *
 * Expo Go note (why the shim below exists):
 * `react-native-get-random-values` is a *native* module that is NOT compiled
 * into Expo Go — importing it at runtime in Expo Go would crash. `expo-crypto`
 * IS part of Expo Go and exposes the same primitive synchronously. So we shim
 * `crypto.getRandomValues` from `expo-crypto` *first*; `installPolyfills()`
 * then sees the global already exists and never executes its native-module
 * fallback. (The package still must be installed — Metro resolves every static
 * require at bundle time — it just never runs.)
 *
 * In a custom dev client / bare workflow you can drop the shim and let
 * `installPolyfills()` use `react-native-get-random-values` directly.
 */
import * as ExpoCrypto from 'expo-crypto';
import { installPolyfills } from '@saganta/stellar-appkit-react-native/polyfills';

type RandomValuesFn = (array: Uint8Array) => Uint8Array;

const g = globalThis as unknown as {
  crypto?: { getRandomValues?: RandomValuesFn };
};

if (typeof g.crypto?.getRandomValues !== 'function') {
  const getRandomValues: RandomValuesFn = (array) => {
    // expo-crypto fills and returns the array it is given; copy back into the
    // caller's buffer to be safe against either return semantics.
    const filled = ExpoCrypto.getRandomValues(new Uint8Array(array.length));
    array.set(filled);
    return array;
  };
  if (g.crypto) {
    (g.crypto as { getRandomValues: RandomValuesFn }).getRandomValues = getRandomValues;
  } else {
    (globalThis as unknown as { crypto: { getRandomValues: RandomValuesFn } }).crypto = { getRandomValues };
  }
}

export const polyfillResult = installPolyfills();
