import { jsx as _jsx } from "react/jsx-runtime";
/**
 * QrCodeView — renders a QR code with plain React Native Views.
 *
 * Replaces react-native-qrcode-svg (which requires react-native-svg) so the
 * package stays free of native SVG dependencies. The QR matrix is generated
 * by the vendored pure-JS encoder (./qr-matrix.ts) and drawn as merged dark
 * rectangles — pixel-crisp at any size, no image encoding, one View per run.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { generateQrMatrix, qrMatrixToRects } from './qr-matrix.js';
export function QrCodeView({ value, size = 200, color = '#000000', backgroundColor = '#FFFFFF', quietZone = 4, accessibilityLabel = 'QR code', }) {
    const { rects, total } = useMemo(() => {
        if (!value)
            return { rects: [], total: 0 };
        const matrix = generateQrMatrix(value);
        return { rects: qrMatrixToRects(matrix), total: matrix.size + 2 * quietZone };
    }, [value, quietZone]);
    const modulePct = total > 0 ? 100 / total : 0;
    return (_jsx(View, { style: { width: size, height: size, backgroundColor, overflow: 'hidden' }, accessibilityRole: "image", accessibilityLabel: accessibilityLabel, children: rects.map((rect, i) => (_jsx(View, { style: {
                position: 'absolute',
                left: `${(quietZone + rect.x) * modulePct}%`,
                top: `${(quietZone + rect.y) * modulePct}%`,
                width: `${rect.w * modulePct}%`,
                height: `${rect.h * modulePct}%`,
                backgroundColor: color,
            } }, i))) }));
}
//# sourceMappingURL=QrCodeView.js.map