/**
 * Account data for the connected view — the RN port of the web modal's
 * refreshAccountData() + startBalancePolling() (ui-web connect-modal.ts).
 *
 * The web modal fetches through `@stellar/stellar-sdk`'s Horizon server
 * (dynamically imported). The RN package deliberately makes NO stellar-sdk
 * import — on Metro every dynamic import is inlined into the bundle, so
 * pulling the SDK here would bloat every app that renders the account view.
 * Plain `fetch` against the same Horizon REST endpoints returns the same
 * fields with a few kilobytes of code instead of megabytes:
 *
 *   GET /accounts/{addr}                     → sequence + balances[native]
 *   GET /accounts/{addr}/transactions?limit  → latest txs (hash/date/success)
 *   GET /transactions/{hash}/operations?limit=1 → first op type/amount/asset
 *
 * `useAccountData(client, active)` reproduces the web polling contract:
 * immediate fetch on connect (skeleton state until it lands), then a silent
 * refresh every 10s while the account view is showing, cleared on
 * disconnect. "Silent" = the previous values stay visible during the poll
 * (no loading flash), exactly like the web modal's `refreshAccountData(true)`.
 */
import { type StellarAppKit } from '@saganta/stellar-appkit';
/** One row of the Recent Activity list (web cachedTxHistory entry). */
export interface TxHistoryItem {
    hash: string;
    type: string;
    amount: string;
    asset: string;
    date: string;
    success: boolean;
}
export interface AccountData {
    /** Formatted XLM balance ("123.45"), null while loading or unavailable. */
    balance: string | null;
    /** Latest transactions (max 5), newest first. */
    history: TxHistoryItem[];
}
/** Horizon base URL per network (web parity — PUBLIC vs everything-else). */
export declare function horizonUrl(network: string): string;
/**
 * Explorer base (web explorerUrl parity): stellarchain.io, testnet variant
 * for every non-PUBLIC network.
 */
export declare function explorerUrl(path: string, network: string): string;
/** Web truncateAddress: `GABC…XYZW` (5 + ellipsis + 5). */
export declare function truncateAddress(address: string): string;
/**
 * Deterministic avatar colors from the address — the RN stand-in for the
 * web's CSS `linear-gradient(135deg, hsl(h1,…), hsl(h2,…))` (avatar.ts).
 * RN has no zero-dependency linear gradient, so both hues of the SAME hash
 * are exposed: `backgroundColor` blends them at a fixed 60/40 midpoint and
 * `h1`/`h2` can drive a two-tone ring or letter. Same address → same colors
 * on every device, which is the identity property the web gradient provides.
 */
export declare function avatarColorsFromAddress(address: string): {
    backgroundColor: string;
    h1: number;
    h2: number;
};
/**
 * Fetches balance + latest 5 transactions for an address. Mirrors the web
 * modal's per-tx operation lookup (one extra request per tx, capped at the
 * same 5). Failures degrade exactly like the web code: balance falls back
 * to null (skeleton) and history to [] when the account has no txs yet —
 * a 404 on a fresh account simply means "no data", not an error state.
 */
export declare function fetchAccountData(address: string, network: string): Promise<AccountData>;
/**
 * Funds an address via the Testnet friendbot faucet (web get-testnet-funds
 * parity — same GET, same silent failure handling).
 */
export declare function fundViaFriendbot(address: string): Promise<boolean>;
/**
 * Balance + tx-history state for the connected account, polled every 10s
 * while `active` is true (the modal keeps it true only on the account view
 * — web parity: no polling during signing/preview/SIWS/list).
 *
 * @param client the AppKit client (session source)
 * @param active whether the account view is currently visible
 */
export declare function useAccountData(client: StellarAppKit, active: boolean): AccountData & {
    /** True while the initial fetch is running (drives the skeleton). */
    loading: boolean;
    /** Requests an immediate silent refresh (e.g. after friendbot funding). */
    refresh: () => void;
};
//# sourceMappingURL=accountData.d.ts.map