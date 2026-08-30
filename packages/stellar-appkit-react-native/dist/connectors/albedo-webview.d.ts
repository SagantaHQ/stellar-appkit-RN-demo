/**
 * Albedo connector for React Native — same intents as the web connector,
 * but the popup window is replaced by an in-app WebView.
 *
 * Why a WebView bridge? Albedo has no native app and no deep link. Its web
 * flow is a popup at `https://albedo.link/confirm` that talks to the opener
 * via `window.postMessage`. On React Native we reproduce exactly that
 * protocol inside a `react-native-webview`:
 *
 *   1. Load `https://albedo.link/confirm`.
 *   2. Before content: shim `window.opener` so the page's
 *      `(window.opener || window.parent).postMessage(...)` replies are routed
 *      to `window.ReactNativeWebView.postMessage` → RN `onMessage`.
 *   3. After load: dispatch the intent params as a synthetic `message` event
 *      (what `window.opener.postMessage(params, '*')` would have delivered).
 *   4. The user confirms in Albedo's own UI; the response arrives at our shim.
 *
 * This connector is deliberately **headless** — it accepts an
 * `AlbedoWebViewBridge` implementation, so:
 *   - Apps with their own UI pass any `open(url, params) → Promise<result>`.
 *   - Apps using our modal pass `@saganta/stellar-appkit-react-native/albedo`'s
 *     `createReactNativeWebViewBridge()`, which renders the WebView screen.
 *
 * Result parsing mirrors core's web albedo connector 1:1 (same intents:
 * `public_key`, `tx`, `sign_message`), so server-side verification via
 * `@saganta/stellar-appkit-siws-verify` works identically on both platforms.
 */
import type { WalletConnector } from '@saganta/stellar-appkit';
/** Albedo's frontend origin — the only origin the WebView should load. */
export declare const ALBEDO_FRONTEND_URL = "https://albedo.link/confirm";
/**
 * Headless bridge contract: open the Albedo confirm page, deliver the intent
 * params, resolve with Albedo's raw response object (or reject on close/
 * navigation failure). Implemented by the WebView screen in `./albedo`, or
 * by the app's own UI.
 */
export interface AlbedoWebViewBridge {
    openIntent(url: string, params: Record<string, unknown>): Promise<Record<string, unknown>>;
}
export interface AlbedoWebViewConnectorOptions {
    /** Bridge that renders the Albedo confirm page (e.g. the WebView screen from `./albedo`). */
    bridge: AlbedoWebViewBridge;
    /**
     * The app's origin, sent with the intent (Albedo shows it to the user as
     * the requesting app and uses it for stoplist checks). Derive it from your
     * `appMetadata.url` — must be an absolute URL.
     */
    origin: string;
}
export declare function createAlbedoWebViewConnector(opts: AlbedoWebViewConnectorOptions): WalletConnector;
//# sourceMappingURL=albedo-webview.d.ts.map