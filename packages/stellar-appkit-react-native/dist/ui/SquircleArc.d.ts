/**
 * SquircleArc — the React Native port of the web modal's connecting
 * spinner (`.connecting-view__arc` / `.signing-view__arc`).
 *
 * The web spinner is NOT a circle: it is a rounded-square outline whose
 * 120-unit dash comet travels clockwise around the perimeter
 * (`stroke-dasharray: 120 240`, `stroke-dashoffset` animating to −360).
 * This component reproduces that exact look with plain Views —
 * `squircle-track.ts` divides the path into short segments and computes
 * each segment's EXACT painted fraction over the cycle; here every
 * segment becomes a thin rounded View whose opacity is keyframed off
 * one shared, native-driven progress value.
 *
 * Timings match ui-web v1.9.50 exactly:
 * - connecting arc: 2s linear (reduced motion: 2.5s)
 * - signing arc:    0.8s linear (no reduced-motion override on web)
 *
 * No react-native-svg dependency — geometry + opacity PWM only.
 */
import React from 'react';
import { Animated } from 'react-native';
export interface SquircleArcProps {
    /** Accent color — web uses `color: var(--sak-color-accent)`. */
    color: string;
    /** Rendered side in dp. Defaults to the web viewBox size (88). */
    size?: number;
    /** Stroke width in dp. Defaults to the web 2.5. */
    strokeWidth?: number;
    /** One full cycle in ms — 2000 connecting / 800 signing on web. */
    durationMs?: number;
    /** Pauses the animation (opacity holds its current value). */
    paused?: boolean;
}
/**
 * A 0→1 linear loop with `useNativeDriver` — the single Animated.Value
 * every segment's opacity interpolation hangs off. One native animation
 * drives the whole spinner; JS never runs per-frame.
 */
export declare function useLoopProgress(durationMs: number, paused?: boolean): Animated.Value;
export declare function SquircleArc({ color, size, strokeWidth, durationMs, paused, }: SquircleArcProps): React.JSX.Element;
//# sourceMappingURL=SquircleArc.d.ts.map