/**
 * WalletIcon — renders wallet icons on React Native with ZERO native image
 * dependencies (no react-native-svg).
 *
 * RN's <Image> renders PNG/JPEG/GIF/WebP data URIs and https URLs natively,
 * but NOT SVG — which is what most core connectors ship. Rather than
 * pulling in an SVG rasterizer, <WalletIcon> resolves around SVG:
 *
 * - explicit `walletKey` (connector id / mobile wallet id) → pre-rasterized
 *   compressed PNG from ./wallet-icons.ts (all core SVG logos converted)
 * - source already a raster (mobile-registry icons, most WalletConnect peer
 *   icons) → rendered directly
 * - `fallbackLabel` matched against known wallet names → PNG registry
 *   (a WC peer named "Freighter" gets the Freighter logo even when its
 *   registered icon is an SVG URL)
 * - nothing matched → branded letter avatar (stable per-name color)
 *
 * The resolution logic lives in ./icon-utils.ts (pure, unit-tested); this
 * file is the rendering layer.
 */
import React from 'react';
export interface WalletIconProps {
    /** Raw icon source — data URI or https URL. May be null/undefined or SVG. */
    source?: string | null;
    /**
     * Wallet key — a core connector id ("albedo", "walletconnect") or a
     * mobile-registry id ("freighter-mobile"). Takes priority over `source`.
     */
    walletKey?: string | null;
    /** Fallback label (wallet name) for the letter avatar and name matching. */
    fallbackLabel?: string;
    /** Icon size in dp (square). Default 40. */
    size?: number;
    /** Corner radius in dp. Default 12. */
    radius?: number;
    /** Text color on the letter-avatar fallback background. */
    accentTextColor?: string;
}
export declare function WalletIcon({ source, walletKey, fallbackLabel, size, radius, accentTextColor, }: WalletIconProps): React.JSX.Element;
//# sourceMappingURL=WalletIcon.d.ts.map