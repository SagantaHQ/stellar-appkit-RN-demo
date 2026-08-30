/**
 * AsyncStorage-backed `ConnectStorage` for Stellar AppKit on React Native.
 *
 * Core's default storage is `localStorage` — which doesn't exist on React
 * Native, silently turning every write into a no-op (sessions never persist).
 * Pass this adapter instead:
 *
 * ```ts
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * import { createAsyncStorage } from '@saganta/stellar-appkit-react-native';
 *
 * const appkit = new StellarAppKit({
 *   network: 'TESTNET',
 *   storage: createAsyncStorage(AsyncStorage),
 *   ...
 * });
 * ```
 *
 * `ConnectStorage`'s three methods may return Promises by design, so an
 * async adapter is a first-class citizen — no polling, no shimming
 * `global.localStorage`.
 */
/**
 * Wraps any AsyncStorage-shaped key/value store as a core `ConnectStorage`.
 * JSON values are stored as-is — core already serializes everything it
 * persists, so no extra encoding happens here.
 */
export function createAsyncStorage(storage) {
    return {
        async getItem(key) {
            return storage.getItem(key);
        },
        async setItem(key, value) {
            await storage.setItem(key, value);
        },
        async removeItem(key) {
            await storage.removeItem(key);
        },
    };
}
/**
 * In-memory storage — sessions live exactly as long as the app process.
 * Useful for tests, for demos, or as an explicit "don't persist anything"
 * choice on RN.
 */
export function createMemoryStorage() {
    const map = new Map();
    return {
        getItem: (key) => Promise.resolve(map.get(key) ?? null),
        setItem: (key, value) => {
            map.set(key, value);
            return Promise.resolve();
        },
        removeItem: (key) => {
            map.delete(key);
            return Promise.resolve();
        },
    };
}
//# sourceMappingURL=storage.js.map