/**
 * Compressed PNG wallet icons for React Native.
 *
 * The web SDK ships its connector logos as SVG data URIs (browsers render
 * those natively), but React Native's <Image> cannot rasterize SVG — and we
 * deliberately do NOT depend on react-native-svg (large native library).
 * Instead, every SVG icon the RN modal can encounter is pre-rasterized here
 * as a 128×128 palette-quantized PNG (~0.2–1.7 KB each, ~7 KB total) that
 * RN's <Image> renders natively.
 *
 * Resolution order for a wallet icon (see icon-utils.ts → resolveWalletIcon):
 *   1. explicit wallet key (connector id / mobile wallet id)
 *   2. the icon source itself when it is already a raster (PNG/JPEG data
 *      URI or https URL) — mobile-registry icons and most WalletConnect
 *      peer-metadata icons take this path
 *   3. the wallet's display name (covers WC peers: "Freighter" → Freighter
 *      logo even when the peer ships an SVG URL we cannot render)
 *   4. letter-avatar fallback
 */
/** connector id → pre-rasterized PNG data URI (compressed, 128×128). */
export declare const WALLET_PNG_ICONS: Readonly<Record<string, string>>;
/** lowercases, trims, collapses whitespace — " HOT  Wallet " → "hot wallet". */
export declare function normalizeWalletName(name: string): string;
/**
 * Resolves a wallet icon by key — a core connector id ("albedo",
 * "walletconnect") or a mobile-registry id ("freighter-mobile"). Returns
 * null for unknown keys.
 */
export declare function resolveWalletIconByKey(key: string | null | undefined): string | null;
/**
 * Resolves a wallet icon from a display name (e.g. a WalletConnect peer's
 * name). Checks the alias table first, then the registered mobile wallets'
 * names, then the built-in PNG icon keys. Case/whitespace insensitive.
 */
export declare function resolveWalletIconByName(name: string | null | undefined): string | null;
//# sourceMappingURL=wallet-icons.d.ts.map