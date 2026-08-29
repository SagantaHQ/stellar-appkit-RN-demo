/**
 * SiwsView — the Sign-In With Stellar flow UI. Port of the web modal's
 * renderSiwsLoading() + renderSiwsError(), metrics 1:1:
 *
 * Loading (checking / nonce / signing / verifying):
 *   [breathing wallet logo + the 2s squircle dash-arc]
 *   Sign-In With Stellar                     (17/600)
 *   Checking session… / Fetching secure nonce… /
 *   Approve the sign-in request in {Wallet} / Verifying your signature…
 *   Cancel                                   (ghost pill, 13/500 muted)
 *
 * Error:
 *   [wallet logo — no arc]
 *   Sign-in failed                           (17/600)
 *   {message}                                (danger)
 *   ↻ Try again  /  Connect wallet           (retry pill)
 *
 * Cancel stops the flow (and disconnects when disconnectOnFail — the
 * default — is set). "Try again" re-runs it; when the wallet got
 * disconnected meanwhile, the pill becomes "Connect wallet" and returns
 * to the wallet list.
 */
import React from 'react';
import type { AppKitStyles } from '../styles.js';
import type { ConnectThemeRN } from '../theme.js';
export interface SiwsViewProps {
    styles: AppKitStyles;
    theme: ConnectThemeRN;
    reducedMotion: boolean;
    walletName: string;
    walletIcon: string | null;
    walletKey: string | null;
    /** 'siws-checking' | 'siws-nonce' | 'siws-signing' | 'siws-verifying' | 'siws-error'. */
    phase: 'siws-checking' | 'siws-nonce' | 'siws-signing' | 'siws-verifying' | 'siws-error';
    /** Error message for the siws-error phase. */
    error: string | null;
    /** Web renders "Connect wallet" instead of "Try again" when disconnected. */
    walletConnected: boolean;
    onCancel: () => void;
    onRetry: () => void;
}
export declare function SiwsView(props: SiwsViewProps): React.JSX.Element;
//# sourceMappingURL=SiwsView.d.ts.map