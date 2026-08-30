/**
 * AppKit provider — creates the StellarAppKit client once, owns the modal
 * open/close state, the Albedo + xBull WebView bridges, the theme + locale
 * selection, and the SIWS (Sign-In With Stellar) demo backend.
 *
 * Connector assembly:
 * - With EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID set:
 *     `defaultReactNativeConnectors()` → WalletConnect relay + Albedo
 *     WebView + xBull WebView. The modal offers Freighter Mobile via deep
 *     link first, QR fallback for every other WalletConnect wallet (LOBSTR,
 *     etc.).
 * - Without it: the Albedo + xBull WebView connectors alone, so the demo
 *     still runs end-to-end (connect → sign) with zero configuration.
 *
 * i18n: the device locale is applied at startup (applyDeviceLocale) and the
 * language switcher re-calls setLocale — the modal re-renders instantly.
 *
 * SIWS: this demo has no server, so the SiwsConfig callbacks run a
 * "server-in-your-pocket": AsyncStorage plays the session store, the nonce
 * is generated on-device, and verification uses the REAL
 * @saganta/stellar-appkit-siws-verify package (the same code a backend
 * would run). In production, session/nonce/verify/signout would be HTTP
 * calls to your backend.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import * as ExpoWebBrowser from 'expo-web-browser';
import {
  StellarAppKit,
  applyDeviceLocale,
  createAlbedoWebViewConnector,
  createXBullWebViewConnector,
  createAsyncStorage,
  createThemedBrowserSession,
  defaultReactNativeConnectors,
  setLocale,
  getLocale,
  onLocaleChange,
  type LocaleCode,
  type SiwsSession,
  type ThemedBrowserSession,
} from '@saganta/stellar-appkit-react-native';
import { verifySiws } from '@saganta/stellar-appkit-siws-verify';
import { createAlbedoWebViewBridge } from '@saganta/stellar-appkit-react-native/albedo';
import { createXBullWebViewBridge } from '@saganta/stellar-appkit-react-native/xbull';
import {
  minimalDark,
  minimalLight,
  stellarDark,
  stellarLight,
  skyDark,
  skyLight,
  oceanDark,
  oceanLight,
  sunsetDark,
  sunsetLight,
  type ConnectThemeRN,
} from '@saganta/stellar-appkit-react-native/ui';
import { APP_DESCRIPTION, APP_ICON_URL, APP_NAME, APP_URL, WC_PROJECT_ID } from './constants';
import { randomNonce } from './stellar';

export interface ThemeOption {
  id: string;
  label: string;
  value: ConnectThemeRN;
}

/** All 10 themes shipped with the RN modal — same tokens as the web SDK. */
export const THEMES: ThemeOption[] = [
  { id: 'minimalDark', label: 'Minimal · Dark', value: minimalDark },
  { id: 'minimalLight', label: 'Minimal · Light', value: minimalLight },
  { id: 'stellarDark', label: 'Stellar · Dark', value: stellarDark },
  { id: 'stellarLight', label: 'Stellar · Light', value: stellarLight },
  { id: 'skyDark', label: 'Sky · Dark', value: skyDark },
  { id: 'skyLight', label: 'Sky · Light', value: skyLight },
  { id: 'oceanDark', label: 'Ocean · Dark', value: oceanDark },
  { id: 'oceanLight', label: 'Ocean · Light', value: oceanLight },
  { id: 'sunsetDark', label: 'Sunset · Dark', value: sunsetDark },
  { id: 'sunsetLight', label: 'Sunset · Light', value: sunsetLight },
];

/** The demo's language switcher — every locale the core i18n module ships. */
export const LOCALES: Array<{ code: LocaleCode; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'es', label: 'Español' },
  { code: 'pt-BR', label: 'Português (BR)' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'ru', label: 'Русский' },
  { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'it', label: 'Italiano' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'pl', label: 'Polski' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'uk', label: 'Українська' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'th', label: 'ไทย' },
  { code: 'he', label: 'עברית' },
  { code: 'cs', label: 'Čeština' },
  { code: 'sv', label: 'Svenska' },
  { code: 'ro', label: 'Română' },
  { code: 'fa', label: 'فارسی' },
];

/** AsyncStorage key for the SIWS demo session (the "server" session store). */
const SIWS_SESSION_KEY = 'demo.siws.session';

