/**
 * WalletListView — the wallet picker, mirroring the web modal's flat
 * `.wallet-row` list (packages/ui-web connect-modal.ts renderWalletList):
 *
 * - registered connectors with reachability → "Installed" outline badge /
 *   muted Locked / Install pill — exactly the web status matrix
 * - named mobile wallets (Freighter, LOBSTR, HOT, Scopuly, …) pair via deep
 *   link, so they carry the muted "Open in wallet app" hint — the native
 *   analog of the web WalletConnect row's "Scan QR Code"
 * - the 17 additional WalletConnect-registered wallets collapse under a
 *   "More wallets (N)" expander so the sheet stays scannable (RN-only
 *   necessity — the web list is flat because it only has ~7 connectors)
 *
 * Rows are flat and individually rounded — no cards, no separators.
 */
import React from 'react';
import { type MobileWalletDeepLink } from '../../deep-links.js';
import type { AppKitStyles } from '../styles.js';
import type { ConnectThemeRN } from '../theme.js';
import type { WalletRow } from '../types.js';
export interface WalletListViewProps {
    styles: AppKitStyles;
    theme: ConnectThemeRN;
    loading: boolean;
    rows: WalletRow[];
    /** Whether the WalletConnect connector is registered (mobile wallets need it). */
    showMobileWallets: boolean;
    showMore: boolean;
    onToggleMore: () => void;
    onConnectMobile: (wallet: MobileWalletDeepLink) => void;
    onConnectConnector: (walletId: string) => void;
    onInstall: (row: WalletRow) => void;
}
export declare function WalletListView(props: WalletListViewProps): React.JSX.Element;
//# sourceMappingURL=WalletListView.d.ts.map