/**
 * AppKitModal — the React Native modal UI for Stellar AppKit.
 *
 * This file is the orchestrator only: it owns the view state machine
 * (list → connecting → account / error), the connect actions and the
 * deep-link handoff, and the @gorhom/bottom-sheet shell. Every screen is
 * its own file under ./views/ for easy management:
 *
 *   views/WalletListView.tsx   — wallet picker (web-parity flat rows)
 *   views/WalletRowView.tsx    — one wallet row (.wallet-row port)
 *   views/ConnectingView.tsx   — connecting / signing (+ animations)
 *   views/AccountView.tsx      — connected account
 *   views/ErrorView.tsx        — failure + retry
 *
 * Shared types live in ./types.ts, the design system in ./styles.ts.
 *
 * Feature parity with the web `<stellar-appkit-modal>` adapted to native
 * idioms (per ARCHITECTURE.md's RN plan):
 *
 * - **Deep-link-only pairing**: on a phone the same device would have to
 *   scan a QR code, so the RN modal never renders one. Every wallet row
 *   embeds the WalletConnect pairing URI into the wallet's own deep link
 *   (`freighterwallet://wc?uri=...`) and hands off to the OS,
 *   Solana-Mobile-Adapter style.
 * - **Sectioned wallet list**: the featured Stellar-first wallets (Freighter,
 *   LOBSTR, HOT Wallet, Scopuly) plus the registered connectors (Albedo
 *   WebView, …) come first; every other WalletConnect-registered mobile
 *   wallet (SafePal, Blockchain.com, Arculus, Atomic Wallet, …) collapses
 *   under a "More wallets" expander so the sheet stays scannable.
 * - **True wallet names** — the connecting view, account view and
 *   sign-request prompts carry the wallet's own name and icon, never a
 *   generic "WalletConnect" label.
 * - **Copy pairing code** — when a deep link can't open the wallet, the
 *   pairing URI can still be shared/copied so wallets with manual pairing
 *   fields can complete the handshake.
 * - Connecting / signing views with the same animation timings as web
 *   v1.9.50 (2.5s breathe, 2s spinner, reduced-motion aware).
 * - Account view with share/disconnect. Error view with retry.
 *
 * Icons render through `<WalletIcon>` — zero native image dependencies:
 * wallet logos are pre-rasterized as compressed palette PNGs (with alpha)
 * in deep-links.ts and wallet-icons.ts, raster sources render natively, WC
 * peers match by name, and everything else gets a branded letter avatar.
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