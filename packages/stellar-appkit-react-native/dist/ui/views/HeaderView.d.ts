/**
 * HeaderView — the panel header, a 1:1 port of the web modal's
 * `renderPanelHeader()`. Three variants:
 *
 * 1. **Back variant** (`.header--connecting`) — back chevron + the wallet
 *    name centered + close. Shown while connecting (error or not), on
 *    SIWS errors, and on signing errors: back cancels the in-flight
 *    state and returns to the wallet list.
 * 2. **Connected variant** — the active wallet's icon (22×22, radius 6)
 *    + its name (the wallet brand replaces the app title, like web).
 * 3. **Default variant** (`.header`) — optional app logo + title, both
 *    left-aligned like the web brand row.
 *
 * Inline mode hides the close button (web: `showClose = effectiveMode !== 'inline'`).
 */
import React from 'react';
import { type ImageSourcePropType } from 'react-native';
import type { AppKitStyles } from '../styles.js';
import type { ConnectThemeRN } from '../theme.js';
export interface HeaderViewProps {
    styles: AppKitStyles;
    theme: ConnectThemeRN;
    /** Inline mode never shows the close button (web parity). */
    showClose: boolean;
    onClose: () => void;
    /** When set, renders the back variant: back cancels and returns to the list. */
    onBack?: () => void;
    backWalletName?: string | null;
    /** Connected variant: wallet brand replaces the app title. */
    connectedWalletName?: string | null;
    connectedWalletIcon?: string | null;
    connectedWalletKey?: string | null;
    /** Default variant: title + optional logo. */
    title: string;
    logo?: ImageSourcePropType;
}
export declare function HeaderView(props: HeaderViewProps): React.JSX.Element;
//# sourceMappingURL=HeaderView.d.ts.map