/**
 * Squircle track geometry — the pure math behind the connecting/signing
 * spinner, ported 1:1 from ui-web's `.connecting-view__arc`:
 *
 *   <svg viewBox="0 0 88 88">
 *     <rect x="3" y="3" width="82" height="82" rx="20" ry="20"
 *           stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
 *           stroke-dasharray="120 240" />
 *   </svg>
 *   @keyframes sak-connecting-dash { to { stroke-dashoffset: -360; } }
 *   (2s linear infinite — .signing-view__arc runs the same dash at 0.8s)
 *
 * The web spinner is therefore NOT a circle: it is a rounded-square
 * ("squircle") outline with a ~120-unit dash comet traveling clockwise
 * around its perimeter. This module reproduces that exact geometry with
 * plain numbers so the React Native side can render it with ordinary
 * Views (no react-native-svg dependency) and bun can unit-test every
 * value against the SVG spec.
 *
 * How the RN rendering works (see SquircleArc.tsx):
 * the track is divided into short segments; each segment is a thin,
 * rounded View placed along the path. Every segment's OPACITY is driven
 * by one shared 0→1 progress value through a per-segment keyframe
 * interpolation that reproduces the exact painted fraction of the SVG
 * dash pattern at each point in the cycle. With enough segments the
 * comet's edges slide smoothly (per-segment opacity ramps act as
 * sub-segment "PWM"), and because every interpolation hangs off the
 * same native-driven Animated.Value, the whole spinner animates on the
 * UI thread at 60fps with zero JS involvement.
 */
/** The exact SVG numbers from ui-web styles.ts / connect-modal.ts. */
export declare const SQUIRCLE_SPEC: {
    /** viewBox side — the spinner renders 1:1 in dp. */
    readonly box: 88;
    /** rect x/y. */
    readonly x: 3;
    readonly y: 3;
    /** rect width/height. */
    readonly size: 82;
    /** corner radius (rx = ry). */
    readonly radius: 20;
    /** stroke-width. */
    readonly strokeWidth: 2.5;
    /** dasharray: painted dash length. */
    readonly dash: 120;
    /** dasharray: gap length. */
    readonly gap: 240;
    /** dash pattern period (dash + gap) — also the dashoffset travel per cycle. */
    readonly period: 360;
    /** connecting-view__arc duration (reduced motion: 2.5s, see below). */
    readonly connectingDurationMs: 2000;
    readonly connectingReducedMotionDurationMs: 2500;
    /** signing-view__arc duration (no reduced-motion override on web). */
    readonly signingDurationMs: 800;
    /** logo breathe duration (disabled under reduced motion). */
    readonly breatheDurationMs: 2500;
    readonly breatheScale: 1.06;
};
/** Total perimeter of the rounded rect: 4·(size − 2r) + 2π·r. */
export declare function squirclePerimeter(spec?: {
    /** viewBox side — the spinner renders 1:1 in dp. */
    readonly box: 88;
    /** rect x/y. */
    readonly x: 3;
    readonly y: 3;
    /** rect width/height. */
    readonly size: 82;
    /** corner radius (rx = ry). */
    readonly radius: 20;
    /** stroke-width. */
    readonly strokeWidth: 2.5;
    /** dasharray: painted dash length. */
    readonly dash: 120;
    /** dasharray: gap length. */
    readonly gap: 240;
    /** dash pattern period (dash + gap) — also the dashoffset travel per cycle. */
    readonly period: 360;
    /** connecting-view__arc duration (reduced motion: 2.5s, see below). */
    readonly connectingDurationMs: 2000;
    readonly connectingReducedMotionDurationMs: 2500;
    /** signing-view__arc duration (no reduced-motion override on web). */
    readonly signingDurationMs: 800;
    /** logo breathe duration (disabled under reduced motion). */
    readonly breatheDurationMs: 2500;
    readonly breatheScale: 1.06;
}): number;
/** A point on the SVG rect path, parameterized by arc length (clockwise). */
export interface PathPoint {
    x: number;
    y: number;
    /** Tangent angle in degrees (0 = +x, 90 = +y / screen-down). */
    angle: number;
}
/**
 * Exact arc-length parameterization of the SVG `<rect>` path.
 *
 * Per the SVG spec the rect path starts at (x + rx, y) — i.e. at the top
 * edge just after the top-left corner — and proceeds clockwise:
 * top edge → TR arc → right edge → BR arc → bottom edge → BL arc →
 * left edge → TL arc → close.
 */
