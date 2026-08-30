/**
 * Themed in-app browser for wallet flows — the system-browser surface:
 * Chrome Custom Tabs on Android, SFSafariViewController on iOS.
 *
 * WHY this exists (the WebView can't always be the answer):
 *
 * - **Passkeys / WebAuthn** — WKWebView does not implement WebAuthn (Apple
 *   reserves the platform authenticator for apps with the web-browser
 *   entitlement; "Apple does not support FIDO2 … using a WKWebView"), and
 *   Android WebView has no platform authenticator either. Chrome Custom
 *   Tabs and SFSafariViewController DO — "SFSafariViewControllers already
 *   support WebAuthn, they do not need custom configuration". Any web
 *   wallet whose login needs a passkey must therefore be opened in the
 *   system-browser surface, not the in-app WebView.
 * - **Shared browser session** — Custom Tabs share Chrome's cookies and
 *   SFSafariViewController shares Safari's: a wallet the user already
 *   unlocked in their browser is already unlocked here. The WebView starts
 *   from a clean cookie jar every install.
 * - **Lighter** — no WebView heap in your process; the OS owns the tab.
 *
 * THE PREFERENCE CHAIN (prefer the Chrome Tab over the "heavy" WebView
 * whenever it exists, detected via the same library):
 *
 *   1. `react-native-inappbrowser-reborn` — Custom Tabs/SFSafariVC with the
 *      full styling surface (modal pageSheet presentation on iOS, themed
 *      toolbars on Android), `isAvailable()` Chrome-Tab detection and
 *      `openAuth()` redirect interception. Needs a dev client / standalone
 *      build (its native module is not part of Expo Go).
 *   2. `expo-web-browser` — the same OS surfaces with toolbar theming and
 *      `openAuthSessionAsync` redirect interception, bundled with Expo Go.
 *   3. External browser via `Linking` — always available, leaves the app.
 *
 * Adapters are INJECTED, not imported: Metro resolves every static
 * require at bundle time, so a library-level `require('react-native-…')`
 * would break apps that don't have the package installed. The app passes
 * whichever modules it has (the same dependency-injection pattern as the
 * Albedo/xBull WebView bridges):
 *
 * ```ts
 * import InAppBrowser from 'react-native-inappbrowser-reborn';
 * import * as ExpoWebBrowser from 'expo-web-browser';
 *
 * const browser = createThemedBrowserSession(
 *   { reborn: InAppBrowser, expo: ExpoWebBrowser },
 *   { theme: stellarDark }        // any ConnectThemeRN — restyles the tab
 * );
 *
 * // Themed modal browser — resolves when the user dismisses the tab.
 * await browser.open('https://stellar.expert');
 *
 * // Redirect-intercepting session (for wallets with redirect callbacks).
 * const result = await browser.openAuth(url, 'myapp://wallet-callback');
 * if (result.type === 'success') parseResult(result.url);
 *
 * // Chrome Tab present? (reborn.isAvailable() / getCustomTabsSupportingBrowsers)
 * if (await browser.isChromeTabsAvailable()) { … }
 * ```
 *
 * WHY THE WEBVIEW STAYS FOR ALBEDO/xBULL: their protocols are
 * postMessage-coupled end to end. Albedo's confirm page receives the intent
 * request only via `window.postMessage` (the /confirm URL takes no query
 * params) and replies to `window.opener`; xBull's connect page replies via
 * the bare `opener` global with no redirect fallback. A Custom Tab has no
 * `window.opener` and no message channel back to the app — the flow cannot
 * even start there. The WebView bridges (which shim `window.opener`) remain
 * the only completable in-app surface for those two wallets; every plain
 * http(s) handoff (explorer links, wallet install pages, docs) moves to
 * this themed browser, and any wallet that adds redirect callbacks plugs
 * straight into `openAuth()`.
 */
/** Theme tokens the browser surfaces can apply. Any `ConnectThemeRN` fits. */
export interface BrowserThemeTokens {
    /** Android toolbar / iOS bar background. */
    colorSurface: string;
    /** Android secondary toolbar (the bottom bar) background. */
    colorBg: string;
    /** Android navigation-bar divider hairline. */
    colorBorder: string;
    /** iOS controls tint (close button, ...). */
    colorAccent: string;
}
/**
 * The `react-native-inappbrowser-reborn` module surface this package uses —
 * structurally typed so the app injects whatever it has installed.
 * (Return types are intentionally loose: the session normalizes them.)
 */
