import type { WalletConnector, ConnectStorage } from '../types.js';
/**
 * Classifies a WalletConnect failure into the three kinds app/UI code can
 * actually react to.
 *
 * WHY THIS EXISTS: the WC SDK surfaces every wallet-side outcome as a raw
 * thrown object — Lobstr rejects a sign request with
 * `{ message: "Transaction cancelled by the user" }`, the SDK's own
 * delayed-promise rejects after the 5-minute TTL with
 * `Error("Request expired. Please try again.")`, and namespace-validation
 * failures throw "Missing or invalid. request() method: …". Before this
 * classifier all of those collapsed into either a generic
 * "The user rejected this request." (discarding the wallet's own words) or
 * an opaque internal error — while the raw messages only showed up as
 * ERROR-level SDK console noise, which made the library look like it was
 * ignoring WalletConnect entirely.
 */
export type WalletConnectErrorKind = 'user-rejected' | 'request-expired' | 'other';
/** Robustly extracts a human message from the shapes the WC SDK throws. */
export declare function walletConnectErrorMessage(err: unknown): string;
/**
 * Classifies a WalletConnect error/rejection. Pure — safe to unit-test and
 * to call from any path (never throws, never touches SDK state).
 */
export declare function classifyWalletConnectError(err: unknown): {
    kind: WalletConnectErrorKind;
    message: string;
};
/**
 * The connected wallet's own identity, as reported by the wallet in the
 * WalletConnect session's `peer` metadata. Lets the UI show "Freighter" /
 * "LOBSTR" / "HOT Wallet" instead of the generic "WalletConnect" label.
 */
export interface WalletConnectPeerMetadata {
    /** The wallet's display name, e.g. "Freighter". */
    name: string;
    /** The wallet's homepage, when provided. */
    url: string | null;
    /** The wallet's icon (https URL), when provided. */
    icon: string | null;
}
export interface WalletConnectConnectorOptions {
    /** WalletConnect Cloud project ID — get one at cloud.walletconnect.com. */
    projectId: string;
    /**
     * App metadata shown in the wallet's connection approval dialog.
     *
     * Optional — when omitted, derived from:
     *   - `window.location` (browser): name from hostname, url from origin
     *   - The StellarAppKit config's `appMetadata` if available
     *
     * When provided, follows the Reown/WalletConnect metadata style:
     * ```ts
     * metadata: {
     *   name: 'My App',
     *   description: 'A Stellar dApp',
     *   url: 'https://saganta.com',
     *   icons: ['https://saganta.com/icon.png'],
     *   redirect: { native: 'myapp://', universal: 'https://myapp.com' },
     * }
     * ```
     * The `url` field is also used as the `uri` in SIWS messages.
     * The `icons[0]` field is used as the signing/preview app icon.
     * The `name` field is used as the app name in the connecting view.
     *
     * The `redirect` field (WalletConnect metadata standard) tells cooperating
     * mobile wallets which deep link re-opens THIS app — the wallet opens it
     * after the user approves/rejects, backgrounding itself and returning
     * focus to the dapp. Ignored by wallets that don't support it.
     */
    metadata?: {
        name: string;
        description: string;
        url: string;
        icons: string[];
        redirect?: {
            native?: string;
            universal?: string;
        };
    };
    /**
     * Called with the WC pairing URI when a new connection is initiated.
     *
     * **When using `<stellar-appkit-modal>` (recommended):** the modal
     * intercepts this automatically via `setOnUri()` and renders the QR
     * code inside the connecting view using `better-qr` — you can omit
     * this entirely.
     *
     * Defaults to a no-op (`() => {}`).
     */
    onUri?: (uri: string) => void;
    /**
     * Optional storage for persisting the WC session topic across page
     * reloads. If provided, `restore()` will attempt to reconnect using
     * the saved topic. If not provided, sessions are lost on page reload.
     */
    storage?: ConnectStorage;
    /**
     * The Stellar network passphrase to include in the session proposal.
     *
     * Optional — when omitted, derived from the `network` field passed to
     * `StellarAppKit` config (e.g. `'TESTNET'` → `Networks.TESTNET`).
     * Only required for `STANDALONE` networks (which have no built-in
     * passphrase) or when you want to override the default.
     */
    networkPassphrase?: string;
    /**
     * WalletConnect SDK logger level — passed straight to
     * `SignClient.init({ logger })`.
     *
     * The WC SDK logs its internal chatter (stale relay deliveries, pairing
     * cleanups, request expiries) at ERROR level through pino, so on React
     * Native terminals those lines show up as
     * `{"level": 50, "msg": "No matching key. proposal: …"}` even when
     * nothing is wrong from the app's perspective. Set `'silent'` to hide
     * ALL SDK console output (including genuine relay errors — everything
     * that matters to the flow is still surfaced as typed ConnectErrors),
     * `'error'` to keep the default, `'warn'`/`'info'`/`'debug'`/`'trace'`
     * for progressively noisier diagnostics.
     *
     * Optional — when omitted, the SDK default applies.
     */
    logger?: 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
}
export declare function createWalletConnectConnector(opts: WalletConnectConnectorOptions): WalletConnector;
//# sourceMappingURL=walletconnect.d.ts.map