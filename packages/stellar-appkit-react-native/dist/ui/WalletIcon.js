import { jsx as _jsx } from "react/jsx-runtime";
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
import { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { fallbackBackgroundColor, resolveWalletIcon } from './icon-utils.js';
export function WalletIcon({ source, walletKey, fallbackLabel = '?', size = 40, radius = 12, accentTextColor = '#FFFFFF', }) {
    const [failed, setFailed] = useState(false);
    const resolved = useMemo(() => resolveWalletIcon({ source, walletKey, name: fallbackLabel }), [source, walletKey, fallbackLabel]);
    const boxStyle = { width: size, height: size, borderRadius: radius };
    const letter = (fallbackLabel.trim()[0] ?? '?').toUpperCase();
    // Resolved raster (registry PNG / raster data URI / raster URL) → Image.
    if (resolved && !failed) {
        return (_jsx(Image, { source: { uri: resolved }, style: boxStyle, resizeMode: "cover", accessible: true, accessibilityLabel: fallbackLabel, onError: () => setFailed(true) }));
    }
    // Fallback — branded letter avatar.
    return (_jsx(View, { style: [boxStyle, styles.fallback, { backgroundColor: fallbackBackgroundColor(fallbackLabel) }], accessible: true, accessibilityLabel: fallbackLabel, children: _jsx(Text, { style: [styles.fallbackText, { color: accentTextColor, fontSize: Math.round(size * 0.42) }], children: letter }) }));
}
const styles = StyleSheet.create({
    fallback: { alignItems: 'center', justifyContent: 'center' },
    fallbackText: { fontWeight: '700' },
});
//# sourceMappingURL=WalletIcon.js.map