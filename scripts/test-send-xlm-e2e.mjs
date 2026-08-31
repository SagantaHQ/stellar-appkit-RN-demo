/**
 * End-to-end Send XLM submission test — replicates the demo's exact flow
 * against the LIVE Testnet Horizon:
 *
 *   friendbot funding → fetchAccountInfo → buildSelfPaymentXdr →
 *   Keypair.sign → submitSignedTx (replicated byte-for-byte below)
 *
 * plus a NEGATIVE CONTROL proving the old JSON-bodied submit is rejected
 * with 415 "Unsupported Media Type" — the bug this script guards against:
 * Horizon's POST /transactions accepts ONLY application/x-www-form-urlencoded
 * with the envelope as the `tx` field.
 *
 * Run: node scripts/test-send-xlm-e2e.mjs
 */
const { Account, Asset, BASE_FEE, Keypair, Networks, Operation, Transaction, TransactionBuilder } =
  await import('@stellar/stellar-sdk');

const HORIZON_URL = 'https://horizon-testnet.stellar.org';

// Byte-for-byte replica of src/stellar.ts's submitSignedTx (fixed version).
// Keep in sync when that function changes.
async function submitSignedTx(signedTxXdr) {
  const res = await fetch(`${HORIZON_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `tx=${encodeURIComponent(signedTxXdr)}`,
  });
  const data = (await res.json().catch(() => ({}))) ?? {};
  if (!res.ok || data.successful === false) {
    const txCode = data.extras?.result_codes?.transaction ?? data.title ?? `Horizon ${res.status}`;
    throw new Error(`Transaction rejected by network (tx: ${txCode})`);
  }
  if (!data.hash) throw new Error('Horizon returned no transaction hash');
  return { hash: data.hash, successful: data.successful === true };
}

// The pre-fix JSON version — must keep failing with 415.
async function submitOldJson(signedTxXdr) {
  const res = await fetch(`${HORIZON_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tx: signedTxXdr }),
  });
  const data = (await res.json().catch(() => ({}))) ?? {};
  return { status: res.status, title: data.title };
}

const kp = Keypair.random();
const address = kp.publicKey();

console.log('1. friendbot funding…');
const fb = await fetch(`https://friendbot.stellar.org/?addr=${encodeURIComponent(address)}`);
if (!fb.ok) throw new Error(`friendbot error ${fb.status}`);

console.log('2. fetchAccountInfo…');
const accRes = await fetch(`${HORIZON_URL}/accounts/${address}`);
if (!accRes.ok) throw new Error(`account load error ${accRes.status}`);
const acc = await accRes.json();

console.log('3. buildSelfPaymentXdr (0.0001 XLM to self)…');
const tx = new TransactionBuilder(new Account(address, acc.sequence), {
  networkPassphrase: Networks.TESTNET,
  fee: BASE_FEE,
})
  .addOperation(Operation.payment({ destination: address, asset: Asset.native(), amount: '0.0001' }))
  .setTimeout(300)
  .build();
const realSigned = new Transaction(tx.toXDR(), Networks.TESTNET);
realSigned.sign(kp);
const signedXdr = realSigned.toXDR();

console.log('4. negative control — old JSON submit (expect 415):');
const old = await submitOldJson(signedXdr);
console.log(`   status=${old.status} title="${old.title}"`);
if (old.status !== 415) throw new Error(`expected 415, got ${old.status} — Horizon may now accept JSON; update src/stellar.ts`);

console.log('5. fixed submitSignedTx (expect success):');
const result = await submitSignedTx(signedXdr);
console.log(`   hash=${result.hash} successful=${result.successful}`);
if (!result.successful || !result.hash) throw new Error('submit did not succeed');

console.log('\nPASS — Send XLM submission path works (form-urlencoded, 415 negative control held).');
