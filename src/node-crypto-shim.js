/**
 * Node `crypto` module shim for React Native — maps `require('crypto')` /
 * `import('crypto')` onto @noble/hashes (already in the dependency tree via
 * WalletConnect), so packages written for Node (here:
 * @saganta/stellar-appkit-siws-verify, whose signature verifier pre-hashes
 * SIWS candidate messages with SHA-256/512) work on Metro/Hermes.
 *
 * Wired in metro.config.js: the resolver returns THIS file for the bare
 * 'crypto' specifier. Only `createHash('sha256' | 'sha512')` is implemented —
 * the exact surface siws-verify touches; anything else throws so an
 * unexpected consumer fails loudly instead of silently returning undefined.
 */

const { sha256 } = require('@noble/hashes/sha256');
const { sha512 } = require('@noble/hashes/sha512');

function toUint8Array(data) {
  if (data instanceof Uint8Array) return data;
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(data)) return new Uint8Array(data);
  if (typeof data === 'string') return new Uint8Array(Buffer.from(data, 'utf-8'));
  throw new TypeError('crypto-shim: unsupported input type');
}

function makeHash(algorithm) {
  const hash = (input) => (algorithm === 'sha512' ? sha512 : sha256)(toUint8Array(input));
  return {
    update(data) {
      const previous = this._buffer ?? new Uint8Array(0);
      const next = toUint8Array(data);
      const merged = new Uint8Array(previous.length + next.length);
      merged.set(previous);
      merged.set(next, previous.length);
      this._buffer = merged;
      return this;
    },
    digest(encoding) {
      const input = this._buffer ?? new Uint8Array(0);
      const out = hash(input);
      this._buffer = new Uint8Array(0);
      if (encoding === 'hex') return Buffer.from(out).toString('hex');
      if (encoding === 'base64') return Buffer.from(out).toString('base64');
      return Buffer.from(out);
    },
  };
}

function createHash(algorithm) {
  const normalized = String(algorithm).toLowerCase();
  if (normalized !== 'sha256' && normalized !== 'sha512') {
    throw new Error(`crypto-shim: createHash('${algorithm}') is not implemented on React Native`);
  }
  return makeHash(normalized);
}

module.exports = { createHash };
