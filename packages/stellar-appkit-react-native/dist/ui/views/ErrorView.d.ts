/**
 * ErrorView — connection failure / sign failure state. Port of the web
 * modal's error view: danger ring glyph, title, message, Try again.
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
//# sourceMappingURL=ErrorView.d.ts.map