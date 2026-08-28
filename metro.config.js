/**
 * Metro config for the demo.
 *
 * The only customization: stubbing browser-only peer dependencies of
 * @saganta/stellar-appkit (the Trezor hardware-wallet SDK). The core SDK
 * imports them lazily inside the Trezor connector factory — that connector
 * is never registered on React Native (`defaultReactNativeConnectors()`
 * registers WalletConnect + Albedo only) — but Metro statically resolves
 * every visible `import()` at bundle time, so without a stub the bundle
 * fails to build. Stubbing keeps the Expo Go bundle free of a web-extension
 * SDK it would never execute.
 */
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const RN_BROWSER_STUBS = new Set([
  '@trezor/connect-web',
  '@trezor/connect-plugin-stellar',
]);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (RN_BROWSER_STUBS.has(moduleName)) {
    // `type: 'empty'` makes Metro resolve the module to an empty shim.
    return { type: 'empty' };
  }
  // Defer to the standard resolution for everything else.
  return context.resolveRequest(context, moduleName, platform);
};

// Match the legacy `resolverMainFields` behavior (which already prefers the
// "browser" field on native platforms) for packages that use the `exports`
// map. This makes @stellar/stellar-sdk resolve to its self-contained browser
// build (dist/stellar-sdk.min.js) on iOS/Android instead of the Node build,
// whose `eventsource` dependency requires Node builtins (`url`, `http`,
// `https`, `events`, `util`) that Metro cannot resolve. The browser build
// bundles its own dependencies and works on React Native's XHR/WebSocket
// runtimes. Packages carrying an explicit `react-native` condition (e.g.
// node-fetch-native) still win over `browser`.
config.resolver.unstable_conditionNames = [
  ...config.resolver.unstable_conditionNames,
  'browser',
];

module.exports = config;
