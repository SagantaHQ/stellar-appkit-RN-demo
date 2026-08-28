/** Shared constants for the demo app. */

export const APP_NAME = 'Stellar AppKit RN Demo';

export const APP_DESCRIPTION =
  'Official Expo demo for @saganta/stellar-appkit-react-native — connect a Stellar wallet, sign messages and transactions, all from Expo Go.';

export const APP_URL = 'https://github.com/SagantaHQ/stellar-appkit-RN-demo';

/** Raw icon URL used in WalletConnect session metadata (must be https). */
export const APP_ICON_URL =
  'https://raw.githubusercontent.com/SagantaHQ/stellar-appkit-RN-demo/main/assets/icon.png';

export const LIBRARY_URL = 'https://github.com/SagantaHQ/stellar-appkit';

export const DOCS_URL = 'https://stellarappkit.saganta.com';

export const WALLETCONNECT_CLOUD_URL = 'https://cloud.walletconnect.com';

/**
 * WalletConnect Cloud project id (https://cloud.walletconnect.com).
 * Read from EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID — Expo inlines EXPO_PUBLIC_*
 * env vars at bundle time, so this is baked in when you run `expo start`.
 * Empty string = not configured: the demo then registers only the Albedo
 * (WebView) connector instead of failing.
 */
export const WC_PROJECT_ID = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';

export const HORIZON_URL = 'https://horizon-testnet.stellar.org';

export const DEMO_MESSAGE =
  'Hello from the Stellar AppKit React Native demo! This message was signed inside Expo Go.';

/** Demo payment amount (XLM) — sent to your own address, so it only costs fees. */
export const DEMO_PAYMENT_AMOUNT = '0.0001';