export interface RebornBrowserLike {
    open(url: string, options?: Record<string, unknown>): Promise<{
        type: string;
    }>;
    openAuth(url: string, redirectUrl: string, options?: Record<string, unknown>): Promise<{
        type: string;
        url?: string;
    }>;
    close(): void;
    closeAuth(): void;
    /** False when no Custom Tabs provider exists (Android) — the Chrome Tab detection. */
    isAvailable(): Promise<boolean>;
    warmup?(): Promise<unknown>;
    mayLaunchUrl?(url: string, extras?: unknown): void | Promise<unknown>;
}
/** The `expo-web-browser` module surface this package uses. */
export interface ExpoWebBrowserLike {
    openBrowserAsync(url: string, options?: Record<string, unknown>): Promise<{
        type: string;
    }>;
    openAuthSessionAsync(url: string, redirectUrl?: string | null, options?: Record<string, unknown>): Promise<{
        type: string;
        url?: string;
    }>;
    dismissBrowser(): Promise<unknown>;
    /** Expo Go-compatible Chrome Tab detection (Android). */
    getCustomTabsSupportingBrowsersAsync?(): Promise<{
        preferredBrowserPackage?: string | null;
        browserPackages?: string[];
    }>;
    warmUpAsync?(browserPackage?: string): Promise<unknown>;
    mayInitWithUrlAsync?(url: string, browserPackage?: string): Promise<unknown>;
    coolDownAsync?(browserPackage?: string): Promise<unknown>;
}
/** Normalized auth-session result both adapters produce. */
export type AuthSessionShape = {
    type: 'success';
    url: string;
} | {
    type: 'cancel' | 'dismiss';
};
/** Which system surface handled a call. */
export type BrowserSurface = 'reborn' | 'expo' | 'external';
export interface BrowserOpenResult {
    surface: BrowserSurface;
    /** 'cancel' — user dismissed the tab; 'opened' — external browser handed off. */
    type: 'cancel' | 'dismiss' | 'opened';
}
export type BrowserAuthResult = {
    surface: BrowserSurface;
    type: 'success';
    url: string;
} | {
    surface: BrowserSurface;
    type: 'cancel' | 'dismiss';
};
export interface ThemedBrowserOptions {
    /** Theming for the browser chrome (toolbars, tints). */
    theme?: BrowserThemeTokens;
    /**
     * Modal presentation — iOS renders SFSafariViewController as a `pageSheet`
     * (the sheet-like partial cover) instead of full screen. Default: true.
     */
    modal?: boolean;
    /** iOS dismiss-button style. Default: 'close'. */
    dismissButtonStyle?: 'done' | 'close' | 'cancel';
    /**
     * Ask the browser not to reuse the previous session's cookies
     * (openAuth only; honored per-platform). Default: false.
     */
    ephemeralWebSession?: boolean;
}
export interface ThemedBrowserSession {
    /** The surface this session prefers (reborn > expo > external). */
    readonly surface: BrowserSurface;
    /**
     * Whether a Chrome Custom Tabs provider exists (Android) /
     * SFSafariViewController is usable (iOS — always true).
     * Detected through the SAME library that opens the tab: reborn's
     * `isAvailable()`, falling back to expo-web-browser's
     * `getCustomTabsSupportingBrowsersAsync()`.
     */
    isChromeTabsAvailable(): Promise<boolean>;
    /**
     * Opens an http(s) URL in the themed system browser and resolves when the
     * user dismisses it. Falls to the external browser when no in-app surface
     * is available. (Custom Tabs can't open custom schemes — wallet deep
     * links still go through `Linking`.)
     */
    open(url: string, opts?: ThemedBrowserOptions): Promise<BrowserOpenResult>;
    /**
     * Redirect-intercepting session for wallets with redirect callbacks: the
     * browser resolves as soon as the page navigates to `redirectUrl`
     * (a custom scheme of the app), with the full redirect URL returned —
     * result params included, however the wallet encodes them.
     */
    openAuth(url: string, redirectUrl: string, opts?: ThemedBrowserOptions): Promise<BrowserAuthResult>;
    /** Dismisses the presented browser (both adapters, whichever is showing). */
    close(): void;
    /** Pre-warms the browser process so the first open is instant. */
    warmup(): Promise<void>;
}
/**
 * Theme → `react-native-inappbrowser-reborn` option map:
 *
 * Android (Chrome Custom Tabs): themed toolbar + secondary toolbar +
 * navigation bar + divider hairline.
 * iOS (SFSafariViewController): `pageSheet` modal presentation, themed bar
 * tint, accent-tinted controls, close-style dismiss button.
 */
export declare function buildRebornOptions(opts?: ThemedBrowserOptions): Record<string, unknown>;
/**
 * Theme → `expo-web-browser` option map (the same chrome via Expo Go's
 * module): Android toolbar colors, iOS `pageSheet` presentation + accent
 * controls. Each platform ignores the other's fields, so one flat object
 * is safe to pass.
 */
export declare function buildExpoOptions(opts?: ThemedBrowserOptions): Record<string, unknown>;
/**
 * Builds the themed in-app browser session. See the module docs for the
 * preference chain and the injection pattern.
 */
export declare function createThemedBrowserSession(adapters: {
    reborn?: RebornBrowserLike;
    expo?: ExpoWebBrowserLike;
}, defaults?: ThemedBrowserOptions): ThemedBrowserSession;
//# sourceMappingURL=inapp-browser.d.ts.map