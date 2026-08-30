/**
 * Pure-React-Native icon primitives — pixel ports of ui-web's icons.ts.
 *
 * The web modal draws its chrome icons as small inline SVGs (20×20
 * viewBox, stroke 1.5, round caps). The RN package deliberately ships
 * zero SVG dependencies (wallet logos are pre-rasterized PNGs for the
 * same reason), so these icons are composed from thin rounded Views —
 * one `Bar` per SVG line segment, `Ring`/`Box` for strokes-with-radius.
 *
 * Every geometry constant below mirrors the web path data 1:1.
 */
import React from 'react';
export interface IconProps {
    color: string;
    /** Rendered side in dp (icons are square). Web renders most at 16. */
    size?: number;
}
/** icons.chevronLeft — `M12 15L7 10L12 5` (header back arrow). */
export declare function ChevronLeftIcon({ color, size }: IconProps): React.JSX.Element;
/** icons.close — `M5 5L15 15` + `M15 5L5 15` (header close). */
export declare function CloseIcon({ color, size }: IconProps): React.JSX.Element;
/** icons.check — `M4 10.5L8 14.5L16 6` (copied feedback). */
export declare function CheckIcon({ color, size }: IconProps): React.JSX.Element;
/** icons.externalLink — `M8 5H15V12` + `M15 5L6 14`. */
export declare function ExternalLinkIcon({ color, size }: IconProps): React.JSX.Element;
/**
 * icons.copy — web: `<rect x="7" y="7" width="9" height="9" rx="1.5"/>`
 * + `M13 7V5.5C13 4.67 12.33 4 11.5 4H5.5C4.67 4 4 4.67 4 5.5V11.5
 * C4 12.33 4.67 13 5.5 13H7` (front sheet + back sheet bracket).
 */
export declare function CopyIcon({ color, size }: IconProps): React.JSX.Element;
/**
 * icons.logOut — web: `M8 4H5.5C4.67 4 4 4.67 4 5.5V14.5C4 15.33 4.67 16
 * 5.5 16H8` (door bracket) + `M13 13.5L16.5 10L13 6.5` (arrowhead)
 * + `M16 10H8` (arrow shaft).
 */
export declare function LogOutIcon({ color, size }: IconProps): React.JSX.Element;
/** The overflow "⋯" glyph (web renders three inline SVG circles at 20×20). */
export declare function MoreDotsIcon({ color, size }: IconProps): React.JSX.Element;
/**
 * icons.alertCircle — ring + stem + dot (error / network-mismatch views).
 * Web: `<circle cx="10" cy="10" r="7"/>` + `M10 6.5V10.5` + filled r=0.9 dot.
 */
export declare function AlertCircleIcon({ color, size }: IconProps): React.JSX.Element;
/**
 * The signing-error glyph (web renderSigning error variant):
 * 24-viewBox `<circle cx="12" cy="12" r="10"/>` + `M15 9l-6 6` + `M9 9l6 6`,
 * rendered at 40px with strokeWidth 1.5.
 */
export declare function CircleXIcon({ color, size }: IconProps): React.JSX.Element;
/**
 * The retry arrow (web "Try again" pills): 24-viewBox
 * `M3 12a9 9 0 1 0 9-9` — a ¾ ring missing its top-left quarter —
 * plus the `M3 4v5h5` arrowhead bracket, rendered at 14px strokeWidth 2.
 */
export declare function RetryIcon({ color, size }: IconProps): React.JSX.Element;
/**
 * icons.wallet — the generic fallback tile + overflow "Switch wallet".
 * Web: `<rect x="3" y="6" width="14" height="10" rx="2"/>` + `M3 8.5H17`
 * + filled circle at (13.5, 12) r=1.
 */
export declare function WalletGlyphIcon({ color, size }: IconProps): React.JSX.Element;
//# sourceMappingURL=icons.d.ts.map