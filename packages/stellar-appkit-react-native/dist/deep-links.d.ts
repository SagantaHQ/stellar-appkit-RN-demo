/**
 * Mobile wallet deep-link registry for Stellar AppKit on React Native.
 *
 * This is the React Native answer to Solana Mobile's Wallet Adapter picker:
 * when the user taps a wallet in the modal, we embed the WalletConnect
 * pairing URI (`wc:...@2?relay-protocol=irn&symKey=...`) into the wallet's
 * own deep link and hand off to the OS. The wallet opens with the pairing
 * pre-loaded, the user approves, and the session completes over the
 * WalletConnect relay — no QR scan, no typing. On a phone the SAME device
 * would have to scan the QR, so deep linking is the only pairing surface
 * the RN modal exposes (Solana-Mobile-Adapter style).
 *
 * ## Which wallets ship built-in?
 *
 * Every consumer wallet registered against the WalletConnect Explorer's
 * Stellar namespace (verified against explorer-api.walletconnect.com,
 * chains=stellar:pubnet) with a native mobile link:
 *
 * Featured (Stellar-first):
 * - Freighter   — freighterwallet://wc-redirect  (the wallet's Explorer-
 *   registered native link — freighter-mobile's deep-link handler silently
 *   ignores any URL that doesn't contain it; see the Freighter note below)
 * - LOBSTR      — lobstr://           (universal: https://lobstr.co/uni/wc)
 * - HOT Wallet  — hotwallet://        (universal: https://app.hot-labs.org)
 * - Scopuly     — scopuly://wc        (universal: https://app.scopuly.com/wc)
 *
 * Additional (multichain wallets that registered the Stellar namespace —
 * collapsible "More wallets" section in the modal): SafePal,
 * Blockchain.com, Arculus, Atomic Wallet, COCA, Trustee, MaxWallet, Zypto,
 * Hero, UKey, ECOIN, SwiftEx, Panaroma, Kotai, Cryptokara, UKISS Hub, SOC.
 *
 * Institutional custody platforms without consumer deep links (Anchorage,
 * Utila, GK8) and stale registrations are intentionally excluded; anything
 * else can be added at runtime with `registerMobileWallet()`.
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
 * e.g. `freighterwallet://wc-redirect/wc?uri=wc%3Aabc123%402%3Frelay-protocol%3Dirn...`
 *
 * ## Why the wallet's REGISTERED link (not its bare scheme)
 *
 * Wallets validate the URLs they're asked to open. Freighter Mobile's deep-
 * link handler (stellar/freighter-mobile, useWalletKitEventsManager.ts) starts
 * with `if (!url.includes(WALLET_KIT_MT_REDIRECT_NATIVE)) return;` — the
 * wallet's Reown-registered native redirect, `freighterwallet://wc-redirect`.
 * A bare `freighterwallet://wc?uri=...` link OPENS the app (the OS matches the
 * scheme) but is then silently dropped: no pairing, no connect prompt. The
 * mock dApp inside the freighter-mobile repo only exercises the DEV scheme
 * (`freighterdev://wc?uri=`), which is why the bare-scheme shape looks right
 * there but never worked against the production app. Every entry below uses
 * the exact `mobile.native` value from the WalletConnect Explorer
 * registration, so the built link is byte-identical to what WalletConnect's
 * own modal would open for that wallet.
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
     * Featured wallets render in the modal's primary "Stellar wallets"
     * section; everything else (including runtime `registerMobileWallet()`
     * entries, unless they opt in) collapses under "More wallets".
     */
    featured?: boolean;
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
 * - `freighterwallet://wc-redirect` → `freighterwallet://wc-redirect/wc?uri=<encoded>`
 * - `scopuly://wc`        → `scopuly://wc/wc?uri=<encoded>`
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
/** Lists the featured wallets — the modal's primary "Stellar wallets" section. */
export declare function listFeaturedMobileWallets(): MobileWalletDeepLink[];
/** Lists the non-featured wallets — the modal's collapsible "More wallets" section. */
export declare function listAdditionalMobileWallets(): MobileWalletDeepLink[];
/** Looks up a registered wallet by id. */
export declare function getMobileWallet(id: string): MobileWalletDeepLink | undefined;
/**
 * Builds the WalletConnect pairing deep link for a registered wallet —
 * `freighterwallet://wc-redirect/wc?uri=wc%3A...` — ready for `Linking.openURL()`.
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