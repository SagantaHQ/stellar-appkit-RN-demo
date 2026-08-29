/**
 * Albedo WebView bridge — the React Native implementation of
 * `AlbedoWebViewBridge` from the headless entry.
 *
 * Renders a full-screen modal WebView hosting Albedo's confirm page and
 * reproduces the web popup protocol:
 *
 *  1. `injectedJavaScriptBeforeContentLoaded` shims `window.opener` so every
 *     `(window.opener || window.parent).postMessage(...)` Albedo makes is
 *     forwarded to RN via `window.ReactNativeWebView.postMessage`.
 *  2. Once the page signals readiness (`{albedo: {protocol}}`), we deliver
 *     the intent params as a synthetic `MessageEvent` — byte-for-byte what
 *     `window.open(...).postMessage(params, '*')` would have delivered.
 *  3. The user confirms in Albedo's own UI; the result arrives at our shim.
 *
 * Security notes:
 * - The WebView is locked to `https://albedo.link/` (navigation guard).
 * - `origin` is sent with the intent so Albedo can display the requesting
 *   app and run its stoplist check, exactly like on the web.
 * - The bridge resolves a single intent per open — no ambient session.
 */
import React from 'react';
import type { AlbedoWebViewBridge } from '../connectors/albedo-webview.js';
/**
 * Creates the bridge object to pass to `createAlbedoWebViewConnector()` /
 * `defaultReactNativeConnectors({ albedoBridge })`. One active intent at a
 * time; the modal hosting the WebView must be rendered by your app:
 *
 * ```tsx
 * const [bridgeEl, setBridgeEl] = useState<React.ReactElement | null>(null);
 * const bridge = useMemo(() => createAlbedoWebViewBridge((el) => setBridgeEl(el)), []);
 * // ...register connector with `bridge`, and render `{bridgeEl}` at your root.
 * ```
 */
export declare function createAlbedoWebViewBridge(render: (element: React.ReactElement | null) => void): AlbedoWebViewBridge;
export interface AlbedoWebViewScreenProps {
    url: string;
    params: Record<string, unknown>;
    onResult: (result: Record<string, unknown>) => void;
    onFail: (error: Error) => void;
    /** Light/dark chrome; defaults to dark like the web modal. */
    dark?: boolean;
}
export declare function AlbedoWebViewScreen({ url, params, onResult, onFail, dark }: AlbedoWebViewScreenProps): React.JSX.Element;
//# sourceMappingURL=AlbedoWebViewScreen.d.ts.map