/**
 * ConnectingView — shown while a wallet's connect() promise is in flight.
 * Port of the web modal's `.connecting-view`, metrics 1:1:
 *
 *   [breathing 56×56 squircle logo inside an 88×88 wrap]
 *   [the squircle dash-arc spinner — NOT a circle, like the web]
 *   Continue in {Wallet}                     (17/600, -0.015em)
 *   Accept connection request in the wallet  (14/1.5 muted, ≤280 wide)
 *   ↻ Try again                              (999-radius pill — error only)
 *
 * Error variant (`connecting-view--error`): the spinner arc disappears,
 * the logo stops breathing, the subtitle turns danger-colored with the
 * failure message, and a "Try again" pill re-fires the same wallet. The
 * header (rendered by AppKitModal) shows the back arrow + wallet name,
 * exactly like the web's `.header--connecting`.
 *
 * Deep-link extras (mobile-only, stacked under the web-parity core):
 * - "Open in wallet app" re-fires the deep link while pairing waits
 * - when neither the wallet's scheme nor universal link could open, the
 *   card swaps in an "isn't installed" hint with a store Install button
 *   plus a "Copy pairing code" fallback for wallets with manual pairing
 *
 * Animation timings match web v1.9.50: 2.5s logo breathe, 2s spinner arc
 * (2.5s under reduced motion; breathe and the staggered entrance are
 * disabled there, web: `animation: none`).
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
    /** Web: connecting.accept_request, or the error subtitle on failure. */
    subtitle: string;
    /** True once connect() rejected — switches to the error variant. */
    error: boolean;
    openFailed: boolean;
    failedWalletName?: string;
    onInstallFailedWallet: () => void;
    onRetryOpen: () => void;
    /** Re-runs connect() for the same wallet (web: retry-connecting). */
    onRetryConnect: () => void;
    /** Shares the pairing URI — set when a mobile wallet was picked and the URI is ready. */
    onShareUri?: () => void;
    reopenWallet?: () => void;
}
export declare function ConnectingView(props: ConnectingViewProps): React.JSX.Element;
//# sourceMappingURL=ConnectingView.d.ts.map