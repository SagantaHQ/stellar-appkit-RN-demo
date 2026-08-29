import type { WalletConnector, ConnectStorage } from '../types.js';
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
     * }
     * ```
     * The `url` field is also used as the `uri` in SIWS messages.
     * The `icons[0]` field is used as the signing/preview app icon.
     * The `name` field is used as the app name in the connecting view.
     */
    metadata?: {
        name: string;
        description: string;
        url: string;
        icons: string[];
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
}
export declare function createWalletConnectConnector(opts: WalletConnectConnectorOptions): WalletConnector;
//# sourceMappingURL=walletconnect.d.ts.map