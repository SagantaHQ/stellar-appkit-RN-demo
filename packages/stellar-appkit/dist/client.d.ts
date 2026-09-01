import { ConnectorRegistry } from './connectors/registry.js';
import { SiwsConfig, SiwsSession, type ConnectSession, type ConnectStatus, type ConnectStorage, type SignMessageResult, type SignOptions, type SignTransactionResult, type SignTxOptions, type SignAuthEntryResult, type StellarAppKitEvents, type StellarNetwork, type WalletConnector, type WalletReachability } from './types.js';
import { type SignInOptions, type SignInResult } from './siws.js';
import { type LocaleCode } from './i18n/index.js';
import { type PreviewHandler, type AuthEntryPreviewHandler, type PreviewOptions } from './decode.js';
export interface StellarAppKitConfig {
    /**
     * Wallet connectors to register. Optional — if omitted (or empty),
     * defaults to all bundled browser-side connectors: Freighter, Albedo,
     * xBull, and Ledger. WalletConnect is NOT included by default because
     * it requires a `projectId` from your WalletConnect Cloud dashboard.
     *
     * Pass an explicit list to override the default, e.g. to add WalletConnect
     * or to restrict the wallet list to a subset.
     */
    connectors?: WalletConnector[];
    /** Network the app expects to operate on — used to validate the connected wallet's network. */
    network: StellarNetwork;
    /** Required for STANDALONE networks (no built-in passphrase to fall back on); optional override otherwise. Needed for transaction previews to decode against the right network. */
    networkPassphrase?: string;
    /** Defaults to localStorage on web. Pass a RN-backed implementation for React Native. */
    storage?: ConnectStorage;
    /**
     * App identity — follows the WalletConnect/Reown metadata standard.
     * The same object is used for:
     *   - SIWS messages (domain derived from `url`, `uri` = `url`)
     *   - WalletConnect session proposals (passed directly as WC `metadata`)
     *   - The modal's transaction preview app icon (`icons[0]`)
     *
     * Shape:
     * ```ts
     * appMetadata: {
     *   name: 'My App',
     *   description: 'A Stellar dApp',
     *   url: 'https://saganta.com',
     *   icons: ['https://saganta.com/icon.png'],
     * }
     * ```
     *
     * Only `name` is required. When `url` is omitted, derived from
     * `window.location.origin` (browser). `domain` for SIWS is derived
     * from `url` by stripping the protocol and path. `description` and
     * `icons` are optional but recommended for WalletConnect.
     *
     * `redirect` (optional, mobile focus-return): your app's own deep-link
     * target, following the WalletConnect/Reown metadata standard. It is
     * included verbatim in every WalletConnect session proposal, where a
     * cooperating mobile wallet reads it after the user approves or rejects
     * and opens it — which backgrounds the wallet and re-focuses your app
     * automatically (the standard mobile round trip). On React Native, the
     * `@saganta/stellar-appkit-react-native` modal also uses it as the
     * best-effort self-open target when an operation settles while your app
     * is backgrounded. Ignored on web. Example:
     * ```ts
     * appMetadata: {
     *   name: 'My App',
     *   url: 'https://myapp.com',
     *   redirect: { native: 'myapp://', universal: 'https://myapp.com' },
     * }
     * ```
     */
    appMetadata?: {
        name: string;
        description?: string;
        url?: string;
        icons?: string[];
        redirect?: {
            native?: string;
            universal?: string;
        };
    };
    /** Set false to disable cross-tab session sync (on by default, no-ops where BroadcastChannel isn't available anyway). */
    syncAcrossTabs?: boolean;
    /**
     * Auto-connect on construction: schedules `restore()` immediately, so a
     * persisted wallet session reconnects (and, when `siws` is configured, a
     * still-valid SIWS session logs back in) without the app wiring its own
     * mount-effect `client.restore()` call. Fire-and-forget: restore() is
     * designed to silently drop anything it can't bring back. Default false —
     * apps that prefer explicit control keep calling `restore()` themselves
     * (calling both is harmless; the second restore sees the same storage).
     *
     * On React Native this is the "auto connect and login" switch: pair once,
     * then every app start resumes connected (and signed in, when SIWS is
     * configured and the session hasn't expired).
     */
    autoConnect?: boolean;
    /** Called before every signTransaction() with a decoded preview — return false to cancel before the wallet ever sees the request. `ui-web`'s modal sets this automatically when attached. */
    onPreviewTransaction?: PreviewHandler;
    /** Called before every signAuthEntry() with a decoded preview of the auth tree — return false to cancel before the wallet ever sees the request. Standalone auth-entry signing can grant broad contract permissions, so this preview is critical. */
    onPreviewAuthEntry?: AuthEntryPreviewHandler;
    /** Passed through to buildTransactionPreview() / buildAuthEntryPreview() — verifiedContracts, largeTransferThreshold. */
    previewOptions?: PreviewOptions;
    /**
     * Modal UI configuration. Passed through to the `@saganta/stellar-appkit-ui-web`
     * package when its `<stellar-appkit-modal>` element is attached. Currently
     * only `animation` is supported — set it to override the default open/close
     * transitions (`scale-blur` for modal, `slide-up` for bottom-sheet).
     *
     * The `animation` field accepts either a single preset name (applied to
     * both open and close) or `{ open, close }` for separate presets.
     * Presets: `'none' | 'fade' | 'scale' | 'scale-blur' | 'slide-up' | 'slide-left' | 'implode'`.
     */
    modal?: StellarAppKitModalConfig;
    /**
     * SIWS (Sign-In With Stellar) configuration for automatic authentication.
     * When set, the modal automatically triggers a SIWS sign-in immediately
     * after the wallet connects. See `SiwsConfig` for the full flow.
     */
    siws?: SiwsConfig;
    /**
     * UI locale for the modal + error messages. Defaults to `'en'` (English).
     *
     * English is bundled with the library; all other locales are lazy-loaded
     * via dynamic `import()` on first use. Pass a locale code here to set the
     * initial locale at app startup:
     *
     * ```ts
     * new StellarAppKit({
     *   network: 'TESTNET',
     *   locale: 'zh-CN', // ← modal renders in Simplified Chinese
     *   ...
     * });
     * ```
     *
     * To change the locale at runtime, call `setLocale('ja')` from the i18n
     * module, or use the `useSetLocale()` React hook.
     *
     * Supported codes: `'en' | 'zh-CN' | 'zh-TW' | 'es' | 'pt-BR' | 'ja' |
     * 'ko' | 'de' | 'fr' | 'ru' | 'ar' | 'hi' | 'it' | 'tr' | 'pl' | 'vi' |
     * 'id' | 'uk' | 'nl' | 'th' | 'he' | 'cs' | 'sv' | 'ro' | 'fa'`
     */
    locale?: LocaleCode;
}
/**
 * Modal UI config shape. Defined in core (not ui-web) so the core SDK
 * doesn't depend on ui-web types — the ui-web package accepts the same
 * shape via its own ModalAnimationOption type (which is structurally
 * compatible).
 */
