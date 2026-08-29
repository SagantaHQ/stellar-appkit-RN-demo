/**
 * VENDORED — QR Code matrix generator core.
 *
 * Extracted mechanically from qrcode-generator@1.4.4:
 *   https://github.com/kazuhikoarase/qrcode-generator
 * Copyright (c) 2009 Kazuhiko Arase — MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Only the matrix-generation core is kept (typeNumber auto-detection,
 * byte/alphanumeric/numeric modes, Reed-Solomon EC, mask optimization).
 * Dropped from upstream: Kanji/SJIS mode, stringToBytes chunked-unicode
 * loader, and every drawing helper (table/SVG/img/GIF/ASCII/canvas) —
 * rendering happens in QrCodeView with plain React Native Views, so the
 * package needs no react-native-svg dependency.
 *
 * This file is intentionally kept close to upstream for auditability
 * (hence @ts-nocheck and ES5 style). Do not hand-edit the code below;
 * re-run the extraction script instead.
 */
declare var qrcode: (typeNumber: any, errorCorrectionLevel: any) => {};
export { qrcode };
export type QRCodeFactory = ReturnType<typeof qrcode>;
//# sourceMappingURL=qr-encoder-vendor.d.ts.map