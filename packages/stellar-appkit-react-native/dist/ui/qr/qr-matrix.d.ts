/**
 * Typed QR matrix API + view-friendly rect decomposition.
 *
 * Wraps the vendored qrcode-generator core (./qr-encoder-vendor.ts) and adds
 * `qrMatrixToRects()` — a run-length decomposition that merges the dark
 * modules into the minimum set of axis-aligned rectangles, so QrCodeView can
 * render a QR code with plain React Native `<View>`s (no react-native-svg,
 * no image encoding) while staying pixel-crisp at any size.
 *
 * The decomposition is pure and fully unit-tested: expanding the rects back
 * into a module grid must reproduce the matrix exactly.
 */
/** Error-correction level. 'M' is the WalletConnect default. */
export type QrEcLevel = 'L' | 'M' | 'Q' | 'H';
/** A generated QR code as a boolean module matrix. */
export interface QrMatrix {
    /** Module grid size — always 4·typeNumber + 17 (21 … 177). */
    size: number;
    /** The QR version (type number) that was auto-selected. */
    typeNumber: number;
    isDark(row: number, col: number): boolean;
}
/** An axis-aligned run of dark modules (inclusive coordinates). */
export interface QrRect {
    x: number;
    y: number;
    w: number;
    h: number;
}
/**
 * Generates the QR matrix for `value` (UTF-8, byte mode) with automatic
 * version selection — the smallest version 1…40 that fits at `ecLevel`.
 * `typeNumber` is reported back so callers can reason about density.
 */
export declare function generateQrMatrix(value: string, ecLevel?: QrEcLevel): QrMatrix;
/**
 * Decomposes a QR matrix into dark rectangles — a greedy maximal-rectangle
 * partition: scan row-major, and for the first uncovered dark module grow a
 * rectangle (alternating width/height extensions) while every cell stays
 * dark and uncovered, then mark it covered. Solid areas (finder/alignment
 * patterns, quiet runs) collapse into single rects, so a 53×53
 * WalletConnect code (~1,400 dark modules) renders as ~500 `<View>`s.
 *
 * The result is a partition (no overlaps), so `rectsToGrid()` is an exact
 * inverse — pinned by unit tests.
 */
export declare function qrMatrixToRects(matrix: QrMatrix): QrRect[];
/** Expands rects back into a full module grid — test/inverse of qrMatrixToRects. */
export declare function rectsToGrid(rects: QrRect[], size: number): boolean[][];
//# sourceMappingURL=qr-matrix.d.ts.map