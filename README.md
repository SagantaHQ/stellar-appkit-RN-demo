# Stellar AppKit · React Native / Expo Demo

The official React Native demo for
**[@saganta/stellar-appkit-react-native](https://github.com/SagantaHQ/stellar-appkit)** —
Stellar AppKit's wallet-connection layer running inside **Expo Go, with no native build step at all**.

Connect a Stellar wallet — Freighter, LOBSTR, HOT Wallet or Scopuly straight from deep links,
17 more WalletConnect-registered wallets (SafePal, Blockchain.com, Arculus, …) under "More wallets",
Albedo through an in-app WebView — inspect the session,
sign a message, and sign a real TESTNET payment, all through the same themed bottom-sheet modal
the web SDK ships. Every wallet shows its own name and icon end-to-end.

| | |
|---|---|
| **Stack** | Expo SDK 57 · React Native 0.86 · React 19 · TypeScript (strict) |
| **Runtime** | Expo Go — no `expo prebuild`, no Xcode/Android Studio, no EAS build required |
| **Network** | Stellar TESTNET |
| **Wallets** | Freighter · LOBSTR · HOT Wallet · Scopuly (featured deep links) · 17 more WC-registered wallets (SafePal, Blockchain.com, Arculus, …) · Albedo (WebView) |

---

## Quickstart

**Prerequisites:** Node 20+, a phone with the [Expo Go app](https://expo.dev/go) installed, and a
Stellar TESTNET wallet ([Freighter Mobile](https://freighter.app), [LOBSTR](https://lobstr.co), or an
[Albedo](https://albedo.link) account).

```bash
git clone https://github.com/SagantaHQ/stellar-appkit-RN-demo.git
cd stellar-appkit-RN-demo
npm install

# (recommended) enable WalletConnect pairing — see next section
cp .env.example .env
# ... put your WalletConnect project id into .env ...

npx expo start
```

Scan the QR code with Expo Go (iOS: Camera app; Android: from inside Expo Go) and the demo loads.

> No WalletConnect project id? The demo still runs end-to-end — it registers only the Albedo
> (WebView) connector and shows a banner explaining how to enable the rest.

### Enabling WalletConnect pairing (2 minutes, free)

The mobile wallets (Freighter, LOBSTR, HOT Wallet, Scopuly) pair over the WalletConnect relay,
which requires a project id:

1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com) and create a project.
2. Copy the project id into `.env`:
   ```
   EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. Restart `npx expo start` (Expo inlines `EXPO_PUBLIC_*` variables at bundle time).

---

## What the demo exercises

- **Connect flow** — `AppKitModal` (a `@gorhom/bottom-sheet`) with a web-parity wallet list
  (flat rounded rows, 40dp squircle tiles with drop shadow, "Installed" outline badges, accent
  Install pills): the featured Stellar wallets (tap Freighter / LOBSTR / HOT Wallet / Scopuly →
  deep link `freighterwallet://wc?uri=…` etc., with universal-link and store fallbacks) plus
  every other WalletConnect-registered mobile wallet under a collapsible "More wallets"
  section, and the Albedo WebView screen. Pairing is deep-link only — on a phone the same
  device would have to scan a QR code, so the modal never shows one. The connecting and
  account views carry
  the wallet's own name and icon (WalletConnect peer metadata), never a generic label.
- **1:1 web-modal UI** — the modal's screens match the web SDK's specs exactly: the
  squircle dash-arc spinner (the web's traveling-dash rounded square — not a circle —
  rebuilt with pure Views, 2s connecting / 0.8s signing, reduced-motion aware), the
  back-arrow header while connecting or on errors (back returns to the wallet list),
  web error routing (a declined connect stays on the connecting view with a Try-again
  pill; a rejected sign shows Cancel + Try again; wrong-network gets its own view),
  the staggered entrance animations and the "Powered by Stellar AppKit" footer.
- **Modal presentation toggle** — "Modal presentation" switches between the default
  bottom sheet and `mode="inline"`: the same panel embedded in the page as a bordered
  card (web `mode="inline"` parity — no overlay, no close button, always visible).
- **Session** — address, wallet identity, live TESTNET balance from Horizon,
  `AsyncStorage`-backed persistence (sessions survive app restarts).
- **`signMessage()`** — signs the demo message through the connected wallet and shows the
  signature plus `signedData` (the exact bytes the wallet signed — what a SIWS verifier needs).
- **`signTransaction()`** — fetches your account sequence from TESTNET Horizon, builds a
  `0.0001 XLM` self-payment with `@stellar/stellar-sdk`, and routes the XDR through AppKit's
  signing queue (the modal switches to its signing view and, for deep-link pairings, offers to
  reopen the wallet app).
- **SIWS-ready UI** — the vendored modal ships the full Sign-In-With-Stellar flow
  (checking session → fetching nonce → approve in wallet → verifying, with retry caps and
  per-step timeouts, phase for phase like the web modal). This demo doesn't run a backend
  verifier, so it isn't wired into the client config — pass `siws` to `StellarAppKit` in
  `src/appkit.tsx` to see it.
- **Theming** — all 10 modal themes (`minimal/stellar/sky/ocean/sunset` × dark/light) applied
  live to the modal *and* the host screen, to show that the tokens are the same as the web SDK's.

---

## How the integration is wired

The interesting files, in the order the app loads them:

| File | What it shows |
|---|---|
| `index.ts` | Entry point — imports `./src/polyfills` **before** everything else. |
| `src/polyfills.ts` | The Expo Go-safe polyfill dance (see below). |
| `src/appkit.tsx` | One `StellarAppKit` client: `defaultReactNativeConnectors()`, `createAsyncStorage(AsyncStorage)`, the Albedo WebView bridge, theme state. |
| `App.tsx` | Root wiring: `GestureHandlerRootView` (required by bottom-sheet), the always-mounted modal, and `{albedoView}` at the root. |
| `src/stellar.ts` | Building the demo transaction — plain Horizon `fetch` + stellar-sdk (AppKit signs; building XDR is your app's job). |
| `src/screens/HomeScreen.tsx` | The demo UI and both sign flows. |
| `metro.config.js` | Two Expo Go-specific resolver tweaks (see below). |

### Polyfills, Expo Go edition

`installPolyfills()` from `@saganta/stellar-appkit-react-native/polyfills` installs `Buffer`,
`crypto.getRandomValues`, and the WalletConnect RN compat shims. Its random fallback is the
`react-native-get-random-values` **native module, which is not part of Expo Go** — so the demo
shims `crypto.getRandomValues` from `expo-crypto` (which *is*) first, and `installPolyfills()`
then detects the global already exists and never touches the native module. The package still
needs to be installed, because Metro resolves every static `require` at bundle time — it just
never executes.

### Why `file:` packages?

`@saganta/stellar-appkit-react-native` is not on npm yet (publish pending). Both it and its core
dependency are **vendored** under `packages/` and referenced as `file:` dependencies:

```
packages/stellar-appkit              ← @saganta/stellar-appkit (core, Metro-safe build)
packages/stellar-appkit-react-native ← the RN package (prebuilt dist/ included)
```

`npm install` copies them into `node_modules` like any other dependency, and EAS build/update
does the same on the cloud. To refresh the vendored copies from a local stellar-appkit checkout:

```bash
node scripts/sync-vendored-package.mjs /path/to/stellar-appkit
bun install   # or: npm install
```

The sync script strips `devDependencies`, `peerDependencies` and `scripts` from the vendored
copies — critically so. The library's devDependencies (its test toolchain, `react-native ^0.78`)
and peers must never install into the demo: **bun auto-installs them nested inside its copy of
a `file:` package** (even when the peers are marked optional), and Metro — resolving through
`packages/` — would then bundle that second react-native beside Expo SDK 57's, crashing Expo Go
at startup with `TurboModuleRegistry.getEnforcing('PlatformConstants') could not be found`.
After any sync, regenerate **both** lockfiles (`rm -rf node_modules bun.lock package-lock.json
&& bun install`) so no stale manifest survives in a lock.

Once the packages are published, swap both `file:` entries for regular version ranges and
delete `packages/`.

### The two Metro tweaks (`metro.config.js`)

1. **Trezor stubs** — core's Trezor connector lazily imports `@trezor/connect-web` /
   `@trezor/connect-plugin-stellar` (browser-only peer deps, never instantiated on RN). Metro
   still resolves every visible `import()` at bundle time, so they're stubbed with
   `{ type: 'empty' }`.
2. **`browser` condition on native** — `@stellar/stellar-sdk`'s `exports` map points native
   platforms at its Node build, whose `eventsource` dependency needs Node builtins Metro can't
   resolve. Adding the `browser` condition makes it resolve to its self-contained
   `dist/stellar-sdk.min.js` (the same build the legacy `browser` field already selected before
   `exports` support). Packages that ship an explicit `react-native` condition still win.

---

## Hosting on Expo Cloud (EAS)

The app is preconfigured for EAS Update with the `sdkVersion` runtime policy — updates published
to EAS open directly in Expo Go via a link/QR, no store build needed.

```bash
npm i -g eas-cli
eas login

# one-time: create the EAS project and wire the ids into app.json
eas init                      # prints a projectId — app.json's placeholders
                              # ("REPLACE_WITH_YOUR_EAS_PROJECT_ID") must be updated with it
eas update:configure          # sets updates.url; keep runtimeVersion.policy as "sdkVersion"

# publish an update people can open in Expo Go
eas update --branch preview --message "Initial demo"
```

The published update gets a link like `https://expo.dev/@<user>/stellar-appkit-rn-demo` (plus a
QR code) — open it on a phone and it launches straight into the demo in Expo Go.

Notes:

- `runtimeVersion.policy` is intentionally **`sdkVersion`** (set in `app.json`) so updates run in
  Expo Go. If `eas update:configure` rewrites it to `appVersion`, set it back — `appVersion`
  only works for standalone builds.
- `eas.json` also includes `preview` / `production` build profiles if you ever want a standalone
  binary (APK via `eas build -p android --profile preview`). For that path, add `expo-updates`
  and switch the runtime policy to `fingerprint`.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Unable to resolve module @trezor/connect-web` (custom setups) | Keep the `metro.config.js` stubs — see the comments in that file. |
| `crypto.getRandomValues` errors | Make sure `./src/polyfills` is imported before anything else in `index.ts`. |
| WalletConnect pairing says "Project not found" / code 3000 | Wrong/missing `EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID` — fix `.env` and fully restart the dev server. |
| Freighter button says the wallet isn't installed | Install [Freighter Mobile](https://freighter.app) (iOS App Store / Google Play) and try again. |
| "Account not found on TESTNET" | Your address was never funded on testnet — create a fresh account in your wallet (testnet mode) or fund it via [friendbot](https://friendbot.stellar.org). |
| Expo Go says the SDK is unsupported | Update the Expo Go app on your phone to the latest version (SDK 57). |
| `TurboModuleRegistry.getEnforcing('PlatformConstants') could not be found` | A second `react-native` got installed into the tree (bun nesting the vendored package's old devDependencies/peers). Run `rm -rf node_modules packages/stellar-appkit-react-native/node_modules bun.lock package-lock.json && bun install`, then `bunx expo start --clear`. Fixed at the source in the sync script — see "Why `file:` packages?" |
| `Requiring unknown module "<number>"` when connecting a wallet (often right after a long `Bundled … node_modules/@walletconnect/sign-client/dist/index.js (N modules)` line) | Metro's **lazy bundle splitting** (RN 0.86+/Expo 57 dev clients send `?lazy=true`) splits every dynamic `import()` subtree into a separate runtime-fetched bundle with its own module-id space. If Metro restarts or the graph drifts between the main bundle and the split bundle, the ids no longer line up and the running app dies on a missing id. **Already fixed in this repo** — `metro.config.js` strips `lazy=true` from native requests so the whole graph ships as one inline bundle. If you still see it: `git pull`, then `bunx expo start --clear`. If you use the npm packages in your own app, see the "Expo Go development" note in the React Native package README. |
| Metro warns `Attempted to import the module …/uint8arrays/cjs/src/from-string.js … not listed in the "exports" … Falling back to file-based resolution` (same for `multiformats/cjs/src/basics.js`, `@noble/hashes/crypto.js`) | **Harmless.** These come from deep imports inside the WalletConnect dependency tree (@walletconnect/utils → uint8arrays/multiformats, @noble/hashes's self-import of `./crypto.js`). Metro falls back to file-based resolution and the bundle works. Every WalletConnect-on-Metro app shows these warnings. |

---

## Links

- **Library:** [SagantaHQ/stellar-appkit](https://github.com/SagantaHQ/stellar-appkit)
- **Docs:** [stellar-appkit.saganta.com](https://stellar-appkit.saganta.com)
- **Demos (web):** [SagantaHQ/stellar-appkit-demos](https://github.com/SagantaHQ/stellar-appkit-demos)

Built by [Saganta](https://github.com/SagantaHQ). MIT — see [LICENSE](LICENSE).
