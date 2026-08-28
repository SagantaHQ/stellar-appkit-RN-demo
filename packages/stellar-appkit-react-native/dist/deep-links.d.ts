/**
 * Mobile wallet deep-link registry for Stellar AppKit on React Native.
 *
 * This is the React Native answer to Solana Mobile's Wallet Adapter picker:
 * when the user taps a wallet in the pairing view, we embed the WalletConnect
 * pairing URI (`wc:...@2?relay-protocol=irn&symKey=...`) into the wallet's
 * own deep link and hand off to the OS. The wallet opens with the pairing
 * pre-loaded, the user approves, and the session completes over the
 * WalletConnect relay — no QR scan, no typing.
 *
 * Deep-link format (confirmed from stellar/freighter-mobile's own
 * mock-dapp and docs/best-practices/navigation.md):
 *
 *     <scheme>://wc?uri=<encodeURIComponent(wc:...)>
 *
 * e.g. `freighterwallet://wc?uri=wc%3Aabc123%402%3Frelay-protocol%3Dirn...`
 *
 * Every registered wallet may also be re-opened for later sign requests by
 * launching its bare scheme (the WalletConnect "sign request flow" — the
 * dApp sends the user back to the wallet they paired with).
 */
/** A Stellar mobile wallet that can be opened via deep link. */
export interface MobileWalletDeepLink {
    /** Unique id — namespaced to avoid colliding with core connector ids. */
    id: string;
    /** Display name shown in the pairing view. */
    name: string;
    /** Wallet icon (data URI or https URL). */
    icon: string;
    /** The wallet's registered URL scheme, e.g. `freighterwallet`. */
    scheme: string;
    /** Store links, used when the wallet isn't installed. */
    installUrl: {
        ios: string;
        android: string;
    };
    /**
     * Builds the WalletConnect pairing deep link for this wallet.
     * The default works for wallets following the `scheme://wc?uri=` convention.
     */
    buildWalletConnectUri?: (wcUri: string) => string;
}
/**
 * Registers a mobile wallet deep link (or replaces an existing entry with the
 * same id). Use this to add wallets as they ship WalletConnect deep-link
 * support — no need to wait for an AppKit release:
 *
 * ```ts
 * registerMobileWallet({
 *   id: 'lobstr-mobile',
 *   name: 'LOBSTR',
 *   icon: lobstrIcon,
 *   scheme: 'lobstr',
 *   installUrl: { ios: '...', android: '...' },
 * });
 * ```
 */
export declare function registerMobileWallet(wallet: MobileWalletDeepLink): void;
/** Lists all registered mobile wallets (registration order). */
export declare function listMobileWallets(): MobileWalletDeepLink[];
/** Looks up a registered wallet by id. */
export declare function getMobileWallet(id: string): MobileWalletDeepLink | undefined;
/**
 * Builds the WalletConnect pairing deep link for a registered wallet —
 * `freighterwallet://wc?uri=wc%3A...` — ready for `Linking.openURL()`.
 * Throws for unknown wallet ids so typos surface in development.
 */
export declare function buildWalletConnectDeepLink(walletId: string, wcUri: string): string;
/**
 * Builds the bare "open this wallet app" link (no embedded URI) — used to
 * bring a paired wallet back to the foreground for a sign request, mirroring
 * the WalletConnect mobile-linking sign-request flow.
 */
export declare function buildOpenWalletAppLink(walletId: string): string;
/**
 * Derives a wallet id from a raw deep link (reverse lookup by scheme) —
 * useful when handling an incoming `app://wc?uri=...` redirect.
 */
export declare function findWalletByDeepLink(deepLink: string): MobileWalletDeepLink | undefined;
//# sourceMappingURL=deep-links.d.ts.map