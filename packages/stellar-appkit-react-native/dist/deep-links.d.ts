/**
 * Mobile wallet deep-link registry for Stellar AppKit on React Native.
 *
 * This is the React Native answer to Solana Mobile's Wallet Adapter picker:
 * when the user taps a wallet in the modal, we embed the WalletConnect
 * pairing URI (`wc:...@2?relay-protocol=irn&symKey=...`) into the wallet's
 * own deep link and hand off to the OS. The wallet opens with the pairing
 * pre-loaded, the user approves, and the session completes over the
 * WalletConnect relay — no QR scan, no typing.
 *
 * ## Which wallets ship built-in?
 *
 * The four Stellar-first wallets with mobile apps registered against the
 * WalletConnect Stellar namespace (verified against the WalletConnect
 * Explorer registry, explorer-api.walletconnect.com, chains=stellar:pubnet):
 *
 * - Freighter   — freighterwallet://  (confirmed in stellar/freighter-mobile)
 * - LOBSTR      — lobstr://           (universal: https://lobstr.co/uni/wc)
 * - HOT Wallet  — hotwallet://        (universal: https://app.hot-labs.org)
 * - Scopuly     — scopuly://wc        (universal: https://app.scopuly.com/wc)
 *
 * Any other WalletConnect wallet (SafePal, Blockchain.com, and every other
 * multichain wallet that added the Stellar namespace) still connects through
 * the generic QR pairing view.
 *
 * ## Link format
 *
 * Built by `formatWalletConnectLink()` — byte-compatible with WalletConnect's
 * own modal (CoreUtil.formatNativeUrl/formatUniversalUrl in
 * @walletconnect/modal-core), which is the format every wallet registered in
 * the Explorer is tested against:
 *
 *     <native-link>/wc?uri=<encodeURIComponent(wc:...)>
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
    /** Display name shown in the wallet list and connecting view. */
    name: string;
    /**
     * Wallet icon. Prefer a pre-encoded `data:image/png;base64,...` (or jpeg)
     * literal — RN's `<Image>` renders those natively, no SVG dependency.
     * (SVG data URIs and https URLs also work through the modal's
     * `<WalletIcon>`, which resolves known wallets to bundled PNGs and falls
     * back to a branded letter avatar for anything else.)
     */
    icon: string;
    /**
     * The wallet's WalletConnect mobile-link entry, exactly as registered in
     * the WalletConnect Explorer — e.g. `hotwallet://`, `scopuly://wc`.
     * Defaults to `${scheme}://` when omitted.
     */
    link?: string;
    /**
     * Optional https universal link (e.g. `https://lobstr.co/uni/wc`) — used
     * as a fallback when the native scheme isn't registered on the device.
     */
    universal?: string;
    /** The wallet's registered URL scheme, e.g. `freighterwallet`. */
    scheme: string;
    /** Store links, used when the wallet isn't installed. */
    installUrl: {
        ios: string;
        android: string;
    };
    /**
     * Fully overrides the built-in WalletConnect deep-link builder for this
     * wallet. Only needed if a wallet deviates from the `<link>/wc?uri=`
     * convention.
     */
    buildWalletConnectUri?: (wcUri: string) => string;
}
/**
 * Formats a WalletConnect pairing URI into a wallet's native deep link —
 * byte-compatible with WalletConnect's own modal (`CoreUtil.formatNativeUrl`
 * in @walletconnect/modal-core), so every Explorer-registered wallet gets
 * exactly the link shape it was tested against:
 *
 * - `freighterwallet://` → `freighterwallet://wc?uri=<encoded>`
 * - `scopuly://wc`       → `scopuly://wc/wc?uri=<encoded>`
 *
 * (Wallets read the `uri` query param; the path is theirs to ignore.)
 */
export declare function formatWalletConnectLink(nativeLink: string, wcUri: string): string;
/**
 * Formats a WalletConnect pairing URI into a wallet's https universal link
 * (same algorithm as CoreUtil.formatUniversalUrl). Non-http inputs are
 * delegated to the native formatter.
 */
export declare function formatWalletConnectUniversalLink(universalLink: string, wcUri: string): string;
/**
 * Registers a mobile wallet deep link (or replaces an existing entry with the
 * same id). Use this to add wallets as they ship WalletConnect deep-link
 * support — no need to wait for an AppKit release:
 *
 * ```ts
 * registerMobileWallet({
 *   id: 'my-wallet',
 *   name: 'My Wallet',
 *   icon: myWalletIcon,          // data:image/png;base64,... works best
 *   scheme: 'mywallet',
 *   installUrl: { ios: '...', android: '...' },
 * });
 * ```
 *
 * `link` defaults to `${scheme}://` and the WalletConnect pairing link is
 * then built with the standard `<link>/wc?uri=` convention.
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
 * Builds the wallet's https universal pairing link (WalletConnect Explorer
 * `mobile.universal`), when the wallet registered one. Returns null when the
 * wallet has no universal link — fall back to `buildWalletConnectDeepLink()`.
 * Throws for unknown wallet ids, mirroring `buildWalletConnectDeepLink()`.
 */
export declare function buildWalletConnectUniversalLink(walletId: string, wcUri: string): string | null;
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