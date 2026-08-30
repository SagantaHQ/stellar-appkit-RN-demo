/**
 * React hook binding for Stellar AppKit on React Native — mirrors ui-web's
 * React bindings: subscribe to the client's typed events once, expose a
 * snapshot that re-renders on change.
 */
import type { StellarAppKit, ConnectStatus, ConnectSession } from '@saganta/stellar-appkit';
export interface AppKitState {
    status: ConnectStatus;
    /** The active session, if any. */
    session: ConnectSession | null;
    /** All connected sessions (multi-wallet). */
    sessions: ConnectSession[];
    /** Number of sign requests queued (including in-flight). */
    pendingSignCount: number;
    /** Wallet display name for the active session, when connected. */
    walletName: string | null;
    /** Wallet icon for the active session, when connected. */
    walletIcon: string | null;
}
/** Subscribes to a StellarAppKit client and returns a re-rendering state snapshot. */
export declare function useAppKit(client: StellarAppKit): AppKitState;
//# sourceMappingURL=useAppKit.d.ts.map