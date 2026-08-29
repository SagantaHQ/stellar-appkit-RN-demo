/**
 * SigningView — shown while the wallet processes a sign request.
 * Port of the web modal's `.signing-view`, metrics 1:1:
 *
 *   [breathing 56×56 logo + squircle dash-arc at 0.8s — faster than
 *    connecting's 2s, signaling "work in progress"]
 *   Continue in {Wallet}                     (17/600)
 *   Approve the request in your wallet to continue (14/1.5 muted)
 *
 * Error variant (`signing-view--error`): the logo disappears, a 40px
 * danger circle-X glyph takes over, the title becomes "Signing rejected",
 * the subtitle carries the error, and a Cancel + Try again action row
 * appears (web `.signing-view__actions`).
 */
import React from 'react';
import type { AppKitStyles } from '../styles.js';
import type { ConnectThemeRN } from '../theme.js';
export interface SigningViewProps {
    styles: AppKitStyles;
    theme: ConnectThemeRN;
    reducedMotion: boolean;
    walletName: string;
    walletIcon: string | null;
    walletKey: string | null;
    /** Error message — switches to the error variant. */
    error: string | null;
    onRetry: () => void;
    onCancel: () => void;
}
export declare function SigningView(props: SigningViewProps): React.JSX.Element;
//# sourceMappingURL=SigningView.d.ts.map