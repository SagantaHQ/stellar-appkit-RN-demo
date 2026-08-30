/**
 * WebViewToolbar — the browser-chrome row for the in-app WebView screens
 * (Albedo confirm, xBull wallet).
 *
 * WHY: a bare `react-native-webview` is a page, not a browser. Out of the
 * box the screens had a single "Cancel" button — no way to see WHICH origin
 * is asking for your keys, copy the page URL, recover a half-loaded page, or
 * bail out to the real browser with its full feature set (find-in-page,
 * reader, password managers, …). This row adds the four affordances every
 * browser tab has, in the package's zero-native-dependency style:
 *
 *   [Cancel]  [ albedo.link/confirm  ⧉ ]   [↻] [↗]
 *
 * - **URL chip** — host + path of the current page (query and fragment are
 *   deliberately NOT shown: pairing URIs and session tokens ride in them,
 *   and the security-relevant part is the origin). Tap = copy the full URL
 *   (see ./clipboard.ts), with a 1.5s check-glyph confirmation like the
 *   account view's address copy.
 * - **Reload** — `webviewRef.reload()`; the screens reset their handshake
 *   state on the fresh load so the flow restarts cleanly.
 * - **Open in browser** — hands the URL to the OS browser via `Linking`
 *   (full browser features on demand). The WebView stays mounted underneath
 *   — the protocol flow continues in-app; this is an inspection/ease escape
 *   hatch, not a handoff.
 */
import React from 'react';
/**
 * Formats a URL for the toolbar chip: `host + path`, no query, no fragment,
 * truncated with a trailing ellipsis at `max` characters. The host leads so
 * the security-relevant part always stays visible. Non-URL inputs pass
 * through (truncated) — the chip never crashes on an odd `nav.url`.
 */
export declare function formatUrlChip(url: string, max?: number): string;
export interface WebViewToolbarProps {
    /** The current page URL — displayed, copied, and opened externally. */
    url: string;
    /** Left action — cancel/close the whole flow (screens map this to their fail path). */
    onCancel: () => void;
    /** Reload the WebView (screens also reset their handshake state on the fresh load). */
    onReload: () => void;
    /** Light/dark chrome; defaults to dark like the web modal. */
    dark?: boolean;
    /** Cancel label override — defaults to the localized `action.cancel`. */
    cancelLabel?: string;
}
export declare function WebViewToolbar({ url, onCancel, onReload, dark, cancelLabel }: WebViewToolbarProps): React.JSX.Element;
//# sourceMappingURL=WebViewToolbar.d.ts.map