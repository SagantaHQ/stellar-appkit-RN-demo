/**
 * AppKit provider — creates the StellarAppKit client once, owns the modal
 * open/close state, the Albedo WebView bridge, and the theme selection.
 *
 * Connector assembly:
 * - With EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID set:
 *     `defaultReactNativeConnectors()` → WalletConnect relay + Albedo WebView.
 *     The modal offers Freighter Mobile via deep link first, QR fallback for
 *     every other WalletConnect wallet (LOBSTR, etc.).
 * - Without it: the Albedo WebView connector alone, so the demo still runs
 *   end-to-end (connect → sign) with zero configuration.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StellarAppKit,
  createAlbedoWebViewConnector,
  createAsyncStorage,
  defaultReactNativeConnectors,
} from '@saganta/stellar-appkit-react-native';
import { createAlbedoWebViewBridge } from '@saganta/stellar-appkit-react-native/albedo';
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
  const [themeId, setThemeId] = useState('stellarDark');
  const [presentation, setPresentation] = useState<'bottomsheet' | 'inline'>('bottomsheet');

  // The bridge renders Albedo's confirm page into a state-held element;
  // created exactly once.
  const albedoBridge = useMemo(() => createAlbedoWebViewBridge(setAlbedoView), []);

  const client = useMemo(() => {
    const connectors = WC_PROJECT_ID
      ? defaultReactNativeConnectors({
          projectId: WC_PROJECT_ID,
          albedoBridge,
          albedoOrigin: APP_URL,
        })
      : [
          // No WalletConnect project id — demo mode: Albedo only.
          createAlbedoWebViewConnector({ bridge: albedoBridge, origin: APP_URL }),
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
  }, [albedoBridge]);

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
      walletConnectConfigured: WC_PROJECT_ID.length > 0,
      theme,
      themeId,
      setThemeId,
      presentation,
      setPresentation,
    }),
    [client, modalOpen, openModal, closeModal, albedoView, theme, themeId, presentation]
  );

  return <AppKitDemoContext.Provider value={value}>{children}</AppKitDemoContext.Provider>;
}

export function useAppKitDemo(): AppKitDemoContextValue {
  const ctx = useContext(AppKitDemoContext);
  if (!ctx) throw new Error('useAppKitDemo must be used inside <AppKitProvider>');
  return ctx;
}
