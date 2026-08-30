/**
 * xBull WebView bridge — the React Native implementation of
 * `XBullWebViewBridge` from the headless connector.
 *
 * Renders a full-screen modal WebView hosting the xBull web wallet
 * (https://wallet.xbull.app/connect) and reproduces the web popup protocol:
 *
 *  1. `injectedJavaScriptBeforeContentLoaded` shims `window.opener` — the
 *     wallet posts every reply through the bare `opener` global
 *     (`opener.postMessage({type, message, oneTimeCode, publicKey,
 *     success}, '*')`, verified against the live wallet bundle). The shim
 *     forwards those objects to RN via
 *     `window.ReactNativeWebView.postMessage(JSON.stringify(msg))`.
 *  2. Requests travel the other way as synthetic `MessageEvent`s — exactly
 *     what `window.open(...).postMessage(payload, '*')` would have delivered
 *     to the popup. The `origin` of each event is forged from the app's
 *     configured origin so the wallet displays the real requesting app.
 *  3. The user approves in xBull's own UI; the encrypted reply arrives at
 *     our shim.
 *
 * Security notes:
 * - The WebView is locked to `https://wallet.xbull.app/` (navigation guard)
 *  — the wallet may internally route to its own sub-pages (create-account,
 *  no-wallet, …), all on the same origin.
 * - Only encrypted, session-bound traffic crosses the boundary (nacl box,
 *  see the connector); the WebView never sees plaintext requests.
 * - One operation per screen instance — the connector closes the WebView
 *  after each request cycle, mirroring the web SDK's popup lifecycle.
 *
 * The screen carries a browser toolbar (WebViewToolbar): the current URL
 * chip with tap-to-copy, Reload, and Open-in-browser — the browser
 * affordances a bare WebView lacks.
 */
import React from 'react';
import type { XBullWebViewBridge, XBullWalletHandle, XBullWalletMessage } from '../connectors/xbull-webview.js';
/**
 * Creates the bridge object to pass to `createXBullWebViewConnector()` /
 * `defaultReactNativeConnectors({ xbullBridge })`. One active wallet screen
 * at a time; the modal hosting the WebView must be rendered by your app:
 *
 * ```tsx
 * const [xbullView, setXBullView] = useState<React.ReactElement | null>(null);
 * const xbullBridge = useMemo(() => createXBullWebViewBridge((el) => setXBullView(el)), []);
 * // ...register the connector with `bridge`, and render `{xbullView}` at your root.
 * ```
 */
export declare function createXBullWebViewBridge(render: (element: React.ReactElement | null) => void): XBullWebViewBridge;
export interface XBullWebViewScreenProps {
    /** The wallet connect URL (already carries `public` + `session` params). */
    url: string;
    /** Called with every message the wallet posts (JSON-parsed). */
    onMessage: (msg: XBullWalletMessage) => void;
    /** Called when the user dismisses the WebView before completing. */
    onClosed: () => void;
    /** Called once the WebView ref is live — delivers the request handle. */
    onReady: (handle: XBullWalletHandle) => void;
    /** Unmounts this screen (the bridge's `render(null)`). */
    onUnmount: () => void;
    /** Light/dark chrome; defaults to dark like the web wallet. */
    dark?: boolean;
}
export declare function XBullWebViewScreen({ url, onMessage, onClosed, onReady, onUnmount, dark, }: XBullWebViewScreenProps): React.JSX.Element;
//# sourceMappingURL=XBullWebViewScreen.d.ts.map