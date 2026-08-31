/**
 * Horizon helpers for the demo — plain `fetch` against the TESTNET Horizon
 * REST API plus a stellar-sdk transaction builder for the self-payment demo.
 *
 * These are demo-app concerns, not AppKit concerns: AppKit's job ends at
 * `signTransaction(xdr)`. How you build the XDR (Horizon, Soroban RPC, your
 * own backend) is entirely up to your app.
 */
import {
  Account,
  Asset,
  BASE_FEE,
  Keypair,
  Networks,
  Operation,
  StrKey,
  TransactionBuilder,
} from '@stellar/stellar-sdk';
import { DEMO_MESSAGE, DEMO_PAYMENT_AMOUNT, HORIZON_URL } from './constants';

export interface AccountInfo {
  address: string;
  sequence: string;
  /** Native (XLM) balance as a string, e.g. "9876.5432100". */
  nativeBalance: string;
}

/** Loads sequence + native balance for an address from TESTNET Horizon. */
export async function fetchAccountInfo(address: string): Promise<AccountInfo> {
  const res = await fetch(`${HORIZON_URL}/accounts/${address}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        'Account not found on TESTNET — fund it first (friendbot.stellar.org) or send a first payment to it.'
      );
    }
    throw new Error(`Horizon error ${res.status}: ${res.statusText}`);
  }
  const data = (await res.json()) as {
    sequence: string;
    balances: { asset_type: string; balance: string }[];
  };
  const native = data.balances?.find((b) => b.asset_type === 'native');
  return { address, sequence: data.sequence, nativeBalance: native?.balance ?? '0' };
}

/**
 * Builds an unsigned TESTNET payment (DEMO_PAYMENT_AMOUNT XLM to yourself —
 * only network fees are spent) and returns its XDR, ready for
 * `client.signTransaction(xdr)`.
 */
export async function buildSelfPaymentXdr(address: string, sequence: string): Promise<string> {
  const account = new Account(address, sequence);
  const tx = new TransactionBuilder(account, {
    networkPassphrase: Networks.TESTNET,
    fee: BASE_FEE,
  })
    .addOperation(
      Operation.payment({
        destination: address,
        asset: Asset.native(),
        amount: DEMO_PAYMENT_AMOUNT,
      })
    )
    .setTimeout(300)
    .build();
  return tx.toXDR();
}

/** Builds an unsigned TESTNET payment to an arbitrary recipient + amount. */
export async function buildPaymentXdr(
  source: string,
  sequence: string,
  recipient: string,
  amount: string
): Promise<string> {
  if (!StrKey.isValidEd25519PublicKey(recipient)) {
    throw new Error('Recipient is not a valid G... address');
  }
  const amountNum = parseFloat(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    throw new Error('Amount must be a positive number');
  }
  const account = new Account(source, sequence);
  const tx = new TransactionBuilder(account, {
    networkPassphrase: Networks.TESTNET,
    fee: BASE_FEE,
  })
    .addOperation(
      Operation.payment({
        destination: recipient,
        asset: Asset.native(),
        amount,
      })
    )
    .setTimeout(30)
    .build();
  return tx.toXDR();
}

export interface SubmitResult {
  hash: string;
  explorerUrl: string;
}

/**
 * Submits a signed transaction envelope to TESTNET Horizon — the RN analog
 * of the web demo's `horizon.submitTransaction()`. Uses the REST endpoint
 * directly so the heavy SDK server class never enters the bundle.
 */
export async function submitSignedTx(signedTxXdr: string): Promise<SubmitResult> {
  // Horizon's POST /transactions accepts ONLY `application/x-www-form-urlencoded`
  // with the envelope as the `tx` field — a JSON body is answered with
  // 415 "Unsupported Media Type" (which is how every Send XLM died before:
  // "Transaction rejected by network (tx: Unsupported Media Type)"). The
  // base64 envelope must be URL-encoded — it can contain `+`, `/` and `=`.
  const res = await fetch(`${HORIZON_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `tx=${encodeURIComponent(signedTxXdr)}`,
  });
  const data = (await res.json().catch(() => ({}))) as {
    hash?: string;
    successful?: boolean;
    extras?: { result_codes?: { transaction?: string; operations?: string[] } };
    title?: string;
  };
  if (!res.ok || data.successful === false) {
    const codes = data.extras?.result_codes;
    const txCode = codes?.transaction ?? data.title ?? `Horizon ${res.status}`;
    const opCodes = codes?.operations ?? [];
    throw new Error(
      `Transaction rejected by network (tx: ${txCode}${opCodes.length ? `, ops: ${opCodes.join(', ')}` : ''})`
    );
  }
  if (!data.hash) throw new Error('Horizon returned no transaction hash');
  return { hash: data.hash, explorerUrl: `https://testnet.stellarchain.io/tx/${data.hash}` };
}

/** Funds a TESTNET address via the friendbot faucet (10,000 XLM). */
export async function fundTestnetAccount(address: string): Promise<void> {
  const res = await fetch(`https://friendbot.stellar.org/?addr=${encodeURIComponent(address)}`);
  if (!res.ok) {
    throw new Error(`Friendbot error ${res.status} — the account may already be funded; try again in a moment.`);
  }
}

/** Random hex nonce for the demo's client-side SIWS "server". */
export function randomNonce(bytes = 16): string {
  const raw = new Uint8Array(bytes);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(raw);
  } else {
    const kp = Keypair.random(); // polyfill fallback — entropy from the SDK
    raw.set(kp.rawSecretKey().slice(0, bytes));
  }
  return Array.from(raw, (b) => b.toString(16).padStart(2, '0')).join('');
}
