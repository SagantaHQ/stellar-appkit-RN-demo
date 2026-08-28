/**
 * Runtime platform detection for Stellar AppKit on React Native.
 *
 * Why not `typeof window`? React Native *defines* `window` — guards written
 * for SSR/Node (`typeof window === 'undefined'`) do NOT gate React Native.
 * The reliable signal on Hermes/JSC is `navigator.product === 'ReactNative'`,
 * which React Native has set since forever and which no browser sets.
 */
/** True when running inside a React Native (or Expo) runtime. */
export declare function isReactNativeRuntime(): boolean;
//# sourceMappingURL=platform.d.ts.map