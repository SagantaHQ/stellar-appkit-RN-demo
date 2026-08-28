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
  Networks,
  Operation,
  TransactionBuilder,
} from '@stellar/stellar-sdk';
import { DEMO_PAYMENT_AMOUNT, HORIZON_URL } from './constants';

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
