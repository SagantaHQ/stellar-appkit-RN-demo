/**
 * AppKit provider — creates the StellarAppKit client once, owns the modal
 * open/close state, the Albedo + xBull WebView bridges, and the theme
 * selection.
 *
 * Connector assembly:
 * - With EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID set:
 *     `defaultReactNativeConnectors()` → WalletConnect relay + Albedo
 *     WebView + xBull WebView. The modal offers Freighter Mobile via deep
 *     link first, QR fallback for every other WalletConnect wallet (LOBSTR,
 *     etc.).
 * - Without it: the Albedo + xBull WebView connectors alone, so the demo
 *   still runs end-to-end (connect → sign) with zero configuration.
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
import {
  StellarAppKit,
  createAlbedoWebViewConnector,
  createXBullWebViewConnector,
  createAsyncStorage,
  defaultReactNativeConnectors,
} from '@saganta/stellar-appkit-react-native';
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
}

const AppKitDemoContext = createContext<AppKitDemoContextValue | null>(null);

export function AppKitProvider({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [albedoView, setAlbedoView] = useState<ReactElement | null>(null);
  const [xbullView, setXBullView] = useState<ReactElement | null>(null);
  const [themeId, setThemeId] = useState('stellarDark');
  const [presentation, setPresentation] = useState<'bottomsheet' | 'inline'>('bottomsheet');

  // The bridge renders Albedo's confirm page into a state-held element;
  // created exactly once.
  const albedoBridge = useMemo(() => createAlbedoWebViewBridge(setAlbedoView), []);
  // Same pattern for xBull — the web wallet (wallet.xbull.app) speaks a
  // nacl-box popup protocol that the bridge reproduces inside a WebView.
  const xbullBridge = useMemo(() => createXBullWebViewBridge(setXBullView), []);

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
    });
  }, [albedoBridge, xbullBridge]);

  // Pre-warm WalletConnect at app start: the SignClient's module tree
  // evaluation + relay WebSocket handshake then complete while the user is
  // still on the home screen — instead of freezing the first wallet tap for
  // seconds (warmUp is idempotent and swallows errors; a cold connector just
  // retries on the user's tap). The modal warms again on open as a no-op
  // safety net for apps that skip this.
  useEffect(() => {
    void client.registry.get('walletconnect')?.warmUp?.();
  }, [client]);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const theme = useMemo(
    () => THEMES.find((t) => t.id === themeId)?.value ?? THEMES[0].value,
    [themeId]
  );

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
    }),
    [client, modalOpen, openModal, closeModal, albedoView, xbullView, theme, themeId, presentation]
  );

  return <AppKitDemoContext.Provider value={value}>{children}</AppKitDemoContext.Provider>;
}

export function useAppKitDemo(): AppKitDemoContextValue {
  const ctx = useContext(AppKitDemoContext);
  if (!ctx) throw new Error('useAppKitDemo must be used inside <AppKitProvider>');
  return ctx;
}
