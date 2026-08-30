import { ConnectError, resolveNetworkPassphrase } from '../types.js';
import { withNormalizedError } from './error-utils.js';
/** Stellar BIP-44 path prefix: m/44'/148'/index' */
const STELLAR_PATH_PREFIX = "m/44'/148'";
/** Derives the full BIP-44 path for a given account index. */
function pathForIndex(index) {
    return `${STELLAR_PATH_PREFIX}/${index}'`;
}
export function createTrezorConnector(options) {
    const accountCount = options.accountCount ?? 5;
    const meta = {
        id: 'trezor',
        name: 'Trezor',
        // Pre-encoded base64 literal (computed once, not per-factory-call) — keeps
        // the factory import-safe on runtimes without a global Buffer polyfill.
        icon: `data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTI4IDEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgICA8cmVjdCB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgcng9IjI4IiBmaWxsPSIjMUExQTFBIi8+CiAgICAgICAgPHJlY3QgeD0iMzAiIHk9IjIwIiB3aWR0aD0iNjgiIGhlaWdodD0iODgiIHJ4PSI4IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iNCIvPgogICAgICAgIDxyZWN0IHg9IjQyIiB5PSIzNiIgd2lkdGg9IjQ0IiBoZWlnaHQ9IjQ0IiByeD0iNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMiLz4KICAgICAgICA8Y2lyY2xlIGN4PSI2NCIgY3k9IjU4IiByPSI2IiBmaWxsPSIjZmZmIi8+CiAgICAgICAgPHJlY3QgeD0iNTYiIHk9IjcwIiB3aWR0aD0iMTYiIGhlaWdodD0iNCIgcng9IjIiIGZpbGw9IiNmZmYiLz4KICAgICAgPC9zdmc+`,
        installUrl: {},
        platforms: ['hardware'],
    };
    const capabilities = {
        signTransaction: true,
        signAuthEntry: false,
        signMessage: false,
        submit: false,
    };
    let trezorReady = false;
    let cachedAccounts = [];
    /** Lazily initializes Trezor Connect (called once on first use). */
    async function initTrezor() {
        if (trezorReady)
            return true;
        try {
            const TrezorConnectModule = await import('@trezor/connect-web');
            const TrezorConnect = TrezorConnectModule.default ?? TrezorConnectModule;
            await TrezorConnect.init({
                manifest: {
                    appName: options.appName,
                    appUrl: options.appUrl,
                    email: options.email,
                },
                debug: options.debug ?? false,
                lazyLoad: options.lazyLoad ?? false,
            });
            trezorReady = true;
            return true;
        }
        catch {
            return false;
        }
    }
    /** Gets the Trezor Connect instance (after init). */
    async function getTrezor() {
        if (!await initTrezor())
            return null;
        const mod = await import('@trezor/connect-web');
        return mod.default ?? mod;
    }
    const connector = {
        id: meta.id,
        meta,
        capabilities,
        async getReachability() {
            // Trezor Connect is always "available" — the actual device check
            // happens when the user tries to connect. If no device is plugged in,
            // the Trezor popup will show an error.
            return 'available';
        },
        async connect(_opts) {
            return withNormalizedError(meta.id, async () => {
                const TrezorConnect = await getTrezor();
                if (!TrezorConnect) {
                    throw ConnectError.invalidRequest('Failed to initialize Trezor Connect.', undefined, meta.id);
                }
                // Get the first account (index 0)
                const result = await TrezorConnect.stellarGetAddress({
                    path: pathForIndex(0),
                    showOnTrezor: true,
                });
                if (!result.success) {
                    const error = 'error' in result.payload ? result.payload.error : 'Unknown error';
                    throw ConnectError.rejected(meta.id);
                }
                const address = result.payload.address;
                return { address, walletId: meta.id };
            });
        },
        async disconnect() {
            // No persistent connection to clean up
        },
        async getAddress() {
            // Return empty — the real address is obtained via connect()
            return { address: '' };
        },
        async getNetwork() {
            return { network: '', networkPassphrase: '' };
        },
        async listAccounts() {
            return withNormalizedError(meta.id, async () => {
                const TrezorConnect = await getTrezor();
                if (!TrezorConnect) {
                    throw ConnectError.invalidRequest('Failed to initialize Trezor Connect.', undefined, meta.id);
                }
                // Build bundle of paths for account discovery
                const bundle = Array.from({ length: accountCount }, (_, i) => ({
                    path: pathForIndex(i),
                    showOnTrezor: false,
                }));
                const result = await TrezorConnect.stellarGetAddress({ bundle });
                if (!result.success) {
                    throw ConnectError.internal('Trezor account discovery failed.', undefined, meta.id);
                }
                const addresses = result.payload;
                cachedAccounts = addresses.map((item, i) => ({
                    address: item.address,
                    label: `Account #${i + 1}`,
                }));
                return cachedAccounts;
            });
        },
        async signTransaction(xdr, signOpts) {
            return withNormalizedError(meta.id, async () => {
                const TrezorConnect = await getTrezor();
                if (!TrezorConnect) {
                    throw ConnectError.invalidRequest('Failed to initialize Trezor Connect.', undefined, meta.id);
                }
                // Determine the signing path
                let path;
                let account;
                if (signOpts?.address) {
                    // Find the index for this address
                    const accountIdx = cachedAccounts.findIndex(a => a.address === signOpts.address);
                    if (accountIdx === -1) {
                        throw ConnectError.invalidRequest('Address not found in Trezor account list. Call listAccounts() first.', undefined, meta.id);
                    }
                    path = pathForIndex(accountIdx);
                    account = signOpts.address;
                }
                else {
                    // Default to account 0
                    path = pathForIndex(0);
                    // Get address for this path
                    const addrResult = await TrezorConnect.stellarGetAddress({ path, showOnTrezor: false });
                    if (!addrResult.success) {
                        throw ConnectError.internal('Failed to get address from Trezor.', undefined, meta.id);
                    }
                    account = addrResult.payload.address;
                }
                const networkPassphrase = signOpts?.networkPassphrase ?? resolveNetworkPassphrase('PUBLIC') ?? '';
                // Import stellar-sdk Transaction + Trezor's transformTransaction
                const [{ Transaction }, { transformTransaction }] = await Promise.all([
                    import('@stellar/stellar-sdk'),
                    import('@trezor/connect-plugin-stellar'),
                ]);
                const tx = new Transaction(xdr, networkPassphrase);
                const parsedTx = transformTransaction(path, tx);
                const signResult = await TrezorConnect.stellarSignTransaction(parsedTx);
                if (!signResult.success) {
                    const error = 'error' in signResult.payload ? signResult.payload.error : 'Unknown error';
                    throw ConnectError.internal(`Trezor signing failed: ${error}`, undefined, meta.id);
                }
                const hexSig = signResult.payload.signature;
                // Convert hex signature to base64 for Transaction.addSignature
                const b64Sig = Buffer.from(hexSig, 'hex').toString('base64');
                tx.addSignature(account, b64Sig);
                return {
                    signedTxXdr: tx.toXDR(),
                    signerAddress: account,
                };
            });
        },
        async signAuthEntry() {
            throw ConnectError.invalidRequest('Trezor does not support signing Soroban auth entries.', undefined, meta.id);
        },
        async signMessage() {
            throw ConnectError.invalidRequest('Trezor does not support message signing.', undefined, meta.id);
        },
    };
    return connector;
}
//# sourceMappingURL=trezor.js.map