interface AppKitDemoContextValue {
  client: StellarAppKit;
  /** Whether the modal bottom sheet is open. */
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  /** The Albedo WebView screen — MUST be rendered at the app root. */
  albedoView: ReactElement | null;
  /** The xBull web-wallet screen — MUST be rendered at the app root. */
  xbullView: ReactElement | null;
  /** True when EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID is set. */
  walletConnectConfigured: boolean;
  /** Currently selected modal theme (also drives the app chrome). */
  theme: ConnectThemeRN;
  themeId: string;
  setThemeId: (id: string) => void;
  /** Modal presentation: the @gorhom/bottom-sheet overlay, or the inline panel (web mode="inline"). */
  presentation: 'bottomsheet' | 'inline';
  setPresentation: (mode: 'bottomsheet' | 'inline') => void;
  /** Active locale (modal + every t() string translates). */
  locale: LocaleCode;
  setAppLocale: (code: LocaleCode) => Promise<void>;
  /** SIWS toggle — rebuilding the client with/without the siws config. */
  siwsEnabled: boolean;
  setSiwsEnabled: (on: boolean) => void;
  /**
   * Auto-minimize toggle — the modal's `autoCloseOnComplete` prop: when the
   * operation the app requested completes (connect settles after the
   * deep-link return, or the sign queue drains cleanly), the sheet
   * dismisses itself after a short confirmation flash and focus returns
   * to this screen. Off = the web modal's stay-open account view.
   */
  autoCloseOnComplete: boolean;
  setAutoCloseOnComplete: (on: boolean) => void;
  /**
   * The themed in-app browser (Chrome Custom Tabs / SFSafariViewController,
   * styled like a modal from the active theme). Passed to the modal so
   * explorer/install/footer links open in-app, and usable directly.
   */
  browser: ThemedBrowserSession;
}

const AppKitDemoContext = createContext<AppKitDemoContextValue | null>(null);