export declare function pointOnSquirclePath(s: number, spec?: {
    /** viewBox side — the spinner renders 1:1 in dp. */
    readonly box: 88;
    /** rect x/y. */
    readonly x: 3;
    readonly y: 3;
    /** rect width/height. */
    readonly size: 82;
    /** corner radius (rx = ry). */
    readonly radius: 20;
    /** stroke-width. */
    readonly strokeWidth: 2.5;
    /** dasharray: painted dash length. */
    readonly dash: 120;
    /** dasharray: gap length. */
    readonly gap: 240;
    /** dash pattern period (dash + gap) — also the dashoffset travel per cycle. */
    readonly period: 360;
    /** connecting-view__arc duration (reduced motion: 2.5s, see below). */
    readonly connectingDurationMs: 2000;
    readonly connectingReducedMotionDurationMs: 2500;
    /** signing-view__arc duration (no reduced-motion override on web). */
    readonly signingDurationMs: 800;
    /** logo breathe duration (disabled under reduced motion). */
    readonly breatheDurationMs: 2500;
    readonly breatheScale: 1.06;
}): PathPoint;
/** One renderable slice of the track. */
export interface TrackSegment {
    /** Arc-length window on the path, `a < b`, both within [0, perimeter). */
    a: number;
    b: number;
    /** Segment midpoint on the path (viewBox units). */
    cx: number;
    cy: number;
    /** Tangent angle at the midpoint (degrees) — the View's rotation. */
    angle: number;
    /** Segment length along the path (viewBox units). */
    length: number;
}
/**
 * Divides the squircle path into renderable segments: each straight edge
 * into `edgeDivisions` pieces, each corner arc into `cornerDivisions`
 * pieces. Straight-edge segments are geometrically EXACT (the edge is
 * straight); corner segments are chords whose sagitta stays well under
 * half a pixel at the defaults, invisible at stroke 2.5.
 */
export declare function buildSquircleTrack(edgeDivisions?: number, cornerDivisions?: number, spec?: {
    /** viewBox side — the spinner renders 1:1 in dp. */
    readonly box: 88;
    /** rect x/y. */
    readonly x: 3;
    readonly y: 3;
    /** rect width/height. */
    readonly size: 82;
    /** corner radius (rx = ry). */
    readonly radius: 20;
    /** stroke-width. */
    readonly strokeWidth: 2.5;
    /** dasharray: painted dash length. */
    readonly dash: 120;
    /** dasharray: gap length. */
    readonly gap: 240;
    /** dash pattern period (dash + gap) — also the dashoffset travel per cycle. */
    readonly period: 360;
    /** connecting-view__arc duration (reduced motion: 2.5s, see below). */
    readonly connectingDurationMs: 2000;
    readonly connectingReducedMotionDurationMs: 2500;
    /** signing-view__arc duration (no reduced-motion override on web). */
    readonly signingDurationMs: 800;
    /** logo breathe duration (disabled under reduced motion). */
    readonly breatheDurationMs: 2500;
    readonly breatheScale: 1.06;
}): TrackSegment[];
/**
 * Painted length of the arc-length window [a, b) under the SVG dash
 * pattern at cycle fraction `t` ∈ [0, 1].
 *
 * The pattern is `dash` painted / `gap` blank, repeating with period
 * `dash + gap` along the path; animating stroke-dashoffset from 0 to
 * −period slides the pattern FORWARD along the path. A path position p
 * is painted iff (p − period·t) mod period ∈ [0, dash) — i.e. iff
 * p ∈ [period·t, period·t + dash) + k·period for some integer k.
 */
export declare function paintedLength(a: number, b: number, t: number, dash?: number, period?: number): number;
/** Piecewise-linear opacity keyframes for one segment's Animated interpolation. */
export interface CometKeyframes {
    /** Cycle fractions (strictly increasing, starts at 0, ends at 1). */
    input: number[];
    /** Painted fraction 0..1 at each input. */
    output: number[];
}
/**
 * EXACT opacity keyframes for a segment: the painted fraction of [a, b)
 * is piecewise-linear in t, with slope changes exactly where a window
 * edge (front or front − dash) crosses a segment edge (a or b). We emit
 * those breakpoints (plus 0 and 1) and evaluate the true coverage at
 * each — no sampling, no approximation. Coverage is continuous, and
 * coverage(1) === coverage(0), so the loop seam is invisible.
 */
export declare function cometKeyframes(seg: Pick<TrackSegment, 'a' | 'b'>, dash?: number, period?: number): CometKeyframes;
/**
 * The full static comet description: every track segment with its
 * precomputed keyframes. Pure and deterministic — computed once at
 * module load and shared by every SquircleArc instance.
 */
export interface CometSegment extends TrackSegment {
    keyframes: CometKeyframes;
}
/** Shared, immutable — the spinner's entire geometry in one array. */
export declare const SQUIRCLE_COMET: CometSegment[];
//# sourceMappingURL=squircle-track.d.ts.map