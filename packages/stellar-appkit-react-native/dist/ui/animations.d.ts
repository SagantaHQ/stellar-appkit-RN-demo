/**
 * RN Animated equivalents of the web modal's connecting/signing animations.
 *
 * Timing parity with ui-web v1.9.50 (the reduced-motion fix release):
 * - logo breathe: 2.5s ease-in-out, infinite
 * - spinner dash: 2s linear, infinite
 * - prefers-reduced-motion: spinner capped at 2.5s (never the old 8s), breathe disabled
 *
 * On RN, "reduced motion" comes from the OS accessibility setting via
 * `AccessibilityInfo.isReduceMotionEnabled()` — the same signal the web modal
 * reads through `matchMedia('(prefers-reduced-motion: reduce)')`.
 */
import { Animated } from 'react-native';
/** Reads the OS "reduce motion" accessibility setting (async, one-shot). */
export declare function useReducedMotion(): boolean;
/**
 * The logo "breathe" — a gentle 1 → 1.06 → 1 scale loop.
 * 2.5s ease-in-out, matching the web modal. Disabled entirely under
 * reduced motion (web sets `animation: none` there).
 */
export declare function useBreathe(reducedMotion: boolean): Animated.Value;
/**
 * The spinner — a 360° rotation loop. 2s linear to match the web modal's
 * `sak-connecting-dash 2s linear infinite`; slowed to 2.5s under reduced
 * motion (web: `animation-duration: 2.5s`), never the pre-v1.9.50 8s.
 *
 * Kept for backward compatibility (public export). The web-parity
 * squircle spinner (SquircleArc) consumes `useLoopProgress` instead —
 * the same 0→1 cycle but consumed as dash-pattern progress rather than
 * a rotation angle.
 */
export declare function useSpinner(reducedMotion: boolean): Animated.Value;
/**
 * Staggered entrance for the connecting/signing views — port of the web
 * `.connecting-view > *` cascade: each child fades in and slides up 8px
 * over 0.5s `cubic-bezier(0.16, 1, 0.3, 1)`, delayed 0/80/160/240ms by
 * child index (web caps the delays at the 4th child; later children all
 * ride the 240ms slot). Disabled entirely under reduced motion (web:
 * `animation: none; opacity: 1`).
 *
 * Returns one style per child index 0..count-1.
 */
export declare function useEntranceStagger(count: number, reducedMotion: boolean): Array<{
    opacity: Animated.Value;
    translateY: Animated.Value;
}>;
//# sourceMappingURL=animations.d.ts.map