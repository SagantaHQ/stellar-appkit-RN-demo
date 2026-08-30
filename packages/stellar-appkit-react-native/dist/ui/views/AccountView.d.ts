/**
 * AccountView — the connected state, a 1:1 port of the web modal's
 * `renderConnected()` (ui-web connect-modal.ts):
 *
 *   [gradient avatar] GABC…XYZW ⧉        ⋯     ← header row (tap = copy)
 *                     ● testnet  ↗              ← network pill + explorer
 *   ┌ overflow menu: Switch Wallet / Disconnect ┐ (under ⋯)
 *   [◌ pending signatures banner — only while signing]
 *   XLM BALANCE
 *   123.45 XLM                ← 32/700 mono, skeleton while loading
 *   [Get Testnet funds]       ← TESTNET only (friendbot)
 *   Funding requested — …     ← 3s banner after the tap
 *   RECENT ACTIVITY
 *   ✓ payment    Aug 30    -1.00 XLM ↗
 *   ✗ …
 *
 * Deviations (mobile-native, documented in ARCHITECTURE.md):
 * - The avatar is a solid deterministic color instead of a CSS linear
 *   gradient (RN has no zero-dep gradient) — same address-hash hue logic.
 * - Copy uses the OS share sheet (RN has no universal clipboard API in core)
 *   with the same check-glyph feedback; explorer links open via Linking.
 * - The overflow menu is a modal-safe inline card (no absolute positioning
 *   inside the scrollable sheet).
 */
import React from 'react';
import { type TxHistoryItem } from '../accountData.js';
import type { AppKitStyles } from '../styles.js';
import type { ConnectThemeRN } from '../theme.js';
export interface AccountViewProps {
    styles: AppKitStyles;
    theme: ConnectThemeRN;
    address: string;
    /** Session network — 'TESTNET' shows the friendbot button (web parity). */
    network: string;
    pendingSigns: number;
    /** Balance + history from useAccountData. */
    balance: string | null;
    history: TxHistoryItem[];
    /** True while the initial balance fetch runs (skeleton state). */
    balanceLoading: boolean;
    /** True for ~3s after the friendbot tap (funds-requested banner). */
    fundsRequested: boolean;
    /** True for ~1.5s after the address copy tap (check glyph, web parity). */
    copied: boolean;
    onCopyAddress: () => void;
    onOpenExplorer: () => void;
    onGetFunds: () => void;
    onSwitchWallet: () => void;
    onDisconnect: () => void;
    onTxPress: (tx: TxHistoryItem) => void;
}
export declare function AccountView(props: AccountViewProps): React.JSX.Element;
//# sourceMappingURL=AccountView.d.ts.map