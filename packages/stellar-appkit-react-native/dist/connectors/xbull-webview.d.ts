/**
 * xBull connector for React Native — same web-wallet flow as the web
 * connector's popup fallback, with the popup replaced by an in-app WebView.
 *
 * Why a WebView bridge? xBull has no native mobile app (its old Play Store
 * app was removed and it is not registered in the WalletConnect Explorer's
 * Stellar namespace), so there is no deep link to hand off to. What xBull
 * DOES have is its web wallet at `https://wallet.xbull.app/connect`, which
 * speaks a nacl-box encrypted postMessage protocol with a popup opener —
 * verified byte-for-byte against the live wallet bundle (ConnectModule,
 * chunk 267 at the time of writing):
 *
 *   1. The opener opens
 *      `https://wallet.xbull.app/connect?public=<b64>&session=<b64>` —
 *      its own nacl box public key and a 24-byte session nonce.
 *   2. Once loaded, the wallet replies via `opener.postMessage({ type:
 *      'XBULL_INITIAL_RESPONSE', message, oneTimeCode, publicKey }, '*')`
 *      where `message` is the box-encrypted `{ providedSession,
 *      walletSession }` — the session echo proves the wallet saw OUR key.
 *   3. The app sends requests as message events on the wallet's window:
 *      `{ type: 'XBULL_CONNECT' | 'XBULL_SIGN' | 'XBULL_SIGN_MESSAGE',
 *      message, oneTimeCode }` (encrypted for the wallet's public key).
 *      The wallet reads `event.origin` and displays it as the requesting
 *      app — we forge it from the configured app origin, exactly what
 *      `popup.postMessage(...)` would have carried.
 *   4. The wallet replies `{ type: <REQUEST>_RESPONSE, message,
 *      oneTimeCode, publicKey, success }` via `opener.postMessage`.
 *      `success: false` is a user rejection.
 *
 * This connector is deliberately **headless** — it accepts an
 * `XBullWebViewBridge` implementation, so apps with their own UI can pass
 * any `openWallet(url, handlers) → handle` object, while apps using our
 * modal pass `@saganta/stellar-appkit-react-native/xbull`'s
 * `createXBullWebViewBridge()`, which renders the WebView screen.
 *
 * The protocol mirrors `@creit.tech/xbull-wallet-connect` v0.4.0 (the same
 * package the core web connector uses), so both platforms talk to the exact
 * same web wallet — but implemented directly against `tweetnacl` instead of
 * shimming `window.open` for the RN runtime.
 */
import type { WalletConnector } from '@saganta/stellar-appkit';
/** The xBull web wallet's connect page — the only origin the WebView loads. */
export declare const XBULL_WALLET_URL = "https://wallet.xbull.app/connect";
/**
 * One message from the wallet WebView — the object the wallet passes to
 * `opener.postMessage(...)` (JSON-stringified by the injected shim).
 */
export interface XBullWalletMessage {
    type?: string;
    /** Box-encrypted payload (base64). Absent on rejection replies. */
    message?: string;
    /** Box nonce (base64). */
    oneTimeCode?: string;
    /** The wallet's nacl box public key (base64) — sent on every reply. */
    publicKey?: string;
    /** `false` = the user rejected the request in the wallet UI. */
    success?: boolean;
}
/** Handle to an open wallet WebView — owned by the bridge implementation. */
export interface XBullWalletHandle {
    /** Delivers an encrypted request into the wallet page as a message event. */
    postMessageToWallet(msg: Record<string, unknown>, origin: string): void;
    /** Dismisses the WebView. Safe to call more than once. */
    close(): void;
}
/**
 * Headless bridge contract: present the xBull web wallet (WebView, custom
 * browser view, …), forward its messages, and report user dismissal.
 * Implemented by the WebView screen in `../xbull`, or by the app's own UI.
 */
export interface XBullWebViewBridge {
    openWallet(url: string, handlers: {
        /** Every message the wallet posts back (already JSON-parsed). */
        onMessage: (msg: XBullWalletMessage) => void;
        /** The user dismissed the WebView before completing the flow. */
        onClosed: () => void;
    }): Promise<XBullWalletHandle>;
}
export interface XBullWebViewConnectorOptions {
    /** Bridge that presents the xBull web wallet (e.g. the WebView screen from `../xbull`). */
    bridge: XBullWebViewBridge;
    /**
     * The app's origin, carried on every request as `event.origin` — the
     * wallet displays it to the user as the requesting app. Derive it from
     * your `appMetadata.url`; must be an absolute URL.
     */
    origin: string;
    /** Override the wallet URL (tests / self-hosted wallets). Defaults to XBULL_WALLET_URL. */
    walletUrl?: string;
}
export declare function createXBullWebViewConnector(opts: XBullWebViewConnectorOptions): WalletConnector;
//# sourceMappingURL=xbull-webview.d.ts.map