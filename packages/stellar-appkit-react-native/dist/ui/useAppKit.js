/**
 * React hook binding for Stellar AppKit on React Native — mirrors ui-web's
 * React bindings: subscribe to the client's typed events once, expose a
 * snapshot that re-renders on change.
 */
import { useEffect, useState } from 'react';
/** Subscribes to a StellarAppKit client and returns a re-rendering state snapshot. */
export function useAppKit(client) {
    const [state, setState] = useState(() => snapshot(client));
    useEffect(() => {
        const update = () => setState(snapshot(client));
        const offs = [
            client.on('statusChange', update),
            client.on('connect', update),
            client.on('disconnect', update),
            client.on('accountSwitch', update),
            client.on('sessionsChanged', update),
            client.on('signQueueChange', update),
        ];
        // Catch up with anything that happened before mount.
        update();
        return () => offs.forEach((off) => off());
    }, [client]);
    return state;
}
function snapshot(client) {
    const session = client.session;
    const connector = client.activeConnector;
    return {
        status: client.status,
        session,
        sessions: client.sessions,
        pendingSignCount: client.pendingSignCount,
        walletName: connector?.meta.name ?? null,
        walletIcon: connector?.meta.icon ?? null,
    };
}
//# sourceMappingURL=useAppKit.js.map