import { ConnectError, resolveNetworkPassphrase } from '../types.js';
import { withNormalizedError } from './error-utils.js';
/** Rabet's official brand color — purple/violet gradient.
 *  Pre-encoded base64 literal (not `Buffer.from` at module top level) so the
 *  connector barrel imports cleanly on runtimes without a global Buffer
 *  polyfill — React Native/Metro. Same bytes as the SVG it encodes. */
const RABET_ICON = `data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTI4IDEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxkZWZzPgogICAgICA8bGluZWFyR3JhZGllbnQgaWQ9InJhYmV0LWdyYWQiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj4KICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjN0IyRkJFIi8+CiAgICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNEExRTczIi8+CiAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8L2RlZnM+CiAgICA8cmVjdCB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgcng9IjI4IiBmaWxsPSJ1cmwoI3JhYmV0LWdyYWQpIi8+CiAgICA8cGF0aCBkPSJNNjQgMjhDNTAgMjggMzggMzggMzggNTJjMCA4IDQgMTQgMTAgMTgtOCA0LTE0IDEyLTE0IDIyIDAgMiAyIDQgNCA0aDUyYzIgMCA0LTIgNC00IDAtMTAtNi0xOC0xNC0yMiA2LTQgMTAtMTAgMTAtMTggMC0xNC0xMi0yNC0yNi0yNHptMCAxMmM4IDAgMTQgNiAxNCAxNCAwIDYtNCAxMC04IDEyLTIgMS0yIDMgMCA0IDYgMyAxMCA5IDEyIDE2SDQ2YzItNyA2LTEzIDEyLTE2IDItMSAyLTMgMC00LTQtMi04LTYtOC0xMiAwLTggNi0xNCAxNC0xNHoiIGZpbGw9IiNmZmYiLz4KICA8L3N2Zz4=`;
export function createRabetConnector() {
    const meta = {
        id: 'rabet',
        name: 'Rabet',
        icon: RABET_ICON,
        installUrl: {
            chrome: 'https://chromewebstore.google.com/detail/rabet/rabaialbjkhegpmjljegngfdgfjgbgpb',
            firefox: 'https://addons.mozilla.org/en-US/firefox/addon/rabet/',
        },
        platforms: ['browser-extension'],
    };
    const capabilities = {
        signTransaction: true,
        signAuthEntry: false, // Rabet does not support Soroban auth entry signing
        signMessage: false, // Rabet does not support message signing
        submit: false,
    };
    /**
     * Gets the Rabet API from window, or null if not installed.
     * Rabet is slow to inject its global — SWK waits 100ms before checking.
     * We do the same: if window.rabet isn't present immediately, we wait.
     */
    function getRabetSync() {
        if (typeof window === 'undefined')
            return null;
        return window.rabet ?? null;
    }
    /** Async check with 100ms delay — matches SWK's approach. */
    function getRabetAsync() {
        return new Promise((resolve) => {
            setTimeout(() => resolve(getRabetSync()), 100);
        });
    }
    /** Maps Stellar network passphrase → Rabet's network string. */
    function mapNetwork(passphrase) {
        // Rabet uses "mainnet" for PUBLIC and "testnet" for everything else
        if (passphrase === 'Public Global Stellar Network ; September 2015')
            return 'mainnet';
        return 'testnet';
    }
    const connector = {
        id: meta.id,
        meta,
        capabilities,
        async getReachability() {
            // Fast path: check synchronously first
            const rabet = getRabetSync();
            if (rabet)
                return 'available';
            // Slow path: Rabet may still be injecting — wait 100ms (matches SWK)
            const delayed = await getRabetAsync();
            return delayed ? 'available' : 'not-installed';
        },
        async connect(_opts) {
            return withNormalizedError(meta.id, async () => {
                let rabet = getRabetSync();
                if (!rabet)
                    rabet = await getRabetAsync();
                if (!rabet) {
                    throw ConnectError.invalidRequest('Rabet extension is not installed.', undefined, meta.id);
                }
                const result = await rabet.connect();
                if (result.error) {
                    throw ConnectError.rejected(meta.id);
                }
                if (!result.publicKey) {
                    throw ConnectError.internal('Rabet returned no public key.', undefined, meta.id);
                }
                return { address: result.publicKey, walletId: meta.id };
            });
        },
        async disconnect() {
            const rabet = getRabetSync();
            if (rabet) {
                try {
                    await rabet.disconnect();
                }
                catch { /* ignore */ }
            }
        },
        async getAddress() {
            const rabet = getRabetSync();
            if (!rabet)
                return { address: '' };
            try {
                const result = await rabet.connect();
                return { address: result.publicKey };
            }
            catch {
                return { address: '' };
            }
        },
        async getNetwork() {
            // Rabet doesn't expose a getNetwork method — return the app's configured
            // network. The actual network is passed to sign() as a parameter.
            return { network: 'PUBLIC', networkPassphrase: resolveNetworkPassphrase('PUBLIC') ?? '' };
        },
        async signTransaction(xdr, signOpts) {
            return withNormalizedError(meta.id, async () => {
                let rabet = getRabetSync();
                if (!rabet)
                    rabet = await getRabetAsync();
                if (!rabet) {
                    throw ConnectError.invalidRequest('Rabet extension is not installed.', undefined, meta.id);
                }
                // Rabet uses its own network strings: "mainnet" / "testnet"
                // (NOT the Stellar passphrase) — matches SWK's RabetNetwork enum
                const networkPassphrase = signOpts?.networkPassphrase ?? resolveNetworkPassphrase('PUBLIC') ?? '';
                const rabetNetwork = mapNetwork(networkPassphrase);
                const result = await rabet.sign(xdr, rabetNetwork);
                if (result.error) {
                    throw ConnectError.internal(`Rabet sign error: ${result.error}`, undefined, meta.id);
                }
                if (!result.xdr) {
                    throw ConnectError.internal('Rabet returned no signed XDR.', undefined, meta.id);
                }
                return {
                    signedTxXdr: result.xdr,
                    signerAddress: signOpts?.address ?? '',
                };
            });
        },
        async signAuthEntry() {
            throw ConnectError.invalidRequest('Rabet does not support signing Soroban auth entries.', undefined, meta.id);
        },
        async signMessage() {
            throw ConnectError.invalidRequest('Rabet does not support message signing.', undefined, meta.id);
        },
    };
    return connector;
}
//# sourceMappingURL=rabet.js.map