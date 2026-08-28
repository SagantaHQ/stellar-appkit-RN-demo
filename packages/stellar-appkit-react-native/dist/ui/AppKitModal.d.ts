/**
 * AppKitModal — the React Native modal UI for Stellar AppKit.
 *
 * Feature parity with the web `<stellar-appkit-modal>` adapted to native
 * idioms (per ARCHITECTURE.md's RN plan):
 *
 * - Wallet list with live reachability states (WalletConnect pinned first)
 * - WalletConnect pairing view with the **mobile-first flow**: instead of
 *   leading with a QR code, registered deep-link wallets (Freighter) are
 *   offered first — tap one and we hand off to the wallet with the pairing
 *   URI embedded (`freighterwallet://wc?uri=...`), Solana-Mobile-Adapter
 *   style. QR remains the fallback for every other wallet.
 * - Connecting / signing views with the same animation timings as web
 *   v1.9.50 (2.5s breathe, 2s spinner, reduced-motion aware)
 * - Account view with share/disconnect
 * - Error view with retry
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