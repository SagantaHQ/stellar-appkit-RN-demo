/**
 * QrCodeView — renders a QR code with plain React Native Views.
 *
 * Replaces react-native-qrcode-svg (which requires react-native-svg) so the
 * package stays free of native SVG dependencies. The QR matrix is generated
 * by the vendored pure-JS encoder (./qr-matrix.ts) and drawn as merged dark
 * rectangles — pixel-crisp at any size, no image encoding, one View per run.
 */
import React from 'react';
export interface QrCodeViewProps {
    /** The payload to encode (e.g. a WalletConnect pairing URI). */
    value: string;
    /** Square size in dp. Default 200. */
    size?: number;
    /** Module color. Default '#000000'. */
    color?: string;
    /** Background color (quiet zone included). Default '#FFFFFF'. */
    backgroundColor?: string;
    /** Quiet-zone width in modules. 4 is the spec minimum. Default 4. */
    quietZone?: number;
    /** Optional a11y label; defaults to "QR code". */
    accessibilityLabel?: string;
}
export declare function QrCodeView({ value, size, color, backgroundColor, quietZone, accessibilityLabel, }: QrCodeViewProps): React.JSX.Element;
//# sourceMappingURL=QrCodeView.d.ts.map