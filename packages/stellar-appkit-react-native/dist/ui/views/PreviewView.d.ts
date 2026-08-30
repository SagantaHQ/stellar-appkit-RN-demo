/**
 * PreviewView — the pre-signing confirmation panel, a 1:1 port of the web
 * modal's `renderTransactionPreview()` (ui-web connect-modal.ts):
 *
 *   [app thumb]──[wallet thumb]     (Reown-style two-thumbnail row)
 *   Sign message / Review transaction          (17/600)
 *   Sign this message to prove you own {wallet}… (13.5/1.5 muted)
 *   ┌ op summary ────────────────┐  (one card per operation, 13/1.5)
 *   │ ⚠ risk flags (info/warn/danger)
 *   └─────────────────────────────┘
 *   From GABC…XYZW ⧉     0.00001 stroops   (mono 11.5 meta row)
 *   [      Cancel      ] [      Sign      ]  (flex:1 pair, web .preview-btn)
 *
 * Same flow on web and RN: `client.signTransaction()/signMessage()` build a
 * decoded `TransactionPreview` and await the modal's `onPreviewTransaction`
 * handler BEFORE the wallet ever sees the request — this view IS that
 * handler's UI. Approve resolves(true) → the signing view takes over;
 * Cancel resolves(false) → back to the account / wallet list.
 *
 * Entrance: web staggers every direct child (0.4s fade + 6px slide, 60ms
 * apart, disabled under reduced motion) — reproduced with useEntranceStagger.
 */
import React from 'react';
import { type ImageSourcePropType } from 'react-native';
import { type TransactionPreview } from '@saganta/stellar-appkit';
import type { AppKitStyles } from '../styles.js';
import type { ConnectThemeRN } from '../theme.js';
export interface PreviewViewProps {
    styles: AppKitStyles;
    theme: ConnectThemeRN;
    reducedMotion: boolean;
    preview: TransactionPreview;
    /** Wallet display name + icon (active connector / WC peer). */
    walletName: string;
    walletIcon: string | null;
    walletKey: string | null;
    /** App name — drives the app-thumbnail letter fallback. */
    appName: string;
    /** App logo (modal `logo` prop). Falls back to the app-name letter. */
    appLogo?: ImageSourcePropType | null;
    /** Approve → resolve(true): the wallet is asked to sign. */
    onApprove: () => void;
    /** Cancel → resolve(false): the sign request is rejected (user-cancelled). */
    onReject: () => void;
    /** Copy/share the source account address (meta row copy button). */
    onCopyAddress: () => void;
    /** True for ~1.5s after the address copy tap (check glyph swap, web parity). */
    copied: boolean;
}
export declare function PreviewView(props: PreviewViewProps): React.JSX.Element;
//# sourceMappingURL=PreviewView.d.ts.map