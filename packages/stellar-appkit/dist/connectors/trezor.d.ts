import type { WalletConnector } from '../types.js';
/**
 * Trezor hardware wallet connector.
 *
 * Uses `@trezor/connect-web` + `@trezor/connect-plugin-stellar` to communicate
 * with a Trezor device via WebUSB/WebHID.
 *
 * **Requires manual install of peer deps.** As of v1.9.19, the Trezor packages
 * are declared as *optional* peer dependencies — they are NOT installed
 * automatically by `npm install @saganta/stellar-appkit`. This is because
 * `@trezor/utils` (a transitive dep of `@trezor/connect-web`) has an
 * inconsistent `exports` map that breaks strict bundlers (webpack 5, Rollup,
 * esbuild strict mode, bundlephobia) — see GitHub issue. Apps that want Trezor
 * support must install the packages themselves:
 *
 * ```bash
 * npm install @trezor/connect-web @trezor/connect-plugin-stellar
 * ```
 *
 * **Requires constructor params** — Trezor Connect mandates a manifest
 * (appName, appUrl, email). Not included in `defaultConnectors()` — create
 * explicitly:
 *
 * ```ts
 * import { createTrezorConnector } from '@saganta/stellar-appkit';
 *
 * const trezor = createTrezorConnector({
 *   appName: 'My App',
 *   appUrl: 'https://app.example.com',
 *   email: 'dev@example.com',
 * });
 * ```
 *
 * Limitations:
 * - No `signMessage` — Trezor doesn't support arbitrary message signing
 * - No `signAuthEntry` — Trezor doesn't support Soroban auth entry signing
 * - No `getNetwork` — network is passed as a parameter to signTransaction
 * - Requires Buffer polyfill in the host app
 *
 * @see https://www.trezor.com/
 * @see https://github.com/Creit-Tech/Stellar-Wallets-Kit (trezor.module.ts)
 */
export interface TrezorConnectorOptions {
    /** App name shown in the Trezor Connect popup. Required by Trezor. */
    appName: string;
    /** App URL shown in the Trezor Connect popup. Required by Trezor. */
    appUrl: string;
    /** Developer email for Trezor Connect. Required by Trezor. */
    email: string;
    /** Enable debug mode. Default: false. */
    debug?: boolean;
    /** Lazy-load Trezor Connect. Default: false. */
    lazyLoad?: boolean;
    /** How many accounts listAccounts() derives. Default: 5. */
    accountCount?: number;
}
export declare function createTrezorConnector(options: TrezorConnectorOptions): WalletConnector;
//# sourceMappingURL=trezor.d.ts.map