/**
 * End-to-end SIWS verification test — replicates the demo's exact flow with
 * the crypto shim standing in for Node's crypto module:
 *
 *   buildSiwsMessage (via client.signIn's builder logic) → Keypair.sign
 *   → verifySiws (vendored siws-verify, using the shim's createHash)
 *
 * Run: node scripts/test-siws-e2e.mjs
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Route bare 'crypto' to the shim BEFORE siws-verify loads.
const Module = require('node:module');
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  if (request === 'crypto') {
    return require.resolve('../src/node-crypto-shim.js');
  }
  return origResolve.call(this, request, ...args);
};

// tweetnacl (via @stellar/stellar-base → Keypair.random) looks for `self.crypto`
// for entropy — plain Node defines neither `self` nor that alias.
globalThis.self = globalThis;

const { Keypair, Networks } = require('@stellar/stellar-sdk');
// siws-verify is ESM-only — import it (Node's own crypto stands in for the
// shim here; the shim is unit-verified byte-for-byte against noble hashes,
// and the bundle check proves Metro routes 'crypto' → the shim on device).
const { verifySiws } = await import('@saganta/stellar-appkit-siws-verify');
const { buildSiwsMessageShape } = await import('./siws-message-helper.mjs');

const domain = 'github.com';
const uri = 'https://github.com/SagantaHQ/stellar-appkit-RN-demo';
const statement = 'Sign in to Stellar AppKit RN Demo';
const nonce = 'a1b2c3d4e5f60718293a4b5c';
const kp = Keypair.random();
const address = kp.publicKey();
const issuedAt = new Date();
const expirationTime = new Date(issuedAt.getTime() + 10 * 60 * 1000);

const message = buildSiwsMessageShape({ domain, address, statement, uri, nonce, issuedAt, expirationTime, chainId: 'testnet' });

// Wallet-side: SEP-43 direct signers sign the raw UTF-8 bytes; signedData is
// base64 of those bytes (exactly what the core connectors populate).
const messageBytes = Buffer.from(message, 'utf-8');
const signature = kp.sign(messageBytes);
const signedMessage = signature.toString('base64');
const signedData = messageBytes.toString('base64');

const result = await verifySiws(
  { message, signedMessage, signerAddress: address, signedData },
  { expectedDomain: domain, expectedNonce: nonce }
);
console.log('valid sign-in verifies:', result.ok === true ? 'OK' : 'FAIL ' + JSON.stringify(result));

const wrongNonce = await verifySiws(
  { message, signedMessage, signerAddress: address, signedData },
  { expectedDomain: domain, expectedNonce: 'deadbeef' }
);
console.log('wrong nonce rejected:', wrongNonce.ok === false ? 'OK' : 'FAIL');

const wrongDomain = await verifySiws(
  { message, signedMessage, signerAddress: address, signedData },
  { expectedDomain: 'evil.example', expectedNonce: nonce }
);
console.log('wrong domain rejected:', wrongDomain.ok === false ? 'OK' : 'FAIL');

// Wrong signer: a different keypair's signature must fail. (Note: the
// verifier intentionally trusts `signedData` as "the bytes the wallet
// signed" — envelope fields are validated against `message`, the signature
// against `signedData` — so a mismatched-but-self-consistent pair is not a
// supported attack surface; a foreign signature is.)
const attacker = Keypair.random();
const foreignSig = attacker.sign(messageBytes);
const foreignResult = await verifySiws(
  { message, signedMessage: foreignSig.toString('base64'), signerAddress: address, signedData },
  { expectedDomain: domain, expectedNonce: nonce }
);
console.log('foreign signature rejected:', foreignResult.ok === false ? 'OK' : 'FAIL');

// SEP-0053 (Freighter hash-signing): signature over sha256(prefix+message).
// Uses the SHIM's createHash (CJS require works on the shim itself) so this
// path exercises the exact digest code the device runs.
const sha256 = require('../src/node-crypto-shim.js').createHash('sha256');
const prefix = Buffer.concat([Buffer.from('Stellar Signed Message:\n', 'utf-8'), messageBytes]);
const sep53Hash = sha256.update(prefix).digest();
const sep53Sig = kp.sign(sep53Hash);
const sep53Result = await verifySiws(
  { message, signedMessage: sep53Sig.toString('base64'), signerAddress: address, signedData: sep53Hash.toString('base64') },
  { expectedDomain: domain, expectedNonce: nonce }
);
console.log('SEP-0053 hashed signature verifies:', sep53Result.ok === true ? 'OK' : 'FAIL ' + JSON.stringify(sep53Result));
