/**
 * Device-locale detection for the i18n module — the RN analog of the web
 * app calling `setLocale(navigator.language)`.
 *
 * The core i18n module (`@saganta/stellar-appkit`) never auto-detects the
 * locale on any platform — the app decides (the web demos ship a locale
 * switcher page). On React Native the natural default IS the device
 * language, so this helper reads it from the RN native modules (zero extra
 * dependencies — no expo-localization, no react-native-localize) and maps
 * it onto the supported `LocaleCode` set:
 *
 *   detectDeviceLocale()              → 'fr' | 'zh-CN' | … | null
 *   await applyDeviceLocale()         → setLocale(detect) + return the code
 *
 * Both are safe to call anywhere — unknown/unsupported locales return null
 * (and `applyDeviceLocale()` then leaves the active locale untouched, i.e.
 * English), never throwing.
 */
import { type LocaleCode } from '@saganta/stellar-appkit';
/**
 * Normalizes a raw device locale onto the supported `LocaleCode` set.
 *
 *   "fr_FR"          → "fr"        (region stripped when the bare language matches)
 *   "zh_CN"          → "zh-CN"     (underscore + case normalized)
 *   "pt-BR"          → "pt-BR"     (already canonical)
 *   "en_US"          → "en"
 *   "gsw_LI"         → null        (unsupported — caller keeps the current locale)
 */
export declare function normalizeToDeviceLocale(raw: string | null | undefined): LocaleCode | null;
/**
 * The device's locale mapped onto the supported `LocaleCode` set, or null
 * when the device language isn't translated (the app then keeps whatever
 * locale is active — English by default).
 */
export declare function detectDeviceLocale(): LocaleCode | null;
/**
 * Applies the device locale to the core i18n module (one-shot convenience
 * for app init). Returns the applied locale, or null when the device
 * language isn't supported and the active locale was left untouched.
 *
 * ```ts
 * // App entry — before the first render, so the modal never flashes English
 * await applyDeviceLocale();
 * ```
 */
export declare function applyDeviceLocale(): Promise<LocaleCode | null>;
//# sourceMappingURL=locale.d.ts.map