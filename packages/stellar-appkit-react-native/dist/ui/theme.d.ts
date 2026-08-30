/**
 * Design tokens for the React Native modal — a port of ui-web's tokens.ts.
 *
 * Same token names and the same 5 themes × 2 variants as the web SDK, but
 * with RN-native values: radii are numbers (dp) instead of 'px' strings, and
 * there are no CSS custom properties — RN styles are plain objects. A host
 * app can override any token by spreading a theme and replacing fields.
 */
export interface ConnectThemeRN {
    colorBg: string;
    colorSurface: string;
    colorSurfaceHover: string;
    colorBorder: string;
    colorText: string;
    colorTextMuted: string;
    colorAccent: string;
    colorAccentText: string;
    colorDanger: string;
    /** dp — RN has no 'px' strings. */
    radiusSm: number;
    radiusMd: number;
    radiusLg: number;
    overlayColor: string;
}
declare const ACCENTS: {
    readonly minimal: {
        readonly dark: '#FAFAFA';
        readonly light: '#18181B';
    };
    readonly stellar: {
        readonly dark: '#6EE7B7';
        readonly light: '#0E9A6E';
    };
    readonly sky: {
        readonly dark: '#38BDF8';
        readonly light: '#0EA5E9';
    };
    readonly ocean: {
        readonly dark: '#60A5FA';
        readonly light: '#1D4ED8';
    };
    readonly sunset: {
        readonly dark: '#FB7185';
        readonly light: '#E11D48';
    };
};
export type ThemeName = keyof typeof ACCENTS;
export declare const minimalDark: ConnectThemeRN;
export declare const minimalLight: ConnectThemeRN;
export declare const stellarDark: ConnectThemeRN;
export declare const stellarLight: ConnectThemeRN;
export declare const skyDark: ConnectThemeRN;
export declare const skyLight: ConnectThemeRN;
export declare const oceanDark: ConnectThemeRN;
export declare const oceanLight: ConnectThemeRN;
export declare const sunsetDark: ConnectThemeRN;
export declare const sunsetLight: ConnectThemeRN;
/** Default theme — matches the web modal's default (minimal dark). */
export declare const defaultTheme: ConnectThemeRN;
export {};
//# sourceMappingURL=theme.d.ts.map