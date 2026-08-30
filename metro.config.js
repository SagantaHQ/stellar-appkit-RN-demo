/**
 * Metro config for the demo.
 *
 * Customizations:
 * 1. Stubbing browser-only peer dependencies of @saganta/stellar-appkit
 *    (the Trezor hardware-wallet SDK).
 * 2. Mapping the bare Node `crypto` specifier onto src/node-crypto-shim.js
 *    (createHash via @noble/hashes) so the vendored siws-verify package —
 *    whose signature verifier pre-hashes candidate messages — runs on RN.
 * 3. Direct file resolution for the WalletConnect crypto tree's deep CJS
 *    subpaths (@noble/hashes, uint8arrays, multiformats) — see the
 *    DEEP_CJS_PACKAGES section below for why.
 */
const { getDefaultConfig } = require('expo/metro-config');
const fs = require('node:fs');
const path = require('node:path');

const config = getDefaultConfig(__dirname);

const RN_BROWSER_STUBS = new Set([
  '@trezor/connect-web',
  '@trezor/connect-plugin-stellar',
]);

// ---------------------------------------------------------------------------
// Deep-CJS subpath resolver for the WalletConnect dependency tree.
//
// WHY: the crypto packages WalletConnect depends on (@noble/hashes,
// uint8arrays, multiformats) publish `exports` maps whose condition targets
// are nested CJS files — "./from-string" -> "./cjs/src/from-string.js",
// "./crypto" -> "./crypto.js" — that are NOT themselves keys of the `exports`
// map (@noble/curves, by contrast, lists both "./ed25519" and "./ed25519.js",
// which is why it never warns). Metro expands the target, re-validates it
// against the same `exports` map, fails, and logs on every cold start:
//
//   WARN Attempted to import the module ".../uint8arrays/cjs/src/from-string.js"
//   which is not listed in the "exports" of "uint8arrays" under the requested
//   subpath "./cjs/src/from-string.js". Falling back to file-based resolution.
//
// The fallback lands on the right file, so the warnings are cosmetic — but
// there are five of them on every startup and they look like errors. Older
// WalletConnect releases also import some of these deep paths literally
// ("uint8arrays/cjs/src/from-string.js"), which triggers the same warning
// through the same code path. Resolving these specifiers straight to their
// files here skips the exports dance entirely: same module, zero warnings,
// works identically for fresh and stale installs.
const DEEP_CJS_PACKAGES = new Set(['@noble/hashes', 'uint8arrays', 'multiformats']);

/** Split "@scope/pkg/sub/path" / "pkg/sub/path" into { pkg, sub }. */
function splitPkgSub(moduleName) {
  const parts = moduleName.split('/');
  if (moduleName.startsWith('@')) {
    if (parts.length < 3) return null; // bare scoped package ("@scope/pkg")
    return { pkg: `${parts[0]}/${parts[1]}`, sub: parts.slice(2).join('/') };
  }
  if (parts.length < 2) return null; // bare package ("uint8arrays")
  return { pkg: parts[0], sub: parts.slice(1).join('/') };
}

/** Nearest node_modules/<pkg> walking up from the importing file. */
function nearestPackageDir(originDir, pkg) {
  let dir = originDir;
  for (;;) {
    const candidate = path.join(dir, 'node_modules', pkg);
    if (fs.existsSync(path.join(candidate, 'package.json'))) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** Resolve a deep-CJS specifier directly to a file, or null to opt out. */
function resolveDeepCjs(originModulePath, moduleName) {
  const split = splitPkgSub(moduleName);
  if (!split || !DEEP_CJS_PACKAGES.has(split.pkg)) return null;
  const pkgDir = nearestPackageDir(path.dirname(originModulePath), split.pkg);
  if (!pkgDir) return null;
  const withExt = /\.(js|cjs|mjs)$/.test(split.sub) ? split.sub : `${split.sub}.js`;
  // Order mirrors what Metro's file fallback picks today: the exact path
  // first (stale trees request these literally), then the package's CJS
  // build, then its ESM build.
  for (const rel of [withExt, path.join('cjs/src', withExt), path.join('esm/src', withExt)]) {
    const filePath = path.join(pkgDir, rel);
    if (fs.existsSync(filePath)) return { type: 'sourceFile', filePath };
  }
  return null;
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (RN_BROWSER_STUBS.has(moduleName)) {
    // `type: 'empty'` makes Metro resolve the module to an empty shim.
    return { type: 'empty' };
  }
  // Bare Node 'crypto' → the noble-backed shim. Only app-land code requests
  // it (siws-verify's createHash calls); Metro never needs Node crypto itself.
  if (moduleName === 'crypto' || moduleName === 'node:crypto') {
    return { type: 'sourceFile', filePath: path.join(__dirname, 'src/node-crypto-shim.js') };
  }
  if (context.originModulePath) {
    const direct = resolveDeepCjs(context.originModulePath, moduleName);
    if (direct) return direct;
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
