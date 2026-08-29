/**
 * AccountView — the connected state. Port of the web modal's connected view
 * (avatar + address + disconnect), plus the native share affordance for the
 * address (RN has no clipboard-guaranteed navigator.clipboard, so Share is
 * the idiomatic surface).
 *
 * Branding comes from the client's session peer — a WalletConnect pair shows
 * the actual wallet's name/icon (Freighter, LOBSTR, …), never the generic
 * "WalletConnect" label.
 */
import React from 'react';
import type { AppKitStyles } from '../styles.js';
import type { ConnectThemeRN } from '../theme.js';
export interface AccountViewProps {
    styles: AppKitStyles;
    theme: ConnectThemeRN;
    address: string;
    walletName: string;
    walletIcon: string | null;
    pendingSigns: number;
    onShare: () => void;
    onDisconnect: () => void;
}
export declare function AccountView(props: AccountViewProps): React.JSX.Element;
//# sourceMappingURL=AccountView.d.ts.map