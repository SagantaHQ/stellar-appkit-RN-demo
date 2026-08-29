/**
 * ConnectingView — shown while a wallet's connect() promise (or a sign
 * request) is in flight. Port of the web modal's `.connecting-view`:
 *
 *   [breathing wallet logo behind a spinning arc]
 *   Continue in {Wallet}
 *   Accept connection request in the wallet
 *
 * Deep-link extras (mobile-only):
 * - "Open in wallet app" re-fires the deep link while pairing waits
 * - when neither the wallet's scheme nor universal link could open, the
 *   card swaps in an "isn't installed" hint with a store Install button
 *   plus a "Copy pairing code" fallback for wallets with manual pairing
 *
 * Animation timings match web v1.9.50: 2.5s logo breathe, 2s spinner arc,
 * both reduced-motion aware (breathe off, spinner slowed to 2.5s).
 */
import React from 'react';
import type { AppKitStyles } from '../styles.js';
import type { ConnectThemeRN } from '../theme.js';
export interface ConnectingViewProps {
    styles: AppKitStyles;
    theme: ConnectThemeRN;
    reducedMotion: boolean;
    walletName: string;
    walletIcon: string | null;
    /** Registry/connector key for PNG icon resolution. */
    walletKey: string | null;
    subtitle: string;
    openFailed: boolean;
    failedWalletName?: string;
    onInstallFailedWallet: () => void;
    onRetryOpen: () => void;
    /** Shares the pairing URI — set when a mobile wallet was picked and the URI is ready. */
    onShareUri?: () => void;
    reopenWallet?: () => void;
}
export declare function ConnectingView(props: ConnectingViewProps): React.JSX.Element;
//# sourceMappingURL=ConnectingView.d.ts.map