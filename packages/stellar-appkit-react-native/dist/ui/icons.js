import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View } from 'react-native';
/** Default viewBox side the web paths are authored against. */
const VB = 20;
/** A single stroked line segment (x1,y1)→(x2,y2) with round caps. */
function Bar({ x1, y1, x2, y2, color, width, scale, }) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const w = (length + width) * scale; // +width: round caps overshoot each end
    const h = width * scale;
    return (_jsx(View, { style: {
            position: 'absolute',
            left: ((x1 + x2) / 2) * scale - w / 2,
            top: ((y1 + y2) / 2) * scale - h / 2,
            width: w,
            height: h,
            borderRadius: h / 2,
            backgroundColor: color,
            transform: [{ rotate: `${angle}deg` }],
        } }));
}
/** Scales icon viewBox units → dp. */
function scaleFor(size) {
    return size / VB;
}
/** icons.chevronLeft — `M12 15L7 10L12 5` (header back arrow). */
export function ChevronLeftIcon({ color, size = 16 }) {
    const s = scaleFor(size);
    return (_jsxs(View, { style: { width: size, height: size }, children: [_jsx(Bar, { x1: 7, y1: 10, x2: 12, y2: 5, color: color, width: 1.5, scale: s }), _jsx(Bar, { x1: 7, y1: 10, x2: 12, y2: 15, color: color, width: 1.5, scale: s })] }));
}
/** icons.close — `M5 5L15 15` + `M15 5L5 15` (header close). */
export function CloseIcon({ color, size = 16 }) {
    const s = scaleFor(size);
    return (_jsxs(View, { style: { width: size, height: size }, children: [_jsx(Bar, { x1: 5, y1: 5, x2: 15, y2: 15, color: color, width: 1.5, scale: s }), _jsx(Bar, { x1: 15, y1: 5, x2: 5, y2: 15, color: color, width: 1.5, scale: s })] }));
}
/** icons.check — `M4 10.5L8 14.5L16 6` (copied feedback). */
export function CheckIcon({ color, size = 16 }) {
    const s = scaleFor(size);
    return (_jsxs(View, { style: { width: size, height: size }, children: [_jsx(Bar, { x1: 4, y1: 10.5, x2: 8, y2: 14.5, color: color, width: 1.5, scale: s }), _jsx(Bar, { x1: 8, y1: 14.5, x2: 16, y2: 6, color: color, width: 1.5, scale: s })] }));
}
/** icons.externalLink — `M8 5H15V12` + `M15 5L6 14`. */
export function ExternalLinkIcon({ color, size = 16 }) {
    const s = scaleFor(size);
    return (_jsxs(View, { style: { width: size, height: size }, children: [_jsx(Bar, { x1: 8, y1: 5, x2: 15, y2: 5, color: color, width: 1.5, scale: s }), _jsx(Bar, { x1: 15, y1: 5, x2: 15, y2: 12, color: color, width: 1.5, scale: s }), _jsx(Bar, { x1: 15, y1: 5, x2: 6, y2: 14, color: color, width: 1.5, scale: s })] }));
}
/**
 * icons.alertCircle — ring + stem + dot (error / network-mismatch views).
 * Web: `<circle cx="10" cy="10" r="7"/>` + `M10 6.5V10.5` + filled r=0.9 dot.
 */
export function AlertCircleIcon({ color, size = 16 }) {
    const s = scaleFor(size);
    const sw = 1.5 * s;
    return (_jsxs(View, { style: { width: size, height: size }, children: [_jsx(View, { style: {
                    position: 'absolute',
                    left: 3 * s,
                    top: 3 * s,
                    width: 14 * s,
                    height: 14 * s,
                    borderRadius: 7 * s,
                    borderWidth: sw,
                    borderColor: color,
                } }), _jsx(Bar, { x1: 10, y1: 6.5, x2: 10, y2: 10.5, color: color, width: 1.5, scale: s }), _jsx(View, { style: {
                    position: 'absolute',
                    left: (10 - 0.9) * s,
                    top: (13.2 - 0.9) * s,
                    width: 1.8 * s,
                    height: 1.8 * s,
                    borderRadius: 0.9 * s,
                    backgroundColor: color,
                } })] }));
}
/**
 * The signing-error glyph (web renderSigning error variant):
 * 24-viewBox `<circle cx="12" cy="12" r="10"/>` + `M15 9l-6 6` + `M9 9l6 6`,
 * rendered at 40px with strokeWidth 1.5.
 */
export function CircleXIcon({ color, size = 40 }) {
    const s = size / 24;
    const sw = 1.5 * s;
    return (_jsxs(View, { style: { width: size, height: size }, children: [_jsx(View, { style: {
                    position: 'absolute',
                    left: 2 * s,
                    top: 2 * s,
                    width: 20 * s,
                    height: 20 * s,
                    borderRadius: 10 * s,
                    borderWidth: sw,
                    borderColor: color,
                } }), _jsx(Bar, { x1: 15, y1: 9, x2: 9, y2: 15, color: color, width: 1.5, scale: s }), _jsx(Bar, { x1: 9, y1: 9, x2: 15, y2: 15, color: color, width: 1.5, scale: s })] }));
}
/**
 * The retry arrow (web "Try again" pills): 24-viewBox
 * `M3 12a9 9 0 1 0 9-9` — a ¾ ring missing its top-left quarter —
 * plus the `M3 4v5h5` arrowhead bracket, rendered at 14px strokeWidth 2.
 */
export function RetryIcon({ color, size = 14 }) {
    const s = size / 24;
    const sw = 2 * s;
    const box = 18 * s; // ring outer side: r=9 centered (12,12) → 3..21
    return (_jsxs(View, { style: { width: size, height: size }, children: [_jsx(View, { style: {
                    position: 'absolute',
                    left: 3 * s,
                    top: 3 * s,
                    width: box,
                    height: box,
                    borderRadius: 9 * s,
                    borderWidth: sw,
                    borderColor: color,
                    borderTopColor: 'transparent',
                    borderLeftColor: 'transparent',
                } }), _jsx(Bar, { x1: 3, y1: 4, x2: 3, y2: 9, color: color, width: 2, scale: s }), _jsx(Bar, { x1: 3, y1: 9, x2: 8, y2: 9, color: color, width: 2, scale: s })] }));
}
/**
 * icons.wallet — the generic fallback tile + overflow "Switch wallet".
 * Web: `<rect x="3" y="6" width="14" height="10" rx="2"/>` + `M3 8.5H17`
 * + filled circle at (13.5, 12) r=1.
 */
export function WalletGlyphIcon({ color, size = 16 }) {
    const s = scaleFor(size);
    return (_jsxs(View, { style: { width: size, height: size }, children: [_jsx(View, { style: {
                    position: 'absolute',
                    left: 3 * s,
                    top: 6 * s,
                    width: 14 * s,
                    height: 10 * s,
                    borderRadius: 2 * s,
                    borderWidth: 1.5 * s,
                    borderColor: color,
                } }), _jsx(Bar, { x1: 3, y1: 8.5, x2: 17, y2: 8.5, color: color, width: 1.5, scale: s }), _jsx(View, { style: {
                    position: 'absolute',
                    left: 12.5 * s,
                    top: 11 * s,
                    width: 2 * s,
                    height: 2 * s,
                    borderRadius: 1 * s,
                    backgroundColor: color,
                } })] }));
}
//# sourceMappingURL=icons.js.map