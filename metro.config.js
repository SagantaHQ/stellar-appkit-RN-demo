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

// ---------------------------------------------------------------------------
// Disable Metro's lazy bundle splitting on native platforms.
//
// WHY: React Native 0.86+ dev clients request bundles with `?lazy=true`.
// Metro then EXCLUDES every dynamic `import()` subtree from the main bundle
// (the core SDK lazy-imports @walletconnect/sign-client, @stellar/stellar-sdk,
// @stellar/freighter-api, ...) and serves each subtree later as a separate
// HTTP bundle, fetched on first use — e.g. when the user taps "Connect
// Freighter". Those split bundles get their OWN module-id space, and the ids
// only line up with the main bundle while Metro's in-memory graph matches the
// client's cached build. After a Metro restart, a cache clear, or any
// node_modules churn, the split bundle is rebuilt with fresh ids — colliding
// with (or missing from) the running module table. The result at runtime is
//
//   ERROR  [Error: Requiring unknown module "1407". If you are sure the
//   module exists, try restarting Metro. ...]
//
// thrown from the middle of SignClient.init(), together with a mystery
// secondary bundle build logged as e.g.
//
//   Android Bundled 30868ms node_modules/@walletconnect/sign-client/dist/index.js (1308 modules)
//
// Stripping `lazy=true` from native requests makes Metro inline the whole
// graph into one bundle: `asyncRequire` finds no split paths and falls back
// to a synchronous require of modules that are already registered. No
// runtime bundle fetches, no cross-request id contract, no crash — and the
// first connect no longer blocks on a cold 30s split-bundle build.
const baseRewriteRequestUrl = config.server.rewriteRequestUrl;

function stripLazyParam(url) {
  if (!/[?&]lazy=true\b/.test(url)) return url;
  const isRelative = url.startsWith('/');
  const parsed = new URL(url, isRelative ? 'https://acme.dev' : undefined);
  const platform = parsed.searchParams.get('platform');
  // Only native: web dev tooling legitimately uses split chunks (preloaded
  // via <script> tags), and this demo targets Expo Go / dev clients anyway.
  if (platform === 'web') return url;
  parsed.searchParams.delete('lazy');
  return isRelative ? parsed.pathname + parsed.search : parsed.href;
}

config.server.rewriteRequestUrl = (url) => {
  const rewritten = baseRewriteRequestUrl ? baseRewriteRequestUrl(url) : url;
  return stripLazyParam(rewritten);
};

module.exports = config;
