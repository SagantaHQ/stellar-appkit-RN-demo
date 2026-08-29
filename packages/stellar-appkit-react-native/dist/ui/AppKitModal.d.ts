/**
 * AppKitModal — the React Native modal UI for Stellar AppKit.
 *
 * Feature parity with the web `<stellar-appkit-modal>` adapted to native
 * idioms (per ARCHITECTURE.md's RN plan):
 *
 * - **Named mobile wallet list**: every Stellar wallet with a mobile app and
 *   a WalletConnect registration (Freighter, LOBSTR, HOT Wallet, Scopuly)
 *   gets its own row — tap it and we deep-link straight into that wallet
 *   with the pairing URI embedded (`freighterwallet://wc?uri=...`),
 *   Solana-Mobile-Adapter style. The connecting view, account view and
 *   sign-request prompts all carry the wallet's own name and icon — never
 *   a generic "WalletConnect" label.
 * - **WalletConnect (QR)** row for every other WC wallet (SafePal, Hana,
 *   and anything else with the Stellar namespace) — pairing view with the
 *   mobile wallets listed first, QR fallback, copy/share URI.
 * - **Albedo (WebView)** row when its connector is registered.
 * - Connecting / signing views with the same animation timings as web
 *   v1.9.50 (2.5s breathe, 2s spinner, reduced-motion aware).
 * - Account view with share/disconnect.
 * - Error view with retry.
 *
 * Icons render through `<WalletIcon>` — zero native image dependencies:
 * the core SVG logos are pre-rasterized as compressed PNGs (wallet-icons.ts),
 * raster sources render natively, WC peers match by name, and everything
 * else gets a branded letter avatar. The pairing QR is `<QrCodeView>` —
 * pure-JS encoder + plain Views (no react-native-qrcode-svg either).
 *
 * Presentation: @gorhom/bottom-sheet with a backdrop, swipe-to-dismiss.
 */
import React from 'react';
import type { StellarAppKit } from '@saganta/stellar-appkit';
import { type ConnectThemeRN } from './theme.js';
export interface AppKitModalProps {
    client: StellarAppKit;
    open: boolean;
    onClose: () => void;
    theme?: ConnectThemeRN;
}
export declare function AppKitModal({ client, open, onClose, theme }: AppKitModalProps): React.JSX.Element | null;
//# sourceMappingURL=AppKitModal.d.ts.map