/**
 * Design tokens for the React Native modal — a port of ui-web's tokens.ts.
 *
 * Same token names and the same 5 themes × 2 variants as the web SDK, but
 * with RN-native values: radii are numbers (dp) instead of 'px' strings, and
 * there are no CSS custom properties — RN styles are plain objects. A host
 * app can override any token by spreading a theme and replacing fields.
 */
const BASE = {
    radiusSm: 10,
    radiusMd: 14,
    radiusLg: 20,
};
const DARK_BASE = {
    ...BASE,
    colorBg: '#09090B',
    colorSurface: '#18181B',
    colorSurfaceHover: '#27272A',
    colorBorder: '#27272A',
    colorText: '#FAFAFA',
    colorTextMuted: '#A1A1AA',
    colorDanger: '#DC2626',
    overlayColor: 'rgba(0, 0, 0, 0.65)',
};
const LIGHT_BASE = {
    ...BASE,
    colorBg: '#FFFFFF',
    colorSurface: '#F8F8F8',
    colorSurfaceHover: '#F1F1F1',
    colorBorder: '#E4E4E7',
    colorText: '#18181B',
    colorTextMuted: '#71717A',
    colorDanger: '#DC2626',
    overlayColor: 'rgba(0, 0, 0, 0.45)',
};
const ACCENTS = {
    minimal: { dark: '#FAFAFA', light: '#18181B' },
    stellar: { dark: '#6EE7B7', light: '#0E9A6E' },
    sky: { dark: '#38BDF8', light: '#0EA5E9' },
    ocean: { dark: '#60A5FA', light: '#1D4ED8' },
    sunset: { dark: '#FB7185', light: '#E11D48' },
};
function darkVariant(name) {
    return { ...DARK_BASE, colorAccent: ACCENTS[name].dark, colorAccentText: '#09090B' };
}
function lightVariant(name) {
    return { ...LIGHT_BASE, colorAccent: ACCENTS[name].light, colorAccentText: '#FFFFFF' };
}
export const minimalDark = darkVariant('minimal');
export const minimalLight = lightVariant('minimal');
export const stellarDark = darkVariant('stellar');
export const stellarLight = lightVariant('stellar');
export const skyDark = darkVariant('sky');
export const skyLight = lightVariant('sky');
export const oceanDark = darkVariant('ocean');
export const oceanLight = lightVariant('ocean');
export const sunsetDark = darkVariant('sunset');
export const sunsetLight = lightVariant('sunset');
/** Default theme — matches the web modal's default (minimal dark). */
export const defaultTheme = minimalDark;
//# sourceMappingURL=theme.js.map