export function AppKitProvider({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [albedoView, setAlbedoView] = useState<ReactElement | null>(null);
  const [xbullView, setXBullView] = useState<ReactElement | null>(null);
  const [themeId, setThemeId] = useState('stellarDark');
  const [presentation, setPresentation] = useState<'bottomsheet' | 'inline'>('bottomsheet');
  const [locale, setLocaleState] = useState<LocaleCode>(getLocale());
  const [siwsEnabled, setSiwsEnabled] = useState(false);
  const [autoCloseOnComplete, setAutoCloseOnComplete] = useState(true);

  // Follow the device language at startup — unsupported languages keep
  // English. The switcher below can then override at any time.
  useEffect(() => {
    void applyDeviceLocale();
  }, []);

  // Keep React state in sync with any locale change (startup or switcher).
  useEffect(
    () => onLocaleChange((code) => setLocaleState(code)),
    []
  );

  // The bridge renders Albedo's confirm page into a state-held element;
  // created exactly once.
  const albedoBridge = useMemo(() => createAlbedoWebViewBridge(setAlbedoView), []);
  // Same pattern for xBull — the web wallet (wallet.xbull.app) speaks a
  // nacl-box popup protocol that the bridge reproduces inside a WebView.
  const xbullBridge = useMemo(() => createXBullWebViewBridge(setXBullView), []);

  /**
   * The demo's SIWS "backend" — a production app would point these at HTTP
   * endpoints (see the web demo's siws-sign-in example). Everything here
   * runs on-device with the REAL verification package.
   */
  const siwsConfig = useMemo(
    () => ({
      statement: `Sign in to ${APP_NAME}`,
      // A real server issues the nonce AND remembers it for verify() — this
      // demo closes the loop locally with randomNonce().
      nonce: async () => randomNonce(),
      session: async (): Promise<SiwsSession | null> => {
        try {
          const raw = await AsyncStorage.getItem(SIWS_SESSION_KEY);
          return raw ? (JSON.parse(raw) as SiwsSession) : null;
        } catch {
          return null;
        }
      },
      verify: async (
        data: {
          message: string;
          signedMessage: string;
          signerAddress: string;
          signedData?: string;
        },
        nonce: string
      ): Promise<SiwsSession | null> => {
        // The same call a backend makes — envelope checks (domain binding,
        // nonce, expiry) + ed25519 verification of the wallet's signature.
        const domain = APP_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
        const result = await verifySiws(
          { message: data.message, signedMessage: data.signedMessage, signerAddress: data.signerAddress, signedData: data.signedData },
          { expectedDomain: domain, expectedNonce: nonce }
        );
        if (!result.ok) return null;
        // Issue a 10-minute session (the SIWS message expiry).
        const expiry = Date.now() + 10 * 60 * 1000;
        const session: SiwsSession = {
          address: data.signerAddress,
          network: 'TESTNET',
          expiry,
        };
        await AsyncStorage.setItem(SIWS_SESSION_KEY, JSON.stringify(session));
        return session;
      },
      signout: async () => {
        await AsyncStorage.removeItem(SIWS_SESSION_KEY);
        return true;
      },
    }),
    []
  );

  const client = useMemo(() => {
    const connectors = WC_PROJECT_ID
      ? defaultReactNativeConnectors({
          projectId: WC_PROJECT_ID,
          albedoBridge,
          albedoOrigin: APP_URL,
          xbullBridge,
          xbullOrigin: APP_URL,
        })
      : [
          // No WalletConnect project id — demo mode: Albedo + xBull only.
          createAlbedoWebViewConnector({ bridge: albedoBridge, origin: APP_URL }),
          createXBullWebViewConnector({ bridge: xbullBridge, origin: APP_URL }),
        ];

    return new StellarAppKit({
      network: 'TESTNET',
      appMetadata: {
        name: APP_NAME,
        description: APP_DESCRIPTION,
        url: APP_URL,
        icons: [APP_ICON_URL],
      },
      storage: createAsyncStorage(AsyncStorage),
      connectors,
      ...(siwsEnabled ? { siws: siwsConfig } : {}),
    });
  }, [albedoBridge, xbullBridge, siwsEnabled, siwsConfig]);

  // Pre-warm WalletConnect at app start: the SignClient's module tree
  // evaluation + relay WebSocket handshake then complete while the user is
  // still on the home screen — instead of freezing the first wallet tap for
  // seconds (warmUp is idempotent and swallows errors; a cold connector just
  // retries on the user's tap). The modal warms again on open as a no-op
  // safety net for apps that skip this.
  useEffect(() => {
    void client.registry.get('walletconnect')?.warmUp?.();
  }, [client]);

  // Restore any persisted wallet session after (re)creating the client —
  // app restarts AND the SIWS toggle (which rebuilds the client with the
  // siws config) recover the connection instead of forcing a reconnect.
  // Sessions persist through createAsyncStorage, so the new client sees
  // the same storage.
  useEffect(() => {
    void client.restore();
  }, [client]);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const setAppLocale = useCallback(async (code: LocaleCode) => {
    await setLocale(code);
  }, []);

  const theme = useMemo(
    () => THEMES.find((t) => t.id === themeId)?.value ?? THEMES[0].value,
    [themeId]
  );

  /**
   * The themed system-browser session. Adapters are INJECTED (Metro
   * resolves static requires at bundle time — the library can't require
   * them itself):
   * - react-native-inappbrowser-reborn — full modal styling + Chrome Tab
   *   detection; its native module exists in dev-client/EAS builds (the
   *   demo already ships expo-dev-client)
   * - expo-web-browser — the same OS surfaces, bundled with Expo Go
   * The session degrades at runtime: reborn throwing (no native module in
   * Expo Go) falls straight to expo-web-browser, then to the external
   * browser. Rebuilt per theme so switching themes restyles the chrome.
   */
  const browser = useMemo(
    () =>
      createThemedBrowserSession(
        { reborn: InAppBrowser, expo: ExpoWebBrowser },
        { theme }
      ),
    [theme]
  );

  // Pre-warm the system browser process (Chrome Custom Tabs / SFSafariVC)
  // so the first themed open is instant — the browser analog of the
  // WalletConnect warm-up. No-op when only the external fallback exists.
  useEffect(() => {
    void browser.warmup();
  }, [browser]);

  const value = useMemo(
    () => ({
      client,
      modalOpen,
      openModal,
      closeModal,
      albedoView,
      xbullView,
      walletConnectConfigured: WC_PROJECT_ID.length > 0,
      theme,
      themeId,
      setThemeId,
      presentation,
      setPresentation,
      locale,
      setAppLocale,
      siwsEnabled,
      setSiwsEnabled,
      autoCloseOnComplete,
      setAutoCloseOnComplete,
      browser,
    }),
    [client, modalOpen, openModal, closeModal, albedoView, xbullView, theme, themeId, presentation, locale, setAppLocale, siwsEnabled, autoCloseOnComplete, browser]
  );

  return <AppKitDemoContext.Provider value={value}>{children}</AppKitDemoContext.Provider>;
}

export function useAppKitDemo(): AppKitDemoContextValue {
  const ctx = useContext(AppKitDemoContext);
  if (!ctx) throw new Error('useAppKitDemo must be used inside <AppKitProvider>');
  return ctx;
}
