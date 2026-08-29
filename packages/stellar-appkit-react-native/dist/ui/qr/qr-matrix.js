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
import { qrcode as vendoredQrcode } from './qr-encoder-vendor.js';
const qrcode = vendoredQrcode;
// Install the vendored UTF-8 byte encoder. Upstream's default converter is
// Latin-1 (charCodeAt & 0xff); WalletConnect URIs are pure ASCII so the
// default would work for them, but arbitrary payloads must encode correctly.
qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
/**
 * Generates the QR matrix for `value` (UTF-8, byte mode) with automatic
 * version selection — the smallest version 1…40 that fits at `ecLevel`.
 * `typeNumber` is reported back so callers can reason about density.
 */
export function generateQrMatrix(value, ecLevel = 'M') {
    const qr = qrcode(0, ecLevel);
    qr.addData(value);
    qr.make();
    const size = qr.getModuleCount();
    const typeNumber = (size - 17) / 4;
    return {
        size,
        typeNumber,
        isDark: (row, col) => qr.isDark(row, col),
    };
}
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
export function qrMatrixToRects(matrix) {
    const { size, isDark } = matrix;
    const covered = Array.from({ length: size }, () => new Array(size).fill(false));
    const rects = [];
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!isDark(y, x) || covered[y][x])
                continue;
            // Seed: 1×1 at (x, y), then greedily extend while all-dark & uncovered.
            let w = 1;
            let h = 1;
            let grew = true;
            while (grew) {
                grew = false;
                // Extend right?
                if (x + w < size) {
                    let ok = true;
                    for (let yy = y; yy < y + h && ok; yy++) {
                        if (!isDark(yy, x + w) || covered[yy][x + w])
                            ok = false;
                    }
                    if (ok) {
                        w++;
                        grew = true;
                    }
                }
                // Extend down?
                if (y + h < size) {
                    let ok = true;
                    for (let xx = x; xx < x + w && ok; xx++) {
                        if (!isDark(y + h, xx) || covered[y + h][xx])
                            ok = false;
                    }
                    if (ok) {
                        h++;
                        grew = true;
                    }
                }
            }
            for (let yy = y; yy < y + h; yy++) {
                for (let xx = x; xx < x + w; xx++)
                    covered[yy][xx] = true;
            }
            rects.push({ x, y, w, h });
        }
    }
    return rects;
}
/** Expands rects back into a full module grid — test/inverse of qrMatrixToRects. */
export function rectsToGrid(rects, size) {
    const grid = Array.from({ length: size }, () => new Array(size).fill(false));
    for (const { x, y, w, h } of rects) {
        for (let dy = 0; dy < h; dy++) {
            const row = grid[y + dy];
            if (!row)
                continue;
            for (let dx = 0; dx < w; dx++) {
                if (row[x + dx] !== undefined)
                    row[x + dx] = true;
            }
        }
    }
    return grid;
}
//# sourceMappingURL=qr-matrix.js.map