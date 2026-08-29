/**
 * useSiwsFlow — the React Native port of the web modal's SIWS
 * (Sign-In With Stellar) automatic authentication flow
 * (ui-web connect-modal.ts → triggerSiwsFlow()).
 *
 * Triggered after wallet connect succeeds when `client.siwsConfig` is
 * set. The flow, phase for phase with the web modal:
 *
 * 0. `siws-checking` — `siwsConfig.session()`; an existing valid session
 *    (address + network match, not expired) skips sign-in entirely
 * 1. `siws-nonce` — `siwsConfig.nonce()`
 * 2. `siws-signing` — `client.signIn({ statement, nonce })` (wallet prompt)
 * 3. `siws-verifying` — `siwsConfig.verify(result, nonce, ctx)`
 * 4. Validate the returned session (address / network / expiry)
 * 5. `client.setSiwsSession(session)` → success
 * 6. Any failure → `siws-error` with the extracted message + "Try again";
 *    the wallet is NOT disconnected on failure — only when the user
 *    dismisses the modal while `pending` (disconnectOnFail, default true)
 *    or explicitly cancels.
 *
 * Every step is wrapped in a `withTimeout` (siwsConfig.timeoutMs,
 * default 15s) and retries are capped (siwsConfig.maxRetries, default 3)
 * — after the cap the error becomes `siws.error_too_many_attempts`.
 */
import { type StellarAppKit, type SiwsSession } from '@saganta/stellar-appkit';
/** The SIWS phases — also the modal ViewIds (see types.ts). */
export type SiwsPhase = 'siws-checking' | 'siws-nonce' | 'siws-signing' | 'siws-verifying' | 'siws-error';
/** Mirrors the web modal's private fields (siwsPending / siwsRetryCount / …). */
export interface SiwsFlowState {
    /** Current phase, or null when the flow isn't running. */
    phase: SiwsPhase | null;
    /** Error message shown on the siws-error phase. */
    error: string | null;
    /** True from the first start() until success or explicit cancel/close. */
    pending: boolean;
}
/** Web: extractErrorMessage — pull a human-readable message from anything. */
export declare function extractSiwsErrorMessage(err: unknown): string;
/** Web: session validity check (address + network + expiry). */
export declare function siwsSessionIsValid(session: SiwsSession, address: string, network: string): boolean;
export interface UseSiwsFlow {
    state: SiwsFlowState;
    /** Kicks off the flow (no-op when siwsConfig is absent). */
    start: () => Promise<void>;
    /** User pressed Cancel — stop, optionally disconnect (disconnectOnFail). */
    cancel: () => void;
    /** User pressed "Try again" — resets the retry counter and re-runs. */
    retry: () => void;
}
/**
 * @param client   the StellarAppKit instance
 * @param onDone   called when sign-in succeeds (the modal switches to the
 *                 account view)
 * @param onWalletList called when a retry is impossible because the wallet
 *                 got disconnected — the modal returns to the wallet list
 */
export declare function useSiwsFlow(client: StellarAppKit, onDone: () => void, onWalletList: () => void): UseSiwsFlow;
//# sourceMappingURL=useSiws.d.ts.map