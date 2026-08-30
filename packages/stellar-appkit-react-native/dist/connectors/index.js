/**
 * Default connector set for React Native.
 *
 * Core's `defaultConnectors()` registers the seven browser-side connectors
 * (Freighter extension, Albedo popup, xBull bridge, Ledger WebHID, Rabet,
 * Klever, HOT). Their `typeof window` guards were written for SSR — React
 * Native *defines* `window`, so on RN they'd all claim to be available and
 * then fail at connect time inside popup/extension code paths.
 *
 * On RN the wallet surface is different by nature:
 * - **WalletConnect** is THE mobile path — Freighter Mobile and LOBSTR pair
 *   over the WalletConnect relay; the pairing URI is delivered via `onUri`,
 *   which the RN modal turns into a deep link (Solana-Mobile-Adapter-style)
 *   or a QR code.
 * - **Albedo (WebView)** bridges Albedo's web confirm flow into an in-app
 *   WebView — register it only if you also install `react-native-webview`
 *   and pass a bridge (the `./albedo` entry provides one).
 * - **xBull (WebView)** bridges the xBull web wallet (wallet.xbull.app) the
 *   same way — xBull has no native app and isn't in the WalletConnect
 *   Explorer's Stellar namespace, so the WebView popup protocol is its only
 *   mobile surface. Register it only if you pass `xbullBridge` (the `./xbull`
 *   entry provides one).
 *
 * Browser extensions and hardware transports are simply not registered —
 * their reachability then reports `not-installed`/`unavailable` honestly if
 * an app ever registers them manually.
 */
import { createWalletConnectConnector, } from '@saganta/stellar-appkit';
import { createAlbedoWebViewConnector } from './albedo-webview.js';
import { createXBullWebViewConnector } from './xbull-webview.js';
/**
 * The React Native default connector set: WalletConnect (+ optional
 * Albedo WebView + optional xBull WebView). Order matters — WalletConnect
 * is pinned first by the registry's sort, matching the web modal's behavior.
 */
export function defaultReactNativeConnectors(opts) {
    const connectors = [
        createWalletConnectConnector({
            projectId: opts.projectId,
            onUri: opts.onUri,
            storage: opts.storage,
            metadata: opts.metadata,
            logger: opts.logger,
        }),
    ];
    if (opts.albedoBridge) {
        connectors.push(createAlbedoWebViewConnector({
            bridge: opts.albedoBridge,
            origin: opts.albedoOrigin ?? 'https://example.com',
        }));
    }
    if (opts.xbullBridge) {
        connectors.push(createXBullWebViewConnector({
            bridge: opts.xbullBridge,
            origin: opts.xbullOrigin ?? 'https://example.com',
        }));
    }
    return connectors;
}
export { createAlbedoWebViewConnector, ALBEDO_FRONTEND_URL } from './albedo-webview.js';
export { createXBullWebViewConnector, XBULL_WALLET_URL } from './xbull-webview.js';
//# sourceMappingURL=index.js.map