import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * In-app web browser — the WebView surface for plain http(s) handoffs
 * (explorer links, wallet install pages, docs, footer links).
 *
 * WHY the WebView and NOT Chrome Custom Tabs / SFSafariViewController
 * (the previous surface, since reverted):
 *
 * - **It can't complete wallet protocols.** A Custom Tab has no
 *   `window.opener` and no message channel back into the app — any
 *   postMessage-coupled flow (Albedo's confirm page, xBull's popup
 *   protocol) cannot even start there. Only the WebView bridges (which
 *   shim `window.opener`) can run those in-app.
 * - **It doesn't exist in Expo Go.** `react-native-inappbrowser-reborn`'s
 *   native module ships only in dev-client / standalone builds; the demo's
 *   primary environment is Expo Go, where every open silently degraded to
 *   the next surface anyway. The WebView works everywhere — Expo Go,
 *   dev-client, EAS, bare.
 * - **It stays in-app.** The URL chip (tap-to-copy), Reload and the
 *   toolbar affordances carry over from the Albedo/xBull screens, so
 *   explorer/install pages get the same browser chrome instead of
 *   bouncing the user out to the OS browser.
 *
 * The one real Custom-Tab advantage — WebAuthn passkeys (WKWebView does
 * not implement them) — is served by the toolbar's "Open in browser"
 * button: a page that needs a passkey is one tap away from the system
 * browser with its full feature set.
 *
 * The surface is INJECTED, not imported: Metro resolves every static
 * require at bundle time, so a library-level `require('react-native-webview')`
 * would break apps that don't have the package installed — the same
 * dependency-injection pattern as the Albedo/xBull bridges. The app renders
 * the screen element this module hands it (at the app root, so it can cover
 * whatever is on screen) and passes the session to the modal:
 *
 * ```tsx
 * const [browserView, setBrowserView] = useState<ReactElement | null>(null);
 * const browser = useMemo(() => createWebBrowser(setBrowserView), []);
 * // ...render {browserView} at the root, and:
 * <AppKitModal client={appkit} open={open} onClose={close} browser={browser} />
 *
 * await browser.open('https://stellar.expert'); // resolves 'closed' on dismiss
 * ```
 *
 * Albedo and xBull keep their dedicated WebView bridges (this module is for
 * plain pages, not protocols): their screens reset handshake state on
 * navigation and resolve one intent per open.
 */
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { WebViewToolbar } from './WebViewToolbar.js';
/** http(s) URLs only — what the screen's navigation guard admits. */
export function isHttpUrl(url) {
    return /^https?:\/\//i.test(url);
}
/**
 * The generic in-app browser page: full-screen Modal > toolbar + WebView.
 * Navigation is free within http(s) (install pages redirect around); every
 * other scheme is blocked — a page that wants a custom scheme is a job for
 * the toolbar's "Open in browser" button, not a silent OS handoff.
 */
export function WebBrowserScreen({ url, onClose, dark = true }) {
    const [currentUrl, setCurrentUrl] = useState(url);
    const [loading, setLoading] = useState(true);
    const webviewRef = useRef(null);
    const bg = dark ? '#09090B' : '#FFFFFF';
    const guardNavigation = useCallback((nav) => {
        return isHttpUrl(nav.url);
    }, []);
    const handleNavigationState = useCallback((nav) => {
        setCurrentUrl(nav.url);
        setLoading(nav.loading);
    }, []);
    return (_jsx(Modal, { visible: true, animationType: "slide", onRequestClose: onClose, children: _jsxs(View, { style: [styles.container, { backgroundColor: bg }], children: [_jsx(WebViewToolbar, { url: currentUrl, dark: dark, cancelLabel: "Close", onCancel: onClose, onReload: () => webviewRef.current?.reload() }), _jsx(WebView, { ref: webviewRef, source: { uri: url }, onShouldStartLoadWithRequest: guardNavigation, onNavigationStateChange: handleNavigationState, javaScriptEnabled: true, domStorageEnabled: true, setSupportMultipleWindows: false, allowsBackForwardNavigationGestures: true, textInteractionEnabled: true, renderLoading: () => (_jsx(View, { style: [styles.loader, { backgroundColor: bg }], children: _jsx(ActivityIndicator, {}) })) }), loading && (_jsx(View, { style: [styles.loader, { backgroundColor: bg }], pointerEvents: "none", children: _jsx(ActivityIndicator, {}) }))] }) }));
}
const styles = StyleSheet.create({
    container: { flex: 1 },
    loader: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
/**
 * Creates the in-app web browser session. `render` receives the screen
 * element to mount at the app root (or `null` to unmount) — the same
 * element-injection contract as the Albedo/xBull bridges:
 *
 * ```tsx
 * const [el, setEl] = useState<ReactElement | null>(null);
 * const browser = useMemo(() => createWebBrowser(setEl), []);
 * // render {el} at the root
 * ```
 */
export function createWebBrowser(render, opts) {
    let resolveCurrent = null;
    const settle = (result) => {
        const resolve = resolveCurrent;
        resolveCurrent = null;
        resolve?.(result);
    };
    const close = () => {
        if (!resolveCurrent)
            return;
        render(null);
        settle('closed');
    };
    return {
        open(url) {
            if (!isHttpUrl(url)) {
                // Custom schemes can't load in a WebView — refuse instead of
                // rendering a dead screen. (The modal never routes deep links here.)
                return Promise.reject(new Error(`The in-app browser only opens http(s) URLs, got: ${url}`));
            }
            // One page at a time: a pending open resolves — the user is moving on.
            if (resolveCurrent) {
                render(null);
                settle('closed');
            }
            return new Promise((resolve) => {
                resolveCurrent = resolve;
                render(_jsx(WebBrowserScreen, { url: url, dark: opts?.dark ?? true, onClose: () => {
                        render(null);
                        settle('closed');
                    } }));
            });
        },
        close,
    };
}
//# sourceMappingURL=web-view-browser.js.map