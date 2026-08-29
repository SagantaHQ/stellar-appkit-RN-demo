/**
 * WalletRowView — one row of the wallet list, a native port of the web
 * modal's `.wallet-row` markup:
 *
 * ```html
 * <button class="wallet-row">            → Pressable (rounded, press → surfaceHover)
 *   <span class="wallet-tile">…</span>   → 40dp squircle tile, shadow, no border
 *   <span class="wallet-name">…</span>   → 14/500, flex 1, left-aligned
 *   <span class="wallet-sub…">…</span>   → right-hand status
 * </button>
 * ```
 *
 * The right-hand status mirrors the web variants exactly:
 * - `installed`  → `.wallet-sub--installed` outline badge with a 6dp accent dot
 * - `muted`      → `.wallet-sub` plain muted text (Locked / Open in wallet app / …)
 * - `install`    → `.wallet-install-btn` accent pill (row keeps full opacity —
 *                  the button IS the call to action, web does the same)
 * - none         → bare row (chevron-free, like the web list)
 *
 * Unavailable wallets dim to 0.55 (`.wallet-row[data-unavailable="true"]`).
 */
import React from 'react';
import type { AppKitStyles } from '../styles.js';
import type { ConnectThemeRN } from '../theme.js';
/** Which right-hand status the row shows (mirrors the web wallet-sub variants). */
export type WalletRowStatus = {
    kind: 'installed';
} | {
    kind: 'muted';
    text: string;
} | {
    kind: 'install';
};
export interface WalletRowViewProps {
    styles: AppKitStyles;
    theme: ConnectThemeRN;
    icon: string | null;
    /** Registry/connector key for icon resolution (PNG registry lookup). */
    walletKey?: string | null;
    name: string;
    onPress: () => void;
    /** Blocks the row press (not-installed / unavailable rows keep their badge). */
    disabled?: boolean;
    /** Web [data-unavailable="true"] → opacity 0.55. */
    dimmed?: boolean;
    /** Right-hand status variant; omit for a bare row. */
    status?: WalletRowStatus;
    /** Fires the accent Install pill (status: 'install'). */
    onInstall?: () => void;
}
export declare function WalletRowView(props: WalletRowViewProps): React.JSX.Element;
//# sourceMappingURL=WalletRowView.d.ts.map