export interface StellarAppKitModalConfig {
    /**
     * Animation preset for the modal open/close transitions.
     * - String: same preset for both open and close.
     * - Object: separate `open` and `close` presets.
     * - Undefined: defaults to `scale-blur` for modal mode, `slide-up` for bottom-sheet.
     */
    animation?: 'none' | 'fade' | 'scale' | 'scale-blur' | 'slide-up' | 'slide-left' | 'implode' | {
        open?: 'none' | 'fade' | 'scale' | 'scale-blur' | 'slide-up' | 'slide-left' | 'implode';
        close?: 'none' | 'fade' | 'scale' | 'scale-blur' | 'slide-up' | 'slide-left' | 'implode';
    };
}
/**
 * Returns the default connector set: every bundled browser-side wallet that
 * doesn't require constructor-time configuration. WalletConnect is excluded
 * because it requires a `projectId`.
 *
 * Used when `StellarAppKitConfig.connectors` is omitted or empty.
 *
 * The connector factory functions themselves are lightweight — each
 * connector lazy-imports its underlying SDK (e.g. `@stellar/freighter-api`)
 * only when its methods are actually called, so importing the factories
 * at the top of this file does not pull heavy SDK code into the bundle
 * for apps that don't use the default set.
 */
export declare function defaultConnectors(): WalletConnector[];
/** The mobile focus-return piece of `appMetadata` — WC/Reown metadata standard. */
export type AppMetadataRedirect = {
    native?: string;
    universal?: string;
};
/** The full resolved `appMetadata` shape used internally (WC metadata standard). */
export type AppKitAppMetadata = {
    name: string;
    description?: string;
    url?: string;
    icons?: string[];
    redirect?: AppMetadataRedirect;
};
/**
 * Normalizes the user-provided `appMetadata` (WC metadata shape) into the
 * fully-resolved shape the SDK uses internally.
 *
 * Input shape (WalletConnect/Reown metadata standard):
 *   { name, description?, url?, icons?, redirect? }
 *
 * - `url` is auto-derived from `window.location.origin` when omitted (browser)
 * - `url` is auto-formatted: prefixed with `https://` if no protocol
 * - `domain` (for SIWS) is derived from `url` by stripping protocol + path
 * - `uri` (for SIWS) = `url`
 * - `redirect` values are trimmed and empty strings dropped
 *
 * The same object is passed directly to WalletConnect as its `metadata`.
 */
