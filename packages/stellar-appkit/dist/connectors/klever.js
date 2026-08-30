import { ConnectError } from '../types.js';
import { withNormalizedError } from './error-utils.js';
/** Klever's brand color — blue gradient.
 *  Pre-encoded base64 literal — see the note on RABET_ICON for why the SVG
 *  bytes are inlined rather than computed with `Buffer.from` at import time. */
const KLEVER_ICON = `data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTI4IDEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxkZWZzPgogICAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImtsZXZlci1ncmFkIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+CiAgICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzAwNjZGRiIvPgogICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzAwNDRDQyIvPgogICAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPC9kZWZzPgogICAgPHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHJ4PSIyOCIgZmlsbD0idXJsKCNrbGV2ZXItZ3JhZCkiLz4KICAgIDx0ZXh0IHg9IjY0IiB5PSI4OCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjU2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SzwvdGV4dD4KICA8L3N2Zz4=`;
export function createKleverConnector() {
    const meta = {
        id: 'klever',
        name: 'Klever Wallet',
        icon: KLEVER_ICON,
        installUrl: {
            chrome: 'https://chromewebstore.google.com/detail/klever-wallet/dmbhmpbmpcijplojmbcnmkfgejocaoap',
        },
        platforms: ['browser-extension'],
    };
    const capabilities = {
        signTransaction: true,
        signAuthEntry: true,
        signMessage: true,
        submit: false,
    };
    /** Gets the Klever Stellar API from window, or null if not installed. */
    function getKlever() {
        if (typeof window === 'undefined')
            return null;
        const kw = window.kleverWallet;
        return kw?.stellar ?? null;
    }
    const connector = {
        id: meta.id,
        meta,
        capabilities,
        async getReachability() {
            const klever = getKlever();
            if (!klever)
                return 'not-installed';
            return 'available';
        },
        async connect(_opts) {
            return withNormalizedError(meta.id, async () => {
                const klever = getKlever();
                if (!klever) {
                    throw ConnectError.invalidRequest('Klever Wallet is not installed.', undefined, meta.id);
                }
                const result = await klever.getAddress();
                if (!result.address) {
                    throw ConnectError.internal('Klever returned no address.', undefined, meta.id);
                }
                return { address: result.address, walletId: meta.id };
            });
        },
        async disconnect() {
            // Klever has no disconnect method — no persistent connection to clean up.
        },
        async getAddress() {
            const klever = getKlever();
            if (!klever)
                return { address: '' };
            try {
                const result = await klever.getAddress();
                return { address: result.address };
            }
            catch {
                return { address: '' };
            }
        },
        async getNetwork() {
            const klever = getKlever();
            if (!klever)
                return { network: '', networkPassphrase: '' };
            try {
                return await klever.getNetwork();
            }
            catch {
                return { network: '', networkPassphrase: '' };
            }
        },
        async signTransaction(xdr, signOpts) {
            return withNormalizedError(meta.id, async () => {
                const klever = getKlever();
                if (!klever) {
                    throw ConnectError.invalidRequest('Klever Wallet is not installed.', undefined, meta.id);
                }
                const result = await klever.signTransaction(xdr, {
                    networkPassphrase: signOpts?.networkPassphrase,
                    address: signOpts?.address,
                });
                if (!result.signedTxXdr) {
                    throw ConnectError.internal('Klever returned no signed XDR.', undefined, meta.id);
                }
                return {
                    signedTxXdr: result.signedTxXdr,
                    signerAddress: result.signerAddress ?? signOpts?.address ?? '',
                };
            });
        },
        async signAuthEntry(authEntryXdr, signOpts) {
            return withNormalizedError(meta.id, async () => {
                const klever = getKlever();
                if (!klever) {
                    throw ConnectError.invalidRequest('Klever Wallet is not installed.', undefined, meta.id);
                }
                const result = await klever.signAuthEntry(authEntryXdr, {
                    networkPassphrase: signOpts?.networkPassphrase,
                    address: signOpts?.address,
                });
                if (!result.signedAuthEntry) {
                    throw ConnectError.internal('Klever returned no signed auth entry.', undefined, meta.id);
                }
                return {
                    signedAuthEntry: result.signedAuthEntry,
                    signerAddress: result.signerAddress ?? signOpts?.address ?? '',
                };
            });
        },
        async signMessage(message, signOpts) {
            return withNormalizedError(meta.id, async () => {
                const klever = getKlever();
                if (!klever) {
                    throw ConnectError.invalidRequest('Klever Wallet is not installed.', undefined, meta.id);
                }
                const result = await klever.signMessage(message, {
                    address: signOpts?.address,
                });
                if (!result.signedMessage) {
                    throw ConnectError.internal('Klever returned no signed message.', undefined, meta.id);
                }
                return {
                    signedMessage: result.signedMessage,
                    signerAddress: result.signerAddress ?? signOpts?.address ?? '',
                    // Klever's signMessage returns the signature as a string.
                    // We surface signedData as base64 of the raw message bytes for
                    // the multi-candidate SIWS verifier (same as xBull's approach).
                    signedData: Buffer.from(message, 'utf-8').toString('base64'),
                };
            });
        },
    };
    return connector;
}
//# sourceMappingURL=klever.js.map