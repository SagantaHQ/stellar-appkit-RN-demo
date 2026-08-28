/**
 * Internationalization (i18n) module for Stellar AppKit.
 *
 * Architecture:
 *
 * 1. **English is bundled** — `./locales/en.ts` is statically imported so the
 *    modal renders immediately on first load without a flash of untranslated
 *    text. No dynamic import, no network request.
 *
 * 2. **All other locales are lazy-loaded** — when `setLocale('zh-CN')` is
 *    called, we `await import('./locales/zh-CN.js')` which the bundler
 *    code-splits into a separate chunk. Only the locale the user actually
 *    needs is downloaded. This keeps the initial bundle small.
 *
 * 3. **ICU MessageFormat via `intl-messageformat`** — every message string
 *    is parsed into an `IntlMessageFormat` instance (cached per key+locale)
 *    and formatted with the provided interpolation values. This gives us
 *    `{variable}` interpolation, `{count, plural, ...}`, `{gender, select,
 *    ...}`, and proper number/date formatting for free.
 *
 * 4. **Fallback chain** — if a key is missing from the active locale, we
 *    fall back to English. If it's missing from English too, we return the
 *    key itself (useful for debugging — you immediately see which key is
 *    unhandled).
 *
 * 5. **Reactive** — `setLocale()` emits a `localechange` event that the
 *    React hook (`useLocale`) and the modal subscribe to, so the UI
 *    re-renders in the new language immediately.
 *
 * Usage:
 * ```ts
 * import { setLocale, getLocale, t, onLocaleChange, type LocaleCode } from '@saganta/stellar-appkit';
 *
 * // Set at app init
 * await setLocale('zh-CN');
 *
 * // Or pass via config
 * new StellarAppKit({ locale: 'zh-CN', ... });
 *
 * // Translate
 * t('wallet_list.loading');                              // "正在加载钱包…"
 * t('connecting.continue_in_wallet', { walletName: 'Freighter' });  // "在 Freighter 中继续"
 *
 * // React hooks (from ui-web)
 * import { useLocale, useSetLocale } from '@saganta/stellar-appkit-ui-web/react';
 * const locale = useLocale();
 * const setLocale = useSetLocale();
 * ```
 */
import { type LocaleMessages } from './locales/en.js';
/**
 * All supported locale codes. Each has a corresponding lazy-loaded file in
 * `./locales/`. English ('en') is the default and is bundled.
 *
 * To add a new locale:
 * 1. Create `./locales/<code>.ts` with the translated messages
 * 2. Add the code to this union type
 * 3. Add an entry to `LOADER_REGISTRY` in `loader.ts`
 */
export type LocaleCode = 'en' | 'zh-CN' | 'zh-TW' | 'es' | 'pt-BR' | 'ja' | 'ko' | 'de' | 'fr' | 'ru' | 'ar' | 'hi' | 'it' | 'tr' | 'pl' | 'vi' | 'id' | 'uk' | 'nl' | 'th' | 'he' | 'cs' | 'sv' | 'ro' | 'fa';
/** A locale message bundle — must match the shape of the English locale. */
export type Locale = LocaleMessages;
/**
 * Set of listeners that fire when the locale changes. The modal and the
 * React `useLocale()` hook subscribe to this so they can re-render.
 */
type LocaleChangeHandler = (locale: LocaleCode) => void;
/**
 * Loads a locale bundle, caching the result. English is returned synchronously
 * from the cache. All other locales are loaded via dynamic import().
 *
 * If the locale code is unknown (not in LOADER_REGISTRY), we return English
 * as a fallback rather than throwing — a wrong locale code should never
 * break the app.
 */
export declare function loadLocale(code: LocaleCode): Promise<LocaleMessages>;
/**
 * Changes the active locale. Lazy-loads the locale file if it hasn't been
 * loaded yet. Returns a Promise that resolves when the locale is active.
 *
 * After the locale is loaded, all subsequent `t()` calls use the new locale,
 * and a `localechange` event is emitted so subscribers (modal, React hooks)
 * can re-render.
 *
 * ```ts
 * await setLocale('zh-CN');
 * t('wallet_list.loading'); // "正在加载钱包…"
 * ```
 */
export declare function setLocale(code: LocaleCode): Promise<void>;
/**
 * Returns the currently active locale code.
 */
export declare function getLocale(): LocaleCode;
/**
 * Translates a key to the current locale, with optional interpolation values.
 *
 * The key is a dot-notation path into the locale object, e.g.:
 *   `t('wallet_list.loading')`
 *   `t('connecting.continue_in_wallet', { walletName: 'Freighter' })`
 *
 * If the key is missing from the current locale, falls back to English.
 * If it's missing from English too, returns the key itself (for debugging).
 *
 * Uses `intl-messageformat` under the hood, so ICU MessageFormat syntax is
 * supported:
 *   - `{variable}` — simple interpolation
 *   - `{count, plural, one {item} other {items}}` — pluralization
 *   - `{gender, select, male {he} female {she} other {they}}` — selection
 */
export declare function t(key: string, values?: Record<string, unknown>): string;
/**
 * Subscribes to locale changes. Returns an unsubscribe function.
 *
 * The handler is called immediately with the current locale code on
 * subscription (so the subscriber can initialize its state without an
 * extra call to getLocale()).
 */
export declare function onLocaleChange(handler: LocaleChangeHandler): () => void;
/**
 * Preloads a locale without switching to it. Useful for prefetching the
 * user's likely-next locale (e.g., based on browser language) so the
 * switch is instant when they click.
 *
 * ```ts
 * // Prefetch the user's browser language
 * preloadLocale(navigator.language as LocaleCode);
 * ```
 */
export declare function preloadLocale(code: LocaleCode): Promise<void>;
/**
 * Returns the list of all supported locale codes. Useful for rendering a
 * language picker in your app's settings.
 */
export declare function getSupportedLocales(): LocaleCode[];
export {};
//# sourceMappingURL=index.d.ts.map