export declare function normalizeAppMetadata(meta: {
    name: string;
    description?: string;
    url?: string;
    icons?: string[];
    redirect?: AppMetadataRedirect;
}): AppKitAppMetadata;
/**
 * Derives the SIWS `domain` from the appMetadata `url` by stripping the
 * protocol and path. E.g. `"https://app.example.com/path"` → `"app.example.com"`.
 */
export declare function deriveDomainFromUrl(url: string | undefined): string | undefined;
export interface AppKitConnectOptions {
    /**
     * If the wallet's live network doesn't match, poll until it does instead
     * of failing immediately — lets a "wrong network" moment resolve itself
     * once the user switches inside their wallet, without them needing to
     * click connect again.
     */
    autoRetryNetworkMismatch?: boolean;
    retryIntervalMs?: number;
    retryTimeoutMs?: number;
}
/**
 * The single object app code talks to. Wraps the connector registry, owns
 * connection state + persistence, and re-exports signIn() (SIWS) so a whole
 * app only ever needs one import.
 *
 * Supports connecting more than one wallet at once (e.g. Freighter *and*
 * Ledger simultaneously) — `session`/`activeConnector` always refer to
 * whichever one is currently active; `sessions` lists everything connected.
 */
export declare class StellarAppKit {
    readonly registry: ConnectorRegistry;
    readonly network: StellarNetwork;
    readonly appMetadata?: StellarAppKitConfig['appMetadata'];
    /** Called before every signTransaction() — set by ui-web automatically, or assign your own for a non-UI preview flow (e.g. logging, a CLI confirmation prompt). */
    onPreviewTransaction: PreviewHandler | null;
    /** Called before every signAuthEntry() — same contract as onPreviewTransaction, but for standalone auth-entry signing. Returns false to cancel before the wallet sees the request. */
    onPreviewAuthEntry: AuthEntryPreviewHandler | null;
    previewOptions: PreviewOptions;
    private storage;
    private customNetworkPassphrase?;
    private emitter;
    private _status;
    private _sessions;
    private _activeWalletId;
    private tabSync;
    private signChain;
    private _pendingSignCount;
    /**
     * The last FAILED wallet-side sign that "Try again" can re-drive — armed
     * by runRetryableSign() only when the wallet call itself rejects (never
     * for preview rejections), cleared on success / new sign / disconnect.
     * See retryLastSign().
     */
    private retryableSign;
    constructor(config: StellarAppKitConfig);
    /** Modal UI config from StellarAppKitConfig.modal — read by ui-web when attached. */
    readonly modalConfig?: StellarAppKitModalConfig;
    /** SIWS config from StellarAppKitConfig.siws — read by ui-web for auto sign-in. */
    readonly siwsConfig?: SiwsConfig;
    /** The current SIWS session, or null if not authenticated. Set by the modal
     *  after successful verify(), cleared on disconnect. Accessible via
     *  `appkit.siwsSession` for app code to check auth status. */
    private _siwsSession;
    /** Get the current SIWS session (null if not authenticated or expired). */
    get siwsSession(): SiwsSession | null;
    /** Set the SIWS session (called by the modal after successful verify()). */
    setSiwsSession(session: SiwsSession | null): void;
    /** Clear the SIWS session + call signout() if configured. Called on disconnect. */
    clearSiwsSession(): Promise<void>;
    /**
     * Manually sign out — clears the SIWS session, calls `signout()`, and
     * disconnects the wallet. Use this for "Log out" buttons in your app.
     */
    signOut(): Promise<void>;
    /**
     * Throws if not authenticated. Use to guard actions that require auth.
     * ```ts
     * await appkit.requireAuth();
     * await appkit.signTransaction(xdr);
     * ```
     */
    requireAuth(): void;
    /**
     * Validate the current session against the server. Calls `refresh()` (or
     * `session()` if `refresh` is not configured) to get a fresh session from
     * the server. If the session is invalid/expired/mismatched, triggers a
     * new SIWS sign-in flow.
     *
     * Returns the validated session, or null if not authenticated.
     */
    validateSession(): Promise<SiwsSession | null>;
    /**
     * Force re-authentication — clears the current session and triggers a
     * fresh SIWS sign-in flow. Useful for privilege escalation (e.g.,
     * "Confirm it's you to complete this transaction").
     *
     * The modal (if attached) will show the SIWS flow automatically.
     * Returns a promise that resolves when the SIWS flow completes.
     */
    reauthenticate(): Promise<void>;
    /** Restore persisted SIWS session from storage (called on app init). */
    private restoreSiwsSession;
    /** Number of sign requests currently queued, including the one in flight — see the signing queue notes on signTransaction(). */
    get pendingSignCount(): number;
    get status(): ConnectStatus;
    /** The active session, or null if nothing's connected. */
    get session(): ConnectSession | null;
    /** Every currently connected session, active or not. */
    get sessions(): ConnectSession[];
    get activeConnector(): WalletConnector | null;
    on<K extends keyof StellarAppKitEvents>(event: K, handler: (payload: StellarAppKitEvents[K]) => void): () => void;
    getWalletReachability(walletId: string): Promise<WalletReachability>;
    /**
     * Attempts to restore persisted session(s) on app start. Silently drops
     * (rather than throwing) any session whose wallet is no longer available
     * or whose address no longer matches — this is meant to be called once,
     * e.g. inside a provider's mount effect, without needing its own error
     * handling.
     */
    restore(): Promise<ConnectSession[]>;
    /**
     * Connects a wallet. Adding a second (third, ...) wallet while one is
     * already connected doesn't replace it — both stay connected, and the
     * newly connected one becomes active. Use switchAccount() to change
     * which one is active without disconnecting anything.
     */
    connect(walletId: string, opts?: AppKitConnectOptions): Promise<ConnectSession>;
    private ensureNetworkMatch;
    /**
     * Switches which connected wallet is active. If `address` is given and
     * differs from that wallet's current session address, the connector must
     * support listAccounts()/selectAccount() (hardware wallets, mainly) — for
     * everything else, omit `address` to just switch between already-connected
     * *wallets*.
     */
    switchAccount(walletId: string, address?: string): Promise<ConnectSession>;
    /** Disconnects one wallet (defaults to the active one). Other connected wallets, if any, are untouched — the most recently connected one becomes active. */
    disconnect(walletId?: string): Promise<void>;
    /** Disconnects every connected wallet. */
    disconnectAll(): Promise<void>;
    /**
     * Reconciles the client after a WALLET-initiated disconnect — invoked by
     * connectors through the setOnSessionInvalidated wiring (WalletConnect's
     * session_delete / session_expire) when the user kills the session from
     * inside the wallet, as opposed to disconnect(), which is the app asking
     * the wallet to leave.
     *
     * The connector has already cleared its own state (and its persisted
     * record) by the time this runs, so — unlike disconnect() — we don't call
     * connector.disconnect() (nothing left to disconnect, and the wallet
     * already knows). Everything else mirrors disconnect(): the session is
     * dropped from the map AND from persisted storage, a pending "Try again"
     * for this wallet dies with it, the most recently connected remaining
     * wallet becomes active, and `disconnect` + `sessionsChanged` fire so
     * modals/hooks/app code see the wallet leave in real time.
     *
     * Synchronous-first by design: the session is removed from the map before
     * any await so a burst of session_delete + session_expire for the same
     * topic (the relay can deliver both) reconciles exactly once.
     */
    private handleExternalDisconnect;
    /** Releases resources held by the client (currently just the cross-tab sync channel) — call on unmount in long-lived SPAs if you're creating fresh clients repeatedly. */
    dispose(): void;
    /** Re-reads storage after another tab reported a change, and reconciles in-memory state against it. Never writes back to storage itself, to avoid a notify loop between tabs. */
    private resyncFromStorage;
    private readStorage;
    private persist;
    private setStatus;
    private requireActiveConnector;
    /**
     * Maps the StellarNetwork enum to its passphrase, needed to decode a
     * preview and to validate signing options. Requires an explicit
     * `networkPassphrase` in the config for STANDALONE networks, which have
     * no fixed passphrase to fall back on.
     */
    private resolveNetworkPassphrase;
    /**
     * Serializes sign requests so concurrent calls don't race the same
     * wallet extension — most can only handle one prompt at a time, and
     * racing them tends to fail the second (or both) rather than queue
     * sanely on its own. A burst of signTransaction() calls resolves one at
     * a time, in call order, instead of unpredictably.
     */
    private enqueueSign;
    /**
     * Runs the wallet-side half of a sign request. On failure, records the
     * rerun for retryLastSign(). The app-facing promise still rejects
     * normally — the retry result is delivered via the 'signRetried' event
     * because the original promise cannot be settled twice.
     *
     * Preview rejections never reach this wrapper (they throw before the
     * wallet call), so a preview the user declined can never be bypassed by
     * a retry.
     */
    private runRetryableSign;
    /** Re-enqueues a recorded wallet-side sign and emits 'signRetried' on success. Fire-and-forget — the result reaches apps via the event, not a promise. */
    private redriveSign;
    /**
     * Re-drives the last FAILED wallet-side sign (the "Try again" button on the
     * modals' signing-error view). The wallet is asked again through the normal
     * sign queue — every signQueueChange / error event fires, the modal flows
     * back through the signing view exactly as it did the first time, and a
     * successful retry emits 'signRetried' with the result.
     *
     * Returns false when there's nothing to retry (the last sign succeeded, a
     * newer sign superseded it, or the session was torn down) — callers treat
     * that as "fall back to the previous view".
     */
    retryLastSign(): boolean;
    /**
     * Signs a transaction. Queued alongside every other sign* call (see
     * enqueueSign) so concurrent requests resolve in order instead of
     * racing. If `onPreviewTransaction` is set (ui-web does this
     * automatically once attached), the transaction is decoded and the
     * handler is awaited *before* the wallet ever sees the request —
     * rejecting there throws the same way a wallet-side rejection would,
     * so callers don't need to special-case it. Pass `skipPreview: true` to
     * bypass this for a specific call (e.g. a flow you've already confirmed
     * through some other UI).
     */
    signTransaction(xdr: string, opts?: SignTxOptions & {
        skipPreview?: boolean;
    }): Promise<SignTransactionResult>;
    /**
     * Signs a Soroban auth entry. Queued alongside every other sign* call
     * (see enqueueSign). If `onPreviewAuthEntry` is set, the auth entry is
     * decoded and the handler is awaited *before* the wallet ever sees the
     * request — rejecting there throws the same way a wallet-side rejection
     * would, so callers don't need to special-case it. Pass `skipPreview:
     * true` to bypass for a specific call (e.g. a flow already confirmed
     * through some other UI).
     *
     * The preview surfaces the contract IDs and functions being authorized,
     * plus risk flags for broad grants and unverified contracts — this
     * closes a previous gap where standalone signAuthEntry() calls could
     * silently grant broad contract permissions without user review.
     */
    signAuthEntry(authEntryXdr: string, opts?: SignOptions & {
        skipPreview?: boolean;
    }): Promise<SignAuthEntryResult>;
    /** Queued alongside signTransaction()/signAuthEntry() — see enqueueSign. */
    signMessage(message: string, opts?: SignOptions & {
        skipPreview?: boolean;
    }): Promise<SignMessageResult>;
    /** Sign-In With Stellar — see siws.ts for the message format. Also queued, since it's a signMessage() call under the hood. */
    signIn(opts: Omit<SignInOptions, 'connector' | 'network' | 'appMetadata'> & {
        skipPreview?: boolean;
    }): Promise<SignInResult>;
}
//# sourceMappingURL=client.d.ts.map