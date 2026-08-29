/**
 * English locale — the default, bundled locale for Stellar AppKit.
 *
 * This file is always statically imported (never lazy-loaded) so the modal
 * works immediately on first render without a flash of untranslated text.
 *
 * All other locales are lazy-loaded via dynamic import() on first call to
 * setLocale() — see loader.ts.
 *
 * STRING CONVENTIONS:
 * - Use ICU MessageFormat syntax for interpolation: {variableName}
 * - Use ICU plural syntax where applicable: {count, plural, one {...} other {...}}
 * - Keep strings concise — they're rendered in a modal with limited space
 * - Use ellipsis (…) for loading states, not three dots (...)
 * - Use sentence case for labels (first word capitalized, rest lowercase)
 *
 * DO NOT translate:
 * - Object keys (only values are translated)
 * - Variable names inside {braces}
 * - HTML tags like <strong> (they're rendered via innerHTML)
 * - Technical identifiers (XLM, URI, QR, etc.)
 */
export declare const en: {
    /** Footer + branding */
    readonly footer: {
        readonly powered_by: 'Powered by {brand}';
        readonly brand_name: 'Stellar AppKit';
    };
    /** ARIA labels + title attributes — for screen readers + tooltips */
    readonly aria: {
        readonly close_dialog: 'Close';
        readonly back: 'Back';
        readonly copy_address: 'Copy address';
        readonly click_to_copy: 'Click to copy address';
        readonly more_options: 'More options';
        readonly view_on_explorer: 'View on explorer';
    };
    /** Panel titles — shown in the modal header */
    readonly title: {
        readonly account: 'Account';
        readonly choose_account: 'Choose an account';
        readonly wrong_network: 'Wrong network';
        readonly review_transaction: 'Review transaction';
        readonly signing: 'Signing';
        readonly connect_wallet: 'Connect a wallet';
    };
    /** Wallet list view — the initial wallet picker */
    readonly wallet_list: {
        readonly loading: 'Loading wallets…';
        readonly empty: 'No wallets registered. Pass connectors into the StellarAppKit config.';
        readonly not_installed: 'Not installed';
        readonly install: 'Install';
        readonly status: {
            readonly connecting: 'Connecting…';
            readonly locked: 'Locked';
            readonly unavailable: 'Unavailable';
            readonly installed: 'Installed';
            readonly scan_qr: 'Scan QR Code';
        };
    };
    /** Connecting view — shown while waiting for the wallet to approve */
    readonly connecting: {
        readonly continue_in_wallet: 'Continue in {walletName}';
        readonly accept_request: 'Accept connection request in the wallet';
        readonly error_subtitle: 'Connection declined or failed. Try again or pick a different wallet.';
    };
    /** WalletConnect QR pairing view */
    readonly wc: {
        readonly scan_with: 'Scan with {walletName}';
        readonly scan_instructions: 'Open Hana, Lobstr, or Hot Wallet and scan this QR code to connect.';
        readonly open_in_wallet: 'Open in wallet app';
        readonly open_failed: 'Couldn\'t open {walletName}. If it isn\'t installed, get the app below.';
        readonly copy_uri: 'Copy URI';
        readonly copied: 'Copied!';
        readonly generating_code: 'Generating QR Code…';
        readonly qr_failed: 'QR generation failed. Use the copy button below.';
    };
    /** Action buttons — reused across views */
    readonly action: {
        readonly try_again: 'Try again';
        readonly cancel: 'Cancel';
        readonly sign: 'Sign';
        readonly approve: 'Approve';
        readonly switch_wallet: 'Switch Wallet';
        readonly disconnect: 'Disconnect';
        readonly connect_wallet: 'Connect wallet';
    };
    /** Wallet name fallbacks */
    readonly wallet: {
        readonly fallback_name: 'Wallet';
        readonly fallback_your_wallet: 'your wallet';
    };
    /** Account picker */
    readonly account: {
        readonly default_label: 'Account';
    };
    /** Connected view — balance, history, account info */
    readonly connected: {
        readonly pending_signatures: '{count, plural, one {# pending signature} other {# pending signatures}}';
        readonly balance_label: 'XLM Balance';
        readonly balance_unit: 'XLM';
        readonly recent_activity: 'Recent Activity';
        readonly no_transactions: 'No recent transactions';
        readonly get_testnet_funds: 'Get Testnet funds';
        readonly funds_requested: 'Funding requested — balance will update shortly';
    };
    /** Transaction history item defaults */
    readonly tx: {
        readonly default_type: 'Transaction';
        readonly default_asset: 'XLM';
        readonly unknown_asset: 'UNKNOWN';
        readonly no_amount: '—';
    };
    /** Transaction preview view — shown before signing */
    readonly preview: {
        readonly title: {
            readonly sign_message: 'Sign message';
            readonly review_transaction: 'Review transaction';
        };
        readonly subtitle: {
            readonly sign_message: 'Sign this message to prove you own {walletName}. Canceling will dismiss the request.';
            readonly review_transaction: 'Review the transaction details below. Approve to continue signing in {walletName}.';
        };
        readonly from_account: 'From {address}';
        readonly default_app_name: 'App';
    };
    /** Signing view — while the wallet processes the sign request */
    readonly signing: {
        readonly continue_in_wallet: 'Continue in {walletName}';
        readonly subtitle: 'Approve the request in your wallet to continue';
        readonly error_title: 'Signing rejected';
    };
    /** Sign-In With Stellar (SIWS) flow */
    readonly siws: {
        readonly title: 'Sign-In With Stellar';
        readonly phase: {
            readonly checking_session: 'Checking session…';
            readonly fetching_nonce: 'Fetching secure nonce…';
            readonly approve_in_wallet: 'Approve the sign-in request in {walletName}';
            readonly verifying: 'Verifying your signature…';
        };
        readonly error_title: 'Sign-in failed';
        readonly error_default: 'Sign-in failed.';
        readonly connect_wallet: 'Connect wallet';
        readonly error_generic: 'Sign-in failed. Please try again.';
        readonly error_too_many_attempts: 'Too many failed attempts ({maxRetries}). Please try again later.';
        readonly error_verification_failed: 'Sign-in verification failed.';
        readonly error_address_mismatch: 'Session address does not match connected wallet';
        readonly error_network_mismatch: 'Session network does not match connected wallet';
        readonly error_session_expired: 'Session has expired';
    };
    /** Network mismatch view — when wallet is on the wrong network */
    readonly network_mismatch: {
        readonly title: 'Wrong network';
        readonly detail: 'This wallet is on {actualNetwork}, this app needs {expectedNetwork}.';
        readonly detail_fallback: 'This wallet is on the wrong network.';
        readonly action_hint: 'Switch networks in your wallet, then try again.';
    };
    /** Generic error view */
    readonly error: {
        readonly title: 'Something went wrong';
        readonly default_message: 'Unknown error.';
        readonly request_timed_out: 'Request timed out. Please try again.';
    };
};
/**
 * The TypeScript type of the locale — used by all other locales for type safety.
 *
 * We widen the literal string types from `as const` to plain `string` so that
 * translated locale files can assign their own string values without TypeScript
 * complaining that e.g. `"正在加载钱包…"` isn't assignable to `"Loading wallets…"`.
 *
 * The type still enforces the SHAPE (keys, nesting structure) — a missing or
 * extra key in any locale file will be a compile-time error.
 */
type DeepWiden<T> = {
    [K in keyof T]: T[K] extends string ? string : T[K] extends readonly (infer U)[] ? U[] : T[K] extends object ? DeepWiden<T[K]> : T[K];
};
export type LocaleMessages = DeepWiden<typeof en>;
export {};
//# sourceMappingURL=en.d.ts.map