/**
 * ErrorView — the generic failure state (web renderError): a 28×28 danger
 * alert-circle glyph, "Something went wrong", the error message, and a
 * `.btn`-style Try again that returns to the wallet list.
 *
 * Connection failures during a wallet connect do NOT land here — the web
 * modal keeps the connecting view and swaps in its error variant (see
 * ConnectingView). This view is for errors without a wallet context.
 *
 * NetworkMismatchView shares the exact layout with different copy.
 */
import React from 'react';
import type { AppKitStyles } from '../styles.js';
import type { ConnectThemeRN } from '../theme.js';
export interface ErrorViewProps {
    styles: AppKitStyles;
    theme: ConnectThemeRN;
    message: string;
    onRetry: () => void;
}
export declare function ErrorView(props: ErrorViewProps): React.JSX.Element;
export interface NetworkMismatchViewProps {
    styles: AppKitStyles;
    theme: ConnectThemeRN;
    /** "Your wallet is on X" — from the NetworkMismatchError. */
    actualNetwork?: string;
    expectedNetwork?: string;
    onRetry: () => void;
}
/**
 * NetworkMismatchView — web renderNetworkMismatch(): same .error-state
 * layout with the wrong-network copy and a bold actual/expected pair.
 */
export declare function NetworkMismatchView(props: NetworkMismatchViewProps): React.JSX.Element;
//# sourceMappingURL=ErrorView.d.ts.map