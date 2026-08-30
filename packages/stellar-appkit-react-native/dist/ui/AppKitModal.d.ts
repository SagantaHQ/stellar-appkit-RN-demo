/**
 * AppKitModal — the React Native modal UI for Stellar AppKit.
 *
 * This file is the orchestrator only: it owns the view state machine
 * (list → connecting → account / error / signing / SIWS phases), the
 * connect actions and the deep-link handoff. Every screen is its own
 * file under ./views/:
 *
 *   views/HeaderView.tsx       — web .header (brand / connecting-back /
 *                                connected-wallet variants)
 *   views/WalletListView.tsx   — wallet picker (web-parity flat rows)
 *   views/WalletRowView.tsx    — one wallet row (.wallet-row port)
 *   views/ConnectingView.tsx   — connecting (+ error variant + animations)
 *   views/SigningView.tsx      — signing (+ error variant)
 *   views/SiwsView.tsx         — Sign-In With Stellar phases + error
 *   views/AccountView.tsx      — connected account
 *   views/ErrorView.tsx        — generic error + network mismatch
 *
 * UX parity with the web `<stellar-appkit-modal>` (ui-web connect-modal.ts):
 *
 * - **Error routing** matches the web exactly: a failed connect stays on
 *   the connecting view (its error variant: wallet logo, danger subtitle,
 *   "Try again" pill); a rejected sign stays on the signing view (Cancel +
 *   Try again); NetworkMismatchError opens the wrong-network view;
 *   everything else opens the generic error state.
 * - **Back arrow** — while connecting (error or not), on SIWS errors and
 *   on signing errors the header shows the `.header--connecting` variant:
 *   back chevron + centered wallet name + close. Back cancels the state
 *   and returns to the wallet list.
 * - **SIWS** — when `client.siwsConfig` is set, the automatic sign-in
 *   flow runs right after a successful connect (checking → nonce →
 *   signing → verifying → account), with retry caps, per-step timeouts
 *   and disconnect-on-fail exactly like the web modal (useSiws.ts).
 * - **Inline mode** — `mode="inline"` renders the panel in place (web
 *   `mode="inline"`): bordered card, no overlay, no close button, always
 *   visible; `open`/`onClose` only apply to the bottom-sheet mode.
 * - **Footer** — "Powered by Stellar AppKit", pinned at the panel bottom
 *   like the web `.footer`.
 *
 * Mobile-native deviations (deliberate, documented in ARCHITECTURE.md):
 * - **Deep-link-only pairing**: on a phone the same device would have to
 *   scan a QR code, so the RN modal never renders one. Every wallet row
 *   embeds the WalletConnect pairing URI into the wallet's own deep link
 *   (`freighterwallet://wc-redirect/wc?uri=...`) and hands off to the OS,
 *   Solana-Mobile-Adapter style. "Copy pairing code" covers wallets with
 *   manual pairing fields.
 * - **True wallet names** — connecting/signing/SIWS views carry the
 *   wallet's own name and icon, never a generic "WalletConnect" label.
 *
 * Presentation: @gorhom/bottom-sheet with a backdrop + swipe-to-dismiss
 * (default), or the inline panel. Icons render through `<WalletIcon>` —
 * zero native image dependencies; the spinner is the pure-View squircle
 * arc port (SquircleArc), no react-native-svg anywhere.
 */
import React from 'react';
import type { ImageSourcePropType } from 'react-native';
import type { StellarAppKit } from '@saganta/stellar-appkit';
import { type ConnectThemeRN } from './theme.js';
export interface AppKitModalProps {
    client: StellarAppKit;
    /**
     * Bottom-sheet mode only: whether the sheet is presented. Ignored in
     * inline mode (the panel is always rendered, like the web's
     * `mode="inline"` whose open() is a no-op).
     */
    open: boolean;
    onClose: () => void;
    theme?: ConnectThemeRN;
    /**
     * Presentation mode — web parity:
     * - 'bottomsheet' (default): the @gorhom/bottom-sheet overlay
     * - 'inline': the panel renders in place, bordered, always visible
     */
    mode?: 'bottomsheet' | 'inline';
    /** Header title override (web `title` attribute). Defaults to the localized view title. */
    title?: string;
    /** Header logo (web `logo-src` attribute). 22×22, radius 6. */
    logo?: ImageSourcePropType;
}
export declare function AppKitModal({ client, open, onClose, theme, mode, title, logo, }: AppKitModalProps): React.JSX.Element | null;
//# sourceMappingURL=AppKitModal.d.ts.map