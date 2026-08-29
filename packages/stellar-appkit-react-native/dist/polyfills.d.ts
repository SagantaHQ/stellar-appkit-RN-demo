/**
 * One-call polyfill setup for Stellar AppKit on React Native.
 *
 * React Native (Hermes/JSC) is missing two globals the Stellar + WalletConnect
 * JS stacks assume:
 *
 * - `Buffer` — used by `@stellar/stellar-sdk` (XDR encode/decode) and by
 *   several sign paths in AppKit core. Provided by the `buffer` npm package.
 * - `crypto.getRandomValues` — required by ed25519 (tweetnacl) key handling
 *   and the WalletConnect SDK. Provided by `react-native-get-random-values`.
 *
 * Install both packages, then call this once — at the very top of your
 * entry file, BEFORE any `@saganta/*` or `@stellar/*` import:
 *
 * ```ts
 * // index.js — first line
 * import { installPolyfills } from '@saganta/stellar-appkit-react-native/polyfills';
 * installPolyfills();
 *
 * import { AppRegistry } from 'react-native';
 * import App from './App';
 * // ... imports that need Buffer / crypto are now safe
 * ```
 *
 * (ES module imports hoist, but polyfills only need to be *installed before
 * the missing globals are used at runtime* — and every Buffer/crypto use in
 * this stack happens inside functions, never at module top level. AppKit
 * core guarantees that since v1.9.51.)
 */
export interface PolyfillResult {
    /** True when `global.Buffer` was installed (was missing before). */
    installedBuffer: boolean;
    /** True when `crypto.getRandomValues` was installed (was missing before). */
    installedGetRandomValues: boolean;
    /** True when @walletconnect/react-native-compat was imported successfully. */
    installedWalletConnectCompat: boolean;
    /** Non-fatal notes — e.g. a package isn't installed but its global already exists. */
    notes: string[];
}
export declare function installPolyfills(): PolyfillResult;
//# sourceMappingURL=polyfills.d.